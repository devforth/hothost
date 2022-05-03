const express = require('express');
const router = express.Router();

const prisma = require('./prisma');

router.post('/data/:secret', async (req, res) => {
    const data = req.fields;
    console.log(data);
    res.send('TODO');
});

module.exports = router;