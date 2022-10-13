import { v4 as uuidv4 } from "uuid";
import express from "express";
import md5 from "md5";

import database from "./database.js";
import {
  calculateDataEvent,
  mustBeAuthorizedView,
  readableRandomStringMaker,
  sizeFormat,
  eventDuration,
  setWarning,
  createMonitorDataset,
  stopScheduleJob,
  createScheduleJob,
  checkStatus,
  roundToNearestMinute,
} from "./utils.js";
import PluginManager from "./pluginManager.js";
import db from "./levelDB.js";

const router = express.Router();

router.post(
  "/add_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const id = uuidv4();
    const now = new Date().getTime();
    const secret = readableRandomStringMaker(64);

    database.data.monitoringData.push({
      id,
      createdAt: now,
      updatedAt: now,
      secret,
    });
    await database.write();

    res.redirect("/");
  })
);

router.post(
  "/remove_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.query;

    const index = database.data.monitoringData.findIndex((md) => md.id === id);
    if (index !== -1) {
      database.data.monitoringData.splice(index, 1);
      await database.write();
    }
    res.redirect("/");
  })
);

router.post("/logout", (req, res) => {
  res.cookie("__hhjwt", "", { maxAge: -1 });
  res.redirect("/login/");
});

router.post("/process/:secret", async (req, res) => {
  const procData = req.fields;
  const process = procData.PROCESS;
  const isRestart = +procData.IS_RESTART;
  const now = roundToNearestMinute(new Date().getTime());
  const hostId = database.data.monitoringData.find(
    (el) => el.secret === req.params.secret
  ).id;
  const dbIndex = db.sublevel(hostId, { valueEncoding: "json" });
  const dbHostState = db.sublevel("options", { valueEncoding: "json" });
  dbIndex.put(now, process);
  if (isRestart) {
    dbHostState.put(hostId, {
      restartTime: now,
    });
  }
  res.send("OK");
});

router.post("/data/:secret", async (req, res) => {
  const monitorData = req.fields;

  const index = database.data.monitoringData.findIndex(
    (md) => md.secret === req.params.secret
  );
  if (index === -1) {
    res.statusCode = 401;
    res.send("Unauthorized");
  } else {
    const data = Object.keys(monitorData).reduce((acc, key) => {
      const value = monitorData[key];
      acc[key] =
        value !== undefined && value !== null ? value.toString() : value;
      return acc;
    }, {});
    const dataItem = database.data.monitoringData[index];
    setWarning(data, dataItem);
    const newData = {
      ...dataItem,
      ...data,
      updatedAt: new Date().getTime(),
      online: true,
    };
    // for testing
    // const DIST_TOTAL = +newData.DISK_AVAIL + +newData.DISK_USED;
    // const DISK_USED_PERCENT = 0.87;
    // newData.DISK_AVAIL = DIST_TOTAL * ( 1 - DISK_USED_PERCENT );
    // newData.DISK_USED = DIST_TOTAL * DISK_USED_PERCENT;

    // const RAM_USED_PERCENT = 0.80;
    // newData.SYSTEM_FREE_RAM = +newData.SYSTEM_TOTAL_RAM * (1 - RAM_USED_PERCENT);

    const events = calculateDataEvent(
      database.data.monitoringData[index],
      newData
    );
    await PluginManager().handleEvents(events, {
      ...newData,

      // variables which might be used in template
      DISK_USED: sizeFormat(+newData.DISK_USED),
      DISK_TOTAL: sizeFormat(+newData.DISK_USED + +newData.DISK_AVAIL),
      RAM_USED: sizeFormat(
        +newData.SYSTEM_TOTAL_RAM - +newData.SYSTEM_FREE_RAM
      ),
      RAM_TOTAL: sizeFormat(+newData.SYSTEM_TOTAL_RAM),
      HOST_LABEL:
        newData.HOST_LABEL && newData.HOST_LABEL !== ""
          ? `\`${newData.HOST_LABEL}\``
          : "",
      EVENT_DURATION: eventDuration(newData, events),
    });
    database.data.monitoringData[index] = newData;
    await database.write();

    res.send("OK");
  }
});

router.post(
  "/remove_host",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.query;

    const index = database.data.monitoringData.findIndex(
      (host) => host.id === id
    );
    if (index !== -1) {
      database.data.monitoringData.splice(index, 1);
      await database.write();
    }
    res.redirect("/");
  })
);

router.post(
  "/add_http_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const httpMonitorData = req.fields;

    const monitor = createMonitorDataset(httpMonitorData);

    database.data.httpMonitoringData.push(monitor);
    await database.write();

    createScheduleJob(monitor.id, monitor.monitor_interval);

    await checkStatus(monitor).then((res) => {
      monitor.event_created = new Date().getTime();
      monitor.okStatus = res.response;
    });

    res.redirect("/http-monitor");
  })
);

router.post(
  "/remove_http_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.query;

    stopScheduleJob(id);
    const index = database.data.httpMonitoringData.findIndex(
      (host) => host.id === id
    );
    if (index !== -1) {
      database.data.httpMonitoringData.splice(index, 1);
      await database.write();
    }

    res.redirect("/http-monitor");
  })
);

router.post(
  "/add_http_label",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.query;
    const { label } = req.fields;

    const data = database.data.httpMonitoringData.find((el) => el.id === id);
    if (data) {
      data.label = label.trim();
      await database.write();
    }

    res.redirect("/http-monitor");
  })
);

export default router;
