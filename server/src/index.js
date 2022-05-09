import path from 'path';
import express from 'express';

import { create } from 'express-handlebars';

import cookieParser from 'cookie-parser';
import formidable from 'express-formidable';

import viewRouter from './views.js';
import apiRouter from './api.js';

import env from './env.js';
import database from './database.js';
import PluginManager from "./pluginManager.js";

import { calculateAsyncEvents, checkUserExistsOrCreate } from './utils.js';
import { authMiddleware } from './middleware.js';


async function main() {
  await database.read();
  await PluginManager().loadPlugins();
  await checkUserExistsOrCreate();

  setTimeout(() => setInterval(calculateAsyncEvents, 1000), 90 * 1000);

  const app = express();
  const port = env.WEB_PORT || 8007;

  const hbs = create({
    extname: 'html',
    defaultLayout: 'main',
    layoutsDir: path.join('html', 'layouts'),

    helpers: {
      or(a, b) { return a || b },
      not(a) { return !a },
      and(a, b) { return a && b },
      eq(a, b) { return a?.toString() === b?.toString() },
     }
  });


  app.set('view engine', 'html');
  app.engine('html', hbs.engine);
  app.set('views', path.join('html', 'views'));


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