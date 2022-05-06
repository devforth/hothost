import express from 'express';

import env from './env.js';
import database from './database.js';
import {
    sizeFormat,
    authorizeUser,
    mustBeAuthorizedView,
    mustNotBeAuthorizedView,
} from './utils.js';
import PluginManagerSingleton from './pluginManager.js';
import md from 'markdown-it';


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
                secret: req.user && data.secret,
                icon_name: getIconName(data.HOST_OS_NAME),
                online: (data.updatedAt + (+data.MONITOR_INTERVAL * 1000 * 1.3)) >= new Date().getTime(),
                hostname: data.HOST_NAME,
                public_ip: data.HOST_PUBLIC_IP,
                os_name: data.HOST_OS_NAME,
                os_version: ifUnknown(data.HOST_OS_VERSION, data.SYSTEM_KERNEL_VERSION, data.HOST_OS_VERSION),
                cpu_name: `${data.SYSTEM_CPU_MODEL}`,
                cpu_count: data.SYSTEM_CPU_LOGICAL_CPU_COUNT,
                ram_total: ifUnknown(data.SYSTEM_TOTAL_RAM, "unknown", sizeFormat(data.SYSTEM_TOTAL_RAM)),
                ram_used: ((((+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) / +data.SYSTEM_TOTAL_RAM) * 100) || 0).toFixed(0),
                swap_total: ifUnknown(data.SYSTEM_TOTAL_SWAP, "unknown", sizeFormat(data.SYSTEM_TOTAL_SWAP)),
                swap_used: ((((+data.SYSTEM_TOTAL_SWAP - +data.SYSTEM_FREE_SWAP) / +data.SYSTEM_TOTAL_SWAP) * 100) || 0).toFixed(0),
                disk_total: sizeFormat(+data.DISK_AVAIL + +data.DISK_USED),
                disk_used: ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100).toFixed(0),
                disk_warning: ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100) > 80,
            }
        )
    );
}

router.get('/', mustBeAuthorizedView(async (req, res) =>  {
    res.locals.monitoringData = await getMonitoringData(req);
    res.render('home');
}));

router.get('/public', async (req, res) => {
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
    res.locals.plugins = PluginManagerSingleton().plugins;
    res.render('plugins');
}));

router.get('/plugin/:slug/', mustBeAuthorizedView((req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(p => p.id === req.params.slug);
    if (!plugin.descriptionFull) {
        plugin.descriptionFull = md().render(plugin.longDescriptionMD);
    }
    res.locals.params = [   
            ...plugin.supportedEvents.map((e) => {
                return {
                    id: e,
                    value: true,
                    name: `Notify on ${e}`,
                    type: 'bool',
                    inputName: `events[${e}]`
                }
            }),
            ...plugin.params.map((p) => {
                return {
                    ...p,
                    value: p.default_value,
                    inputName: `params[${p.id}]`
                }
            }),
        ];
        
    res.locals.descriptionFull = plugin.descriptionFull;
    res.render('plugin');
}));

router.get('/users/', mustBeAuthorizedView((req, res) => res.render('users')));
router.post('/users/', mustBeAuthorizedView((req, res) => {

}));

export default router;