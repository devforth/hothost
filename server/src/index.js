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
      isNotAdmin(a) {return a.toString() !== env.WEB_ADMIN_USERNAME.toString()},
      getFlag(country) { return !country ? null: '/img/flags/' + country.toLowerCase() + '.svg' },
      getCountryName(country) { 
        if (!country) {
          return null;
        }
        const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
        return regionNames.of(country); },
        alertDuration(lastAlert) {
          if (!lastAlert) {
            return 'No data'
          }
          console.log(lastAlert);
          const now = new Date().getTime();
          let time = (now - lastAlert) / 1000;
          const interval = {
            days: '',
            hours: '',
            minutes: '',
            seconds: '',
          }
      
          interval.days = Math.floor(time/(3600 * 24)) + ' days ';
          time %= 3600 * 24
          interval.hours = Math.floor(time / 3600) + ' hours ';
          time %= 3600;
          interval.minutes = Math.floor(time / 60) + ' minutes ';
          interval.seconds = (time % 60).toFixed(0) + ' seconds ';
      
          return Object.keys(interval).reduce((prev, cur) => {
              const timeValue = interval[cur].split(' ')[0];
              if (timeValue && timeValue !== '0') {return prev + interval[cur]}
              return prev;
          }, '')
      }
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