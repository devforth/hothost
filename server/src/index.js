const fs = require('fs');
const path = require('path');
const express = require('express');

const { create } = require('express-handlebars');

const cookieParser = require("cookie-parser");
const formidable = require('express-formidable');

const viewRouter = require('./views');
const apiRouter = require('./api');

const { checkUserExistsOrCreate, readableRandomStringMaker } = require('./utils');
const { authMiddleware } = require('./middleware');


if (process.env.ENV === 'local') {
  process.env.HOTHOST_WEB_ADMIN_USERNAME = 'admin';
  process.env.HOTHOST_WEB_ADMIN_PASSWORD = '123456';
  process.env.HOTHOST_WEB_BASIC_PUBLIC_USERNAME = 'admin';
  process.env.HOTHOST_WEB_BASIC_PUBLIC_PASSWORD = '123456';
  process.env.HOTHOST_WEB_PORT = '8007';
  process.env.HOTHOST_WEB_JWT_SECRET = 'e10adc3949ba59abbe56e057f20f883e';
} else {
  const requiredVariables = ['HOTHOST_WEB_ADMIN_USERNAME', 'HOTHOST_WEB_ADMIN_PASSWORD', 'HOTHOST_WEB_BASIC_PUBLIC_USERNAME', 'HOTHOST_WEB_BASIC_PUBLIC_PASSWORD'];
  requiredVariables.forEach(key => {
    if (!process.env[key]) {
      throw new Error(`Environment variable '${key}' is missing`);
    }
  });

  if (!process.env.HOTHOST_WEB_JWT_SECRET) {
    const jwtSecretPath = path.join('/var/lib/hothost/jwt');
    if (!fs.existsSync(jwtSecretPath)) {
      const jwtSecret = readableRandomStringMaker(64);
      fs.writeFileSync(jwtSecretPath, jwtSecret);
    }
    process.env.HOTHOST_WEB_JWT_SECRET = fs.readFileSync(jwtSecretPath);
  }
}


async function main() {
  await checkUserExistsOrCreate();

  const app = express();
  const port = +process.env.HOTHOST_WEB_PORT || 8007;

  const hbs = create({
    extname: 'html',
    defaultLayout: 'main',
    layoutsDir: path.join(path.dirname(__dirname), 'html', 'layouts'),

    helpers: {
      or(a, b) { return a || b },
      not(a) { return !a },
      and(a, b) { return a && b },
      eq(a, b) { return a.toString() === b.toString() },
     }
  });


  app.set('view engine', 'html');
  app.engine('html', hbs.engine);
  app.set('views', path.join(path.dirname(__dirname), 'html', 'views'));


  app.use(formidable());
  app.use(cookieParser());

  app.use(authMiddleware);

  app.use('/', viewRouter);
  app.use('/api/', apiRouter);

  app.listen(port, '0.0.0.0', () => {
    console.log(`🔥🔥🔥 Hothost is listening on port ${port}`)
  });
}

main().catch(console.error);