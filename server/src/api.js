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
    const data = req.fields;
    console.log(data);
    res.send('TODO');
});

module.exports = router;