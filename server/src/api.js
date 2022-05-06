import { v4 as uuidv4 } from 'uuid';
import express from 'express';

import database from './database.js';
import { calculateDataEvent, mustBeAuthorizedView, readableRandomStringMaker, sizeFormat } from './utils.js';
import PluginManager from './pluginManager.js';

const router = express.Router();

router.post('/add_monitor', mustBeAuthorizedView(async (req, res) => {
    const id = uuidv4();
    const now = new Date().getTime();
    const secret = readableRandomStringMaker(64);

    database.data.monitoringData.push({ id, createdAt: now, updatedAt: now, secret });
    await database.write();

    res.redirect('/');
}));


router.post('/remove_monitor', mustBeAuthorizedView(async (req, res) => {
    const { id } = req.query;

    const index = database.data.monitoringData.findIndex(md => md.id === id);
    if (index !== -1) {
        database.data.monitoringData.splice(index, 1);
        await database.write();
    }
    res.redirect('/');
}));

router.post('/logout', (req, res) => {
    res.cookie('__hhjwt', '', { maxAge: -1 });
    res.redirect('/login/');
});


router.post('/data/:secret', async (req, res) => {
    const monitorData = req.fields;

    const index = database.data.monitoringData.findIndex(md => md.secret === req.params.secret);
    if (index === -1) {
        res.statusCode = 401;
        res.send('Unauthorized');
    } else {
        const data = Object.keys(monitorData).reduce((acc, key) => {
            const value = monitorData[key];
            acc[key] = value !== undefined && value !== null ? value.toString() : value;
            return acc;
        }, {});

        const dataItem = database.data.monitoringData[index];
        const newData = {
            ...dataItem,
            ...data,
            updatedAt: new Date().getTime(),

            // variables which might be used in templete
            DISK_USED: sizeFormat(+dataItem.DISK_USED),
            DISK_TOTAL: sizeFormat(+dataItem.DISK_USED + +dataItem.DISK_AVAIL),
            RAM_USED: sizeFormat(+dataItem.SYSTEM_TOTAL_RAM - +dataItem.SYSTEM_FREE_RAM),
            RAM_TOTAL: sizeFormat(+dataItem.SYSTEM_TOTAL_RAM),
        };
        const events = calculateDataEvent(database.data.monitoringData[index], newData);
        await PluginManager().handleEvents(events, newData);
        database.data.monitoringData[index] = newData;
        await database.write();

        res.send('OK');
    }
});

export default router;