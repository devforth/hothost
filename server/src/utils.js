import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import humanizeDuration from 'humanize-duration';

import env from './env.js';
import database from './database.js';
import PluginManager from './pluginManager.js';

export const DATE_HUMANIZER_CONFIG = {
    round: true,
    language: "shortEn",
    languages: {
      shortEn: {
        y: () => "y",
        mo: () => "mo",
        w: () => "w",
        d: () => "d",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
      }}};

export const checkUserExistsOrCreate = async () => {
    if (database.data.users.length === 0) {
        database.data.users.push({
            id: uuidv4(),
            username: env.WEB_ADMIN_USERNAME,
            password: md5(env.WEB_ADMIN_PASSWORD),
            createdAt: new Date().toDateString(),
        });
        await database.write();
    }
};
export const authorizeUser = async (username, password) => {
    const passwordHash = md5(password);
    const user = await database.data.users.find(
        user => user.username === username && user.password === passwordHash
    );
    if (user) {
        return jwt.sign({
            id: user.id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        }, env.WEB_JWT_SECRET);
    } else {
        throw new Error('Invalid username or password');
    }
};
export const mustNotBeAuthorizedView = (callback) => {
    return (req, res) => {
        if (req.user) res.redirect(req.query.next || '/');
        else callback(req, res);
    };
};
export const mustBeAuthorizedView = (callback) => {
    return (req, res) => {
        if (!req.user) res.redirect(`/login/?next=${req.path}`);
        else callback(req, res);
    };
};
export const sizeFormat = (a) => {
    let value = parseInt(a);
    for (let unit of ['B', 'KiB', 'MiB', 'GiB', 'TiB']) {
        if (Math.abs(value) < 1024) {
            return `${value.toFixed(2)} ${unit}`;
        }

        value /= 1024;
    }

    return `${value.toFixed(2)} PiB`;
};
export const readableRandomStringMaker = (length) => {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 62 | 0)) ;
    return s;
};

export const calculateEvent = (prevTrigger, newTrigger, eventOnValue, eventOffValue) => {
    if (prevTrigger !== newTrigger) {
        if (newTrigger) return eventOnValue;
        else return eventOffValue;
    }
    return null;
};

export const calculateWarning = (usage, lastEvent, threshold, stabilizationLvl) => {
    const onEventBound = threshold + stabilizationLvl;
    const offEventBound = threshold - stabilizationLvl;

    if(usage  > onEventBound) {
        return true;
    } else if (usage < offEventBound) {
        return false;
    } else if (usage <= onEventBound && usage >= offEventBound) {
        return lastEvent;
    }
}

export const calculateDataEvent = (prevData, newData) => {
    const events = [];
    const { RAM_THRESHOLD, RAM_STABILIZATION_LEVEL, DISK_THRESHOLD, DISK_STABILIZATION_LEVEL } = database.data.settings;

    const calculateDiskWarning = (data) => {
        const diskUsage = ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100);
        const warning = calculateWarning(diskUsage, data.last_disk_event, DISK_THRESHOLD, DISK_STABILIZATION_LEVEL);

        data.last_disk_event = warning;
        return warning;
    }
    const calculateRamWarning = (data) => {
        const ramUsage =  (((+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) / +data.SYSTEM_TOTAL_RAM) * 100);
        const warning = calculateWarning(ramUsage, data.last_ram_event, RAM_THRESHOLD, RAM_STABILIZATION_LEVEL);
        
        data.last_ram_event = warning;
        return warning;
    }

    const diskSpaceEvent = calculateEvent(
        calculateDiskWarning(prevData),
        calculateDiskWarning(newData),
        'disk_is_almost_full',
        'disk_usage_recovered',
    );
    events.push(diskSpaceEvent);

    const ramEvent = calculateEvent(
        calculateRamWarning(prevData),
        calculateRamWarning(newData),
        'ram_is_almost_full',
        'ram_usage_recovered',
    );
    events.push(ramEvent);

    if (!prevData.online && newData.online) {
        events.push('host_is_online');
    }

    return events.filter(e => e);
};

export const calculateAsyncEvents = async () => {
    await Promise.all(database.data.monitoringData.map((data) => {
        const events = [];
        const online = (data.updatedAt + (+data.MONITOR_INTERVAL * 1000 * 1.3)) >= new Date().getTime();
        if (!online && data.online)  {
            events.push('host_is_offline');
            data.online = false;
            data.ONLINE_EVENT_TS = new Date().getTime();
        }
        PluginManager().handleEvents(events.filter(e => e), 
        {
            HOST_NAME: data.HOST_NAME,
            HOST_LABEL: (data.HOST_LABEL && data.HOST_LABEL !== '') ? `\`${data.HOST_LABEL}\`` : '',
        });
    }));
};

export const parseNestedForm = (fields) => {
    return Object.keys(fields).reduce((acc, key) => {
        const nestedStartIndex = key.indexOf('[');

        if (nestedStartIndex !== -1) {
            const rootKey = key.substring(0, nestedStartIndex);
            const nestedKeys = key.substring(nestedStartIndex + 1, key.length - 1).split('][');
            const lastKey = nestedKeys.pop();

            acc[rootKey] ||= {};
            const lastObj = nestedKeys.reduce((acc, nestedKey) => {
                acc[nestedKey] ||= {};
                return acc[nestedKey];
            }, acc[rootKey]);
            lastObj[lastKey] = fields[key];
        } else {
            acc[key] = fields[key];
        }
        return acc;
    }, {});
};

export const eventDuration = (data, events) => {
    if (!data) {
        return;
    }
    const now = new Date().getTime();
    let duration;
    switch(events[0]) {
        case 'host_is_online':
            duration = now - data.ONLINE_EVENT_TS;
            break;
        case 'ram_usage_recovered':
            duration = now - data.RAM_EVENT_TS;
            break;
        case 'disk_usage_recovered':
            duration = now - data.DISK_EVENT_TS;
            break;
    }

    return humanizeDuration(duration, DATE_HUMANIZER_CONFIG);
}

export const setWarning = (data, prevData) => {
    const {RAM_THRESHOLD, DISK_THRESHOLD} = database.data.settings;
    const isRamWarning =  ((+data.SYSTEM_FREE_RAM / +data.SYSTEM_TOTAL_RAM) * 100) < 100 - RAM_THRESHOLD;
    const isDiskWarning = ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100) > DISK_THRESHOLD;

    if(isRamWarning && !prevData.last_ram_event){
        data.RAM_EVENT_TS = new Date().getTime();
    }
    if(isDiskWarning && !prevData.last_disk_event){
        data.DISK_EVENT_TS = new Date().getTime();
    }
}