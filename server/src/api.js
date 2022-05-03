const express = require('express');
const router = express.Router();

const md5 = require('md5');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const prisma = require('./prisma');

router.post('/login/', async (req, res) => {
    const { username, password } = req.body;
    const passwordHash = md5(password);
    const user = await prisma.user.findFirst({
        select: { id: true, username: true },
        where: { username, password: passwordHash }
    });

    if (user) {
        const jwtToken = jwt.sign(user, process.env.JWT_SECRET);
        res.setHeader('__hhjwt', jwtToken);
        res.send({ success: true });
    } else {
        res.send({ error: 'Invalid username pr password'});
    }
});

router.post('/data/', async (req, res) => {
    res.send('TODO');
});

router.get('/users/', async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, username: true },
    });

    res.send({ data: users });
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
    res.send({ id: user.id, username: user.username });
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
        res.send({ success: true });
    });

module.exports = router;