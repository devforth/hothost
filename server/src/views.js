const express = require('express');

const router = express.Router();

router.use(express.static('static'));

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/login/', (req, res) => {
    if(req.user) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

router.get('/users/', (req, res) => {
    res.render('users');
});

module.exports = router;