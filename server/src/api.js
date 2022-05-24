import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import md5 from 'md5';

import database from './database.js';
import { calculateDataEvent, mustBeAuthorizedView, readableRandomStringMaker, sizeFormat } from './utils.js';
import PluginManager from './pluginManager.js';
import env from './env.js';
import { eventDuration } from './utils.js';

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
            online: true,
        };
        // for testing
        // newData.DISK_AVAIL = Math.round(Math.random()) * 10_0000000000000;
        // newData.SYSTEM_FREE_RAM = 0;
        const events = calculateDataEvent(database.data.monitoringData[index], newData);
        await PluginManager().handleEvents(events, {
            ...newData,
            // variables which might be used in templete
            DISK_USED: sizeFormat(+newData.DISK_USED),
            DISK_TOTAL: sizeFormat(+newData.DISK_USED + +newData.DISK_AVAIL),
            RAM_USED: sizeFormat(+newData.SYSTEM_TOTAL_RAM - +newData.SYSTEM_FREE_RAM),
            RAM_TOTAL: sizeFormat(+newData.SYSTEM_TOTAL_RAM),
            EVENT_DURATION: eventDuration(newData, events)
        });
        database.data.monitoringData[index] = newData;
        await database.write();

        res.send('OK');
    }
});

router.post('/add_user', mustBeAuthorizedView( async(req,res) => {
    const user = req.fields;
    const {users} = database.data;
    const existedLogin = users.findIndex(el => el.username === user.username);

    if (existedLogin === -1) {
        users.push({
            id: uuidv4(),
            username: user.username,
            password: md5(user.password),
            createdAt: new Date().toDateString(),
        })
        await database.write();
    } else {
        res.statusCode = 400;
    }

    res.redirect('/users/')
}
));

router.post('/remove_user', mustBeAuthorizedView( async(req, res) => {
    const {id} = req.query;
    const {users} = database.data;
    
    const index = users.findIndex(el => el.id === id);
    users.splice(index, 1);
    await database.write();
    res.redirect('/users/');
}))

router.post('/remove_host', mustBeAuthorizedView( async(req,res) => {
    const {id} = req.query;

    const index = database.data.monitoringData.findIndex(host => host.id === id);
    if (index !== -1) {
        database.data.monitoringData.splice(index, 1);
        await database.write();
    }
    res.redirect('/');
}))

router.post('/add_label', mustBeAuthorizedView( async(req,res) => {
    const {id} = req.query;
    const {label} = req.fields;

    const index = database.data.monitoringData.findIndex(el => el.id === id);

    if (index !== -1) {
        database.data.monitoringData[index].HOST_LABEL = label;
        await database.write();
    }
    res.redirect('/');
}))

export default router;