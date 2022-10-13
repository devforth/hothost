import path from "path";
import express from "express";
import cors from "cors";

import { create } from "express-handlebars";

import cookieParser from "cookie-parser";
import formidable from "express-formidable";
import humanizeDuration from "humanize-duration";

import viewRouter from "./views.js";
import apiRouter from "./api.js";
import nextApiRouter from "./apinext.js";

import env from "./env.js";
import database from "./database.js";
import PluginManager from "./pluginManager.js";

import {
  calculateAsyncEvents,
  checkUserExistsOrCreate,
  DATE_HUMANIZER_CONFIG,
  startScheduler,
  dbClearScheduler,
} from "./utils.js";
import { authMiddleware } from "./middleware.js";

async function main() {
  await database.read();
  await PluginManager().loadPlugins();
  await checkUserExistsOrCreate();
  startScheduler();
  setTimeout(() => setInterval(calculateAsyncEvents, 1000), 90 * 1000);
  setInterval(dbClearScheduler, 100 * 1000);

  const app = express();

  const port = env.WEB_PORT || 8007;

  const hbs = create({
    extname: "html",
    defaultLayout: "main",
    layoutsDir: path.join("html", "layouts"),
    partialsDir: path.join("html", "views"),

    helpers: {
      or(a, b) {
        return a || b;
      },
      not(a) {
        return !a;
      },
      and(a, b) {
        return a && b;
      },
      eq(a, b) {
        return a?.toString() === b?.toString();
      },
      isNotAdmin(a) {
        return a.toString() !== env.WEB_ADMIN_USERNAME.toString();
      },
      getFlag(country) {
        return !country ? null : "/img/flags/" + country.toLowerCase() + ".svg";
      },
      getCountryName(country) {
        if (!country) {
          return null;
        }
        const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
        return regionNames.of(country);
      },
      getDuration(eventLastTs) {
        const now = new Date().getTime();

        const duration = now - eventLastTs;
        return humanizeDuration(duration, DATE_HUMANIZER_CONFIG);
      },
      json: function (obj) {
        return JSON.stringify(obj);
      },
    },
  });

  app.set("view engine", "html");
  app.engine("html", hbs.engine);
  app.set("views", path.join("html", "views"));

  app.use(express.json());
  // app.use(formidable());
  app.use(cookieParser());

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(authMiddleware);

  app.use("/", viewRouter);
  app.use("/api/", apiRouter);
  app.use("/api/v2/", nextApiRouter);

  app.listen(port, "0.0.0.0", () => {
    console.log(
      `🔥🔥🔥 ${new Date().toISOString()} Hothost is listening on port ${port}`
    );
  });
}

main().catch(console.error);
