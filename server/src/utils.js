const md5 = require('md5');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const prisma = require('./prisma');

module.exports = {
    checkUserExistsOrCreate: async () => {
        const count = await prisma.user.count();

        if (count === 0) {
            await prisma.user.create({
                data: {
                    id: uuid.v4(),
                    username: process.env.HOTHOST_WEB_USERNAME,
                    password: process.env.HOTHOST_WEB_PASSWORD_MD5
                }
            });
        }
    },
    authorizeUser: async (username, password) => {
        const passwordHash = md5(password);
        const user = await prisma.user.findFirst({
            select: { id: true, username: true },
            where: { username, password: passwordHash }
        });

        if (user) {
            const jwtToken = jwt.sign({ ...user, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, process.env.HOTHOST_WEB_JWT_SECRET);
            return jwtToken;
        } else {
            throw new Error('Invalid username or password');
        }
    },
    mustNotBeAuthroizedView: (callback) => {
        return (req, res) => {
            if (req.user) res.redirect(req.query.next || '/');
            else callback(req, res);
        };
    },
    mustBeAuthorizedView: (callback) => {
        return (req, res) => {
            if (!req.user) res.redirect(`/login/?next=${req.path}`);
            else callback(req, res);
        };
    },
    mustBeAuthorizedApi: (callback) => {
    },
    sizeFormat: (a) => {
        let value = parseInt(a);
        for (let unit of ['B', 'KiB', 'MiB', 'GiB', 'TiB']) {
            if (Math.abs(value) < 1024) {
                return `${value.toFixed(2)} ${unit}`;
            }

            value /= 1024;
        }

        return `${value.toFixed(2)} PiB`;
    },
}