const express = require('express');

const router = express.Router();



router.get('/', (req, res) => {
    res.locals = {
        some_value: 'foo bar',
        list: ['cat', 'dog']
    }

    res.render('main');
});

router.get('/login/', (req, res) => {

});

module.exports = router;