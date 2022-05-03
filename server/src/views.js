const express = require('express');

const router = express.Router();

router.use(express.static('static'));

router.get('/', (req, res) => {
    res.locals = {
        some_value: 'foo bar',
        list: ['cat', 'dog']
    }

    res.render('main');
});

router.get('/login/', (req, res) => {
    res.render('login');
});

module.exports = router;