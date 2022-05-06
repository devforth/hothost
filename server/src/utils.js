import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import env from './env.js';
import database from './database.js';

export const checkUserExistsOrCreate = async () => {
    if (database.data.users.length === 0) {
        database.data.users.push({
            id: uuidv4(),
            username: env.WEB_ADMIN_USERNAME,
            password: md5(env.WEB_ADMIN_PASSWORD),
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

export const calculateDataEvent = (prevData, newData) => {
    const events = [];

    const calculateEvent = (prevTrigger, newTrigger, eventOnValue, eventOffValue) => {
        if (prevTrigger !== newTrigger) {
            if (newTrigger) return eventOnValue;
            else return eventOffValue;
        }
        return null;
    };

    const calculateDiskWarning = (data) => ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100) > 80;

    const diskSpaceEvent = calculateEvent(
        calculateDiskWarning(prevData),
        calculateDiskWarning(newData),
        'disk_is_almost_full',
        'disk_usage_recovered',
    );
    events.push(diskSpaceEvent);

    return events.filter(e => e);
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