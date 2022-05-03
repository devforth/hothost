const express = require('express');
const router = express.Router();

const uuid = require('uuid');

const prisma = require('./prisma');

router.post('/data/', async (req, res) => {
    res.send('TODO');
});

router.get('/users/', async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, username: true },
    });

    res.send({ data: users });
    res.redirect('/users/');
});

router.post('/user/', async (req, res) => {
    const { username, password } = req.body;

    const userId = uuid.v4();
    const user = {
        id: userId,
        username: username,
        password: md5(password),
    };

    await prisma.user.create({ data: user });
    res.redirect('/users/');
});

router.route('/user/:userId')
    .put(async (req, res) => {
        const userId = req.params.userId;
        const { username, password } = req.body;

        await prisma.user.update({
            data: {
                username,
                password: md5(password),
            },
            where: {
                id: userId
            }
        });
        res.send({ id: userId, username });
    })
    .delete(async (req, res) => {
        const userId = req.params.userId;
        await prisma.user.delete({ where: { id: userId } });
        res.redirect('/users/');
    });

module.exports = router;