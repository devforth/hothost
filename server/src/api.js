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
  // createMonitorDataset,

  // checkStatus,
  roundToNearestMinute,
  getGroupForHost,
} from "./utils.js";
import PluginManager from "./pluginManager.js";
import db from "./levelDB.js";

const router = express.Router();

const HOST_NOT_FOUND = "HOST NOT FOUND";
const AGENT_METRIC_FIELDS = [
  "CONTAINER_OS_NAME",
  "CONTAINER_OS_ID",
  "CONTAINER_OS_ID_LIKE",
  "CONTAINER_OS_VERSION",
  "CONTAINER_OS_VERSION_ID",
  "CONTAINER_OS_DETECTION",
  "CONTAINER_IS_OFFICIAL_IMAGE",
  "HOST_NAME",
  "HOST_OS_NAME",
  "HOST_OS_ID",
  "HOST_OS_ID_LIKE",
  "HOST_OS_VERSION",
  "HOST_OS_VERSION_ID",
  "HOST_OS_DETECTION",
  "HOST_IS_K8S_NODE",
  "SYSTEM_KERNEL_NAME",
  "SYSTEM_KERNEL_VERSION",
  "SYSTEM_ARCHITECTURE",
  "SYSTEM_VIRTUALIZATION",
  "SYSTEM_VIRT_DETECTION",
  "SYSTEM_CONTAINER",
  "SYSTEM_CONTAINER_DETECTION",
  "SYSTEM_CPU_LOGICAL_CPU_COUNT",
  "SYSTEM_CPU_VENDOR",
  "SYSTEM_CPU_MODEL",
  "SYSTEM_CPU_FREQ",
  "SYSTEM_CPU_DETECTION",
  "SYSTEM_TOTAL_RAM",
  "SYSTEM_FREE_RAM",
  "SYSTEM_TOTAL_SWAP",
  "SYSTEM_FREE_SWAP",
  "SYSTEM_RAM_DETECTION",
  "SYSTEM_TOTAL_DISK_SIZE",
  "SYSTEM_DISK_DETECTION",
  "INSTANCE_CLOUD_TYPE",
  "INSTANCE_CLOUD_INSTANCE_TYPE",
  "INSTANCE_CLOUD_INSTANCE_REGION",
  "DISK_USED",
  "DISK_AVAIL",
  "HOST_PUBLIC_IP",
  "HOST_PUBLIC_IP_FALLBACK",
  "HOST_PUBLIC_IP_COUNTRY",
  "MONITOR_INTERVAL",
];

router.post("/process/:secret", async (req, res) => {
  const procData = req.body;
  const process = procData.PROCESS;
  const freeRam = procData.SYSTEM_FREE_RAM;
  const totalRam = procData.SYSTEM_TOTAL_RAM;
  const usedRam = () => {
    if (totalRam !== "unknown") {
      return totalRam - freeRam;
    } else {
      return 0;
    }
  };

  const isRestart = +procData.IS_RESTART;
  const now = roundToNearestMinute(new Date().getTime());
  const host = database.data.monitoringData.find(
    (el) => el.secret === req.params.secret
  );
  if (!host) {
    res.status(401).send(HOST_NOT_FOUND);
    return;
  }
  const hostId = host.id;
  const dbIndex = db.sublevel(hostId, { valueEncoding: "json" });
  const dbHostState = db.sublevel("options", { valueEncoding: "json" });
  dbIndex.put(now, { ...process, usedRam: usedRam() });
  if (isRestart) {
    const restartTimeArr = await dbHostState
      .get(hostId)
      .then((res) => {
        return res.restartTime;
      })
      .catch(() => 0);

    const prevRestTimes = restartTimeArr.isArray
      ? restartTimeArr
      : [restartTimeArr];

    dbHostState.put(hostId, {
      restartTime: [...prevRestTimes, now].flat(),
    });
  }
  res.send("OK");
});

router.post("/data/:secret", async (req, res) => {
  const monitorData = req.body;

  const index = database.data.monitoringData.findIndex(
    (md) => md.secret === req.params.secret
  );
  if (index === -1) {
    res.status(401).send(HOST_NOT_FOUND);
    return;
  } else {
    const data = AGENT_METRIC_FIELDS.filter((key) => key in monitorData).reduce((acc, key) => {
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

      // variables which might be used in plugin template
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
      HOST_GROUP: getGroupForHost(newData),
    });
    database.data.monitoringData[index] = newData;
    await database.write();

    res.send("OK");
  }
});

export default router;
