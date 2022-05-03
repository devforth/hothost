const uuid = require('uuid');
const express = require('express');

const prisma = require('./prisma');
const {
    authorizeUser,
    mustBeAuthorizedView,
    mustNotBeAuthroizedView,
} = require('./utils');

const router = express.Router();
router.use(express.static('static'));

router.get('/', async (req, res) =>  {
    res.locals.monitoringData = await prisma.monitoringData.findMany();
    res.render('home');
});

router.get('/login/', mustNotBeAuthroizedView((req, res) => res.render('login')));
router.post('/login/', mustNotBeAuthroizedView(async (req, res) => {
    try {
        const { username, password } = req.fields;
        if (username && password) {
            const jwtToken = await authorizeUser(username, password);
            res.cookie('__hhjwt', jwtToken, { maxAge: 60 * 60 * 1000 });
            res.redirect(req.query.next || '/');
        }
    } catch (e) {
        res.locals.error = e.message;
        res.render('login');
    }
}));

router.get('/users/', mustBeAuthorizedView((req, res) => res.render('users')));
router.post('/users/', mustBeAuthorizedView((req, res) => {

}));
module.exports = router;