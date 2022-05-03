const uuid = require('uuid');
const express = require('express');

const prisma = require('./prisma');
const { mustBeAuthorizedView } = require('./utils');

const router = express.Router();

router.post('/add_monitor', mustBeAuthorizedView(async (req, res) => {
    const id = uuid.v4();

    await prisma.monitoringData.create({ data: { id } });

    res.redirect('/');
}));

router.post('/data/:secret', async (req, res) => {
    const monitorData = req.fields;
    console.log(monitorData);

    const md = await prisma.monitoringData.findUnique({ where: { id: req.params.secret } });
    if (!md) {
        res.statusCode = 401;
        res.send('Unauthorized');
    } else {
        const data = Object.keys(monitorData).reduce((acc, key) => {
            const value = monitorData[key];
            acc[key] = value !== undefined && value !== null ? value.toString() : value;
            return acc;
        }, {});
        await prisma.monitoringData.update({ data, where: { id: req.params.secret } });
        res.send('OK');
    }
});

module.exports = router;