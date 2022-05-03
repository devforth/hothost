const path = require('path');
const express = require('express');

const { create } = require('express-handlebars');

const cookieParser = require("cookie-parser");
const formidable = require('express-formidable');

const viewRouter = require('./views');
const apiRouter = require('./api');

const { checkUserExistsOrCreate } = require('./utils');
const { authMiddleware } = require('./middleware');


if (process.env.ENV === 'local') {
  process.env.ADMIN_PASSWORD_HASH = 'e10adc3949ba59abbe56e057f20f883e';
  process.env.JWT_SECRET = 'e10adc3949ba59abbe56e057f20f883e';
}


async function main() {
  await checkUserExistsOrCreate();

  const app = express();
  const port = process.env.SERVER_PORT || 8007;

  const hbs = create({
    extname: 'html',
    defaultLayout: 'main',
    layoutsDir: path.join(path.dirname(__dirname), 'html', 'layouts'),

    helpers: {
      or(a, b) { return a || b },
      not(a) { return !a },
      and(a, b) { return a && b },
      eq(a, b) { return a.toString() === b.toString() },

      sizeFormat(a) {
        let value = parseInt(a);
        for (let unit of ['B', 'KiB', 'MiB', 'GiB', 'TiB']) {
            if (Math.abs(value) < 1024) {
                return `${value.toFixed(2)} ${unit}`;
            }

            value /= 1024;
        }

        return `${value.toFixed(2)} PiB`;
      },
      percentage(a, b) {
        const aValue = parseFloat(a);
        const bValue = parseFloat(b);

        return ((aValue / bValue) * 100).toFixed(0);
      },
      add(a, b) {
        return +a + +b;
      },
      gt(a, b) {
        return +a > +b;
      }
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