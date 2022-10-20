import express from "express";

import env from "./env.js";
import database from "./database.js";
import {
  sizeFormat,
  authorizeUser,
  parseNestedForm,
  mustBeAuthorizedView,
  mustNotBeAuthorizedView,
  roundToNearestMinute,
} from "./utils.js";
import PluginManagerSingleton from "./pluginManager.js";
import md from "markdown-it";
import db from "./levelDB.js";

const router = express.Router();
router.use(express.static("static"));

// router.get(
//   "/",
//   mustBeAuthorizedView(async (req, res) => {
//     // res.locals.monitoringData = await getMonitoringData(req);
//     res.render("home");
//   })
// );

// router.get("/update", async (req, res) => {
//   // res.locals.monitoringData = await getMonitoringData(req);
//   res.render("monitoring_table", { layout: false });
// });

// // router.get("/http_update", async (req, res) => {
// //   res.locals.httpMonitoringData = getHttpMonitor(req);
// //   res.render("httpMonitoring_table", { layout: false });
// // });

router.get("/public", async (req, res) => {
  if (!env.WEB_BASIC_PUBLIC_PASSWORD || !env.WEB_BASIC_PUBLIC_USERNAME) {
    res.statusCode = 400;
    res.end();
    return;
  }
  const basicAuth =
    "Basic " +
    Buffer.from(
      `${env.WEB_BASIC_PUBLIC_USERNAME}:${env.WEB_BASIC_PUBLIC_PASSWORD}`
    ).toString("base64");
  if (req.headers["authorization"] !== basicAuth) {
    res.statusCode = 401;
    res.header("WWW-Authenticate", 'Basic realm="restricted"');
    res.end();
  } else {
    res.locals.monitoringData = await getMonitoringData(req);
    res.render("home");
  }
});

// router.get(
//   "/login/",
//   mustNotBeAuthorizedView((req, res) => res.render("login"))
// );

router.get(
  "/users/",
  mustBeAuthorizedView((req, res) => {
    res.locals.userInfo = database.data.users;
    res.render("users");
  })
);

router.get(
  "/settings",
  mustBeAuthorizedView((req, res) => {
    res.locals.settings = getSettings();
    res.render("settings");
  })
);

const generateProcessData = (data) => {
  const colors = [
    "#22d4bc",
    "#56AEE2",
    "#5668E2",
    "#8A56E2",
    "#CF56E2",
    "#E25668",
    "#E28956",
    "#E2CF56",
    "#AEE256",
    "#56E289",
  ];
  let processEntries = [];
  let id = 0;
  for (const [key, value] of Object.entries(data)) {
    processEntries.push({
      id: id + 1,
      data: value,
      total_usage: key,
      ram_usage: sizeFormat(key * 1024),
      color: colors[id],
    });
    id++;
  }
  return processEntries;
};

export default router;
