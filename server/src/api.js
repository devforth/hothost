import { v4 as uuidv4 } from 'uuid';
import express from 'express';

import database from './database.js';
import { mustBeAuthorizedView, readableRandomStringMaker } from './utils.js';

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
        database.data.monitoringData[index] = { ...database.data.monitoringData[index], ...data };
        database.data.monitoringData[index].updatedAt = new Date().getTime();
        await database.write();

        res.send('OK');
    }
});

export default router;