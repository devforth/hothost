import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import md5 from 'md5';

import database from './database.js';
import { calculateDataEvent, mustBeAuthorizedView, readableRandomStringMaker, sizeFormat } from './utils.js';
import PluginManager from './pluginManager.js';
import env from './env.js';
import { eventDuration, setWarning } from './utils.js';

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
        setWarning(data, dataItem);
        const newData = {
            ...dataItem,
            ...data,
            updatedAt: new Date().getTime(),
            online: true,
        };
        // for testing
        // const DIST_TOTAL = +newData.DISK_AVAIL + +newData.DISK_USED;
        // const DISK_USED_PERCENT = 0.87;
        // newData.DISK_AVAIL = DIST_TOTAL * ( 1 - DISK_USED_PERCENT );
        // newData.DISK_USED = DIST_TOTAL * DISK_USED_PERCENT;

        // const RAM_USED_PERCENT = 0.80;
        // newData.SYSTEM_FREE_RAM = +newData.SYSTEM_TOTAL_RAM * (1 - RAM_USED_PERCENT);

        const events = calculateDataEvent(database.data.monitoringData[index], newData);
        await PluginManager().handleEvents(events, {
            ...newData,
            // variables which might be used in template
            DISK_USED: sizeFormat(+newData.DISK_USED),
            DISK_TOTAL: sizeFormat(+newData.DISK_USED + +newData.DISK_AVAIL),
            RAM_USED: sizeFormat(+newData.SYSTEM_TOTAL_RAM - +newData.SYSTEM_FREE_RAM),
            RAM_TOTAL: sizeFormat(+newData.SYSTEM_TOTAL_RAM),
            HOST_LABEL: (newData.HOST_LABEL && newData.HOST_LABEL !== '') ? `\`${newData.HOST_LABEL}\`` : '',
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

    const monData = database.data.monitoringData.find(el => el.id === id);

    if (monData) {
        monData.HOST_LABEL = label.trim();;
        await database.write();
    }
    res.redirect('/');
}))

router.post('/edit_settings', mustBeAuthorizedView( async(req,res) => { 
    const {disk_threshold, disk_stabilization_lvl, ram_threshold, ram_stabilization_lvl} = req.fields;
    
    database.data.settings = {
        RAM_THRESHOLD: +ram_threshold,
        RAM_STABILIZATION_LEVEL: +ram_stabilization_lvl,
        DISK_THRESHOLD:  +disk_threshold,
        DISK_STABILIZATION_LEVEL: +disk_stabilization_lvl
    }
    res.redirect('/settings');
}))

export default router;