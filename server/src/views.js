import express from 'express';

import env from './env.js';
import database from './database.js';
import {
    sizeFormat,
    authorizeUser,
    parseNestedForm,
    mustBeAuthorizedView,
    mustNotBeAuthorizedView,
    roundToNearestMinute,
} from './utils.js';
import PluginManagerSingleton from './pluginManager.js';
import md from 'markdown-it';
import db from './levelDB.js';


const router = express.Router();
router.use(express.static('static'));

const getIconName = (osName) => {
    const icons = {
        'arch linux': 'arch',
        'ubuntu': 'ubuntu',
    };

    return icons[osName?.toLowerCase()] ?? 'unknown';
};

const ifUnknown = (value, trueValue, falseValue) => {
    return value === "unknown" ? trueValue : falseValue;
};

const getMonitoringData = async (req) => {
    const {RAM_THRESHOLD, DISK_THRESHOLD} = database.data.settings;
    const monitoringData = database.data.monitoringData
        // Return all if user logged in or only those that have data
        .filter((data) => req.user || data.createdAt !== data.updatedAt)
        .sort((a, b) => b.createdAt - a.createdAt);

    return monitoringData
        .map(data => (
            data.createdAt === data.updatedAt ?
            {
                id: data.id,
                no_data: true,
                secret: req.user && data.secret,
            } :
            {
                id: data.id,
                secret: req.user && data.secret,
                icon_name: getIconName(data.HOST_OS_NAME),
                online: (data.updatedAt + (+data.MONITOR_INTERVAL * 1000 * 1.3)) >= new Date().getTime(),
                online_event_ts: data.ONLINE_EVENT_TS,
                ram_event_ts: data.RAM_EVENT_TS,
                disk_event_ts: data.DISK_EVENT_TS,
                hostname: data.HOST_NAME,
                label: data.HOST_LABEL,
                public_ip: data.HOST_PUBLIC_IP,
                country: data.HOST_PUBLIC_IP_COUNTRY,
                os_name: data.HOST_OS_NAME,
                os_version: ifUnknown(data.HOST_OS_VERSION, data.SYSTEM_KERNEL_VERSION, data.HOST_OS_VERSION),
                cpu_name: `${data.SYSTEM_CPU_MODEL}`,
                cpu_count: data.SYSTEM_CPU_LOGICAL_CPU_COUNT,
                ram_total: ifUnknown(data.SYSTEM_TOTAL_RAM, "unknown", sizeFormat(data.SYSTEM_TOTAL_RAM)),
                ram_used_percentage: ((((+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) / +data.SYSTEM_TOTAL_RAM) * 100) || 0).toFixed(0),
                ram_used: sizeFormat(+(+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) || 0),
                ram_warning: ((+data.SYSTEM_FREE_RAM / +data.SYSTEM_TOTAL_RAM) * 100) < 100 - RAM_THRESHOLD,
                isSwap: (!!data.SYSTEM_TOTAL_SWAP && data.SYSTEM_TOTAL_SWAP !== '0'),
                swap_total: ifUnknown(data.SYSTEM_TOTAL_SWAP, "unknown", sizeFormat(data.SYSTEM_TOTAL_SWAP)),
                swap_used: ((((+data.SYSTEM_TOTAL_SWAP - +data.SYSTEM_FREE_SWAP) / +data.SYSTEM_TOTAL_SWAP) * 100) || 0).toFixed(0),
                disk_total: sizeFormat(+data.DISK_AVAIL + +data.DISK_USED),
                disk_used: ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100).toFixed(0),
                disk_warning: ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100) > DISK_THRESHOLD,
            }
        )
    );
}

const getSettings = () => {
    const settings = database.data.settings;
    return {
        ram_threshold: settings.RAM_THRESHOLD,
        ram_stabilization_lvl: settings.RAM_STABILIZATION_LEVEL,
        disk_threshold: settings.DISK_THRESHOLD,
        disk_stabilization_lvl:settings.DISK_STABILIZATION_LEVEL,
    }
}

const getHttpMonitor = () => {
    const data = database.data.httpMonitoringData;

    return data.map(data => (
         {
            id: data.id,
            url: data.URL,
            label: data.label,
            status: data.okStatus,
            lastEventTs: data.event_created,
        }))
}

router.get('/', mustBeAuthorizedView(async (req, res) =>  {
    res.locals.monitoringData = await getMonitoringData(req);
    res.render('home');
}));

router.get('/update', async (req,res) => {
    res.locals.monitoringData = await getMonitoringData(req);
    res.render('monitoring_table', {layout: false});
});

router.get('/http_update', async (req,res) => {
    res.locals.httpMonitoringData = getHttpMonitor(req);
    res.render('httpMonitoring_table', {layout: false});
});

router.get('/public', async (req, res) => {
    if (!env.WEB_BASIC_PUBLIC_PASSWORD || !env.WEB_BASIC_PUBLIC_USERNAME) {
        res.statusCode = 400;
        res.end();
        return ;
    }
    const basicAuth = 'Basic ' + Buffer.from(`${env.WEB_BASIC_PUBLIC_USERNAME}:${env.WEB_BASIC_PUBLIC_PASSWORD}`).toString('base64');
    if (req.headers['authorization'] !== basicAuth) {
        res.statusCode = 401;
        res.header('WWW-Authenticate', 'Basic realm="restricted"');
        res.end();
    } else {
        res.locals.monitoringData = await getMonitoringData(req);
        res.render('home');
    }
});

router.get('/login/', mustNotBeAuthorizedView((req, res) => res.render('login')));
router.post('/login/', mustNotBeAuthorizedView(async (req, res) => {
    try {
        const { username, password } = req.fields;
        if (username && password) {
            const jwtToken = await authorizeUser(username, password);
            res.cookie('__hhjwt', jwtToken, {
                maxAge: 60 * 60 * 1000,
                sameSite: 'Strict', // prevents from broader class of CSRF attacks then even Lax, no need in external CSRF handlers for 92.16% of browsers
                secure: false, // some users might have non-SSL sites, probably should go from ENV var which gives greenlight
            });
            res.redirect(req.query.next || '/');
        }
    } catch (e) {
        res.locals.error = e.message;
        res.render('login');
    }
}));

router.get('/plugins/', mustBeAuthorizedView((req, res) => {
    res.locals.plugins = PluginManagerSingleton().plugins.map((p) => {
        return {
            ...p,
            pluginEnabled: database.data.pluginSettings.find(ps => ps.id === p.id)?.enabled
        }
    }).reverse();
    res.render('plugins');
}));

router.get('/plugin/:id/', mustBeAuthorizedView((req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(p => p.id === req.params.id);

    if (!plugin) {
        res.redirect('/plugins/');
    } else {
        const pluginSettings = database.data.pluginSettings.find(ps => ps.id === plugin.id);
        res.locals.plugin = plugin;
        res.locals.pluginSettings = pluginSettings;
        res.locals.params = [
            ...plugin.supportedEvents.map((e) => {
                return {
                    id: e,
                    value: pluginSettings?.enabledEvents.includes(e) ?? true,
                    name: `Notify on ${e}`,
                    type: 'bool',
                    inputName: `events[${e}]`
                }
            }),
            ...plugin.params.map((p) => {
                const value = pluginSettings?.params[p.id];
                return {
                    ...p,
                    value: value || p.default_value,
                    inputName: `params[${p.id}]`,
                    required: p.required ?? true,
                }
            }),
        ];

        res.locals.descriptionFull = plugin.longDescriptionMD && md().render(plugin.longDescriptionMD);
        res.render('plugin');
    }
}));
router.post('/plugin/:id/', mustBeAuthorizedView(async (req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(p => p.id === req.params.id);

    if (!plugin) {
        res.redirect('/plugins/');
    } else {
        const input = parseNestedForm(req.fields);
        console.log(input);

        const psIndex = database.data.pluginSettings.findIndex(ps => ps.id === plugin.id);
        const newPluginSetting = {
            id: plugin.id,
            params: input.params,
            enabledEvents: Object.keys(input.events),
            enabled: true,
        };

        if (psIndex !== -1) {
            if (!database.data.pluginSettings[psIndex].enabled && newPluginSetting.enabled) {
                await plugin.onPluginEnabled?.();
            }
            database.data.pluginSettings[psIndex] = newPluginSetting;
            if (input.notify) {
                await plugin.sendMessage?.(newPluginSetting);
            }      
        } else {
            database.data.pluginSettings.push(newPluginSetting);
            await plugin.onPluginEnabled?.();
            if (input.notify) {
                await plugin.sendMessage?.(newPluginSetting);
            }
        }

        await database.write();
        res.status(200).send();
        // res.redirect('/plugins/');

    }
}));

router.post('/plugin/disable/:id/', mustBeAuthorizedView(async (req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(p => p.id === req.params.id);

    if (!plugin) {
        res.redirect('/plugins/');
    } else {
        const psIndex = database.data.pluginSettings.findIndex(ps => ps.id === plugin.id);
        const newPluginSetting = {
            enabled: false,
        };

        if (psIndex !== -1) {
            if (database.data.pluginSettings[psIndex].enabled) {
               await plugin.onPluginDisabled?.();
            }
            database.data.pluginSettings[psIndex] = newPluginSetting;
        }
        await database.write();
        res.redirect(`/plugins/`);
    }
}));

router.get('/users/', mustBeAuthorizedView((req, res) => {
    res.locals.userInfo = database.data.users;
    res.render('users')
}));

router.get('/settings', mustBeAuthorizedView((req, res) => {
    res.locals.settings = getSettings();
    res.render('settings')
}));

router.get('/http-monitor',  mustBeAuthorizedView((req, res) => {
    res.locals.httpMonitoringData = getHttpMonitor();
    res.render('httpMonitor');
}));

const generateProcessData = (data) => {
    const colors = ['#22d4bc', '#56AEE2', '#5668E2', '#8A56E2', '#CF56E2', '#E25668', '#E28956', '#E2CF56', '#AEE256', '#56E289'];
    let processEntries = [];
    let id = 0;
    for (const [key, value] of Object.entries(data)) {
        processEntries.push({
            id: id + 1,
            data: value,
            total_usage: key,
            ram_usage: sizeFormat(key*1024),
            color: colors[id]
        });
        id++;
    }
    return processEntries;
}

router.get('/getProcess/:id/:timeStep/', mustBeAuthorizedView( async (req, res) => {
    const {id, timeStep} = req.params;
    const minutesLeft = timeStep*1000*60;
    const now = new Date().getTime()
    const time = roundToNearestMinute(now - minutesLeft);
    
    const dbIndex = db.sublevel(id, { valueEncoding: 'json' });
    const dbHostState = db.sublevel('options', { valueEncoding: 'json' });

    const restartTime = await dbHostState.get(id)
        .then(res => res.restartTime)
        .catch(() => 0);

    const processByTime = await dbIndex.get(+time)
        .then(res => generateProcessData(res).reverse())
        .catch(err => []);

    res.json({
        restartTime: restartTime,
        process: processByTime,
    });
}));


export default router;