const path = require('path');
const express = require('express');

const viewRouter = require('./views');
const apiRouter = require('./api');

const { checkUserExistsOrCreate } = require('./utils');

async function main() {
  await checkUserExistsOrCreate();
  
  const app = express();
  const port = process.env.SERVER_PORT || 8007;
  
  app.use(express.static('static'))

  app.set('view engine', 'html');
  app.engine('html', require('hbs').__express);
  app.set('views', path.join(path.dirname(__dirname), 'html'));
  
  app.use('/', viewRouter);
  app.use('/api/', apiRouter);

  app.listen(port, '0.0.0.0', () => {
    console.log(`🔥🔥🔥 Hothost is listening on port ${port}`)
  });
}

main().catch(console.error);