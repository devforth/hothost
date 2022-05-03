const express = require('express')
const app = express()
const port = 8007

req.data.login === process.env.ADMIN_USERNAME &&  process.env.ADMIN_PASSWORD

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);


app.get('/', (req, res) => {
  res.locals = {
    some_value: 'foo bar',
    list: ['cat', 'dog']
  }

  res.render('main');
})


app.post('/data/', (req, res) => {
  res.locals = {
    some_value: 'foo bar',
    list: ['cat', 'dog']
  }

  res.render('main');
})

app.get('/login/', (req, res) => {
});

app.post('/login/', (req, res) => {

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})