const uuid = require('uuid');
const express = require('express');

const prisma = require('./prisma');
const { mustBeAuthorizedView, readableRandomStringMaker } = require('./utils');

const router = express.Router();



router.post('/add_monitor', mustBeAuthorizedView(async (req, res) => {
    const id = uuid.v4();

    const now = new Date();

    const secret = readableRandomStringMaker(64);
    await prisma.monitoringData.create({ data: { id, createdAt: now, updatedAt: now, secret } });

    res.redirect('/');
}));


router.post('/remove_monitor', mustBeAuthorizedView(async (req, res) => {
    const { id } = req.query;
    await prisma.monitoringData.delete({ where: { id } });

    res.redirect('/');
}));


router.post('/data/:secret', async (req, res) => {
    const monitorData = req.fields;
    const md = await prisma.monitoringData.findUnique({ where: { secret: req.params.secret } });
    if (!md) {
        res.statusCode = 401;
        res.send('Unauthorized');
    } else {
        const data = Object.keys(monitorData).reduce((acc, key) => {
            const value = monitorData[key];
            acc[key] = value !== undefined && value !== null ? value.toString() : value;
            return acc;
        }, {});
        await prisma.monitoringData.update({ data, where: { secret: req.params.secret } });
        res.send('OK');
    }
});

module.exports = router;