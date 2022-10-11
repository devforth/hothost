import express from "express";
import {
  sizeFormat,
  authorizeUser,
  parseNestedForm,
  mustBeAuthorizedView,
  mustNotBeAuthorizedView,
  roundToNearestMinute,
} from "./utils.js";
import { getCountryName, getDuration, getFlag } from "./helpers/helpers.js";

import database from "./database.js";

const router = express.Router();

const getIconName = (osName) => {
  const icons = {
    "arch linux": "arch",
    ubuntu: "ubuntu",
  };

  return icons[osName?.toLowerCase()] ?? "unknown";
};

const ifUnknown = (value, trueValue, falseValue) => {
  return value === "unknown" ? trueValue : falseValue;
};

const getMonitoringData = async (req) => {
  const { RAM_THRESHOLD, DISK_THRESHOLD } = database.data.settings;
  const monitoringData = database.data.monitoringData
    // Return all if user logged in or only those that have data
    .filter((data) => req.user || data.createdAt !== data.updatedAt)
    .sort((a, b) => b.createdAt - a.createdAt);

  return monitoringData.map((data) =>
    data.createdAt === data.updatedAt
      ? {
          id: data.id,
          no_data: true,
          secret: req.user && data.secret,
        }
      : {
          id: data.id,
          secret: req.user && data.secret,
          icon_name: getIconName(data.HOST_OS_NAME),
          online:
            data.updatedAt + +data.MONITOR_INTERVAL * 1000 * 1.3 >=
            new Date().getTime(),
          online_event_ts: data.ONLINE_EVENT_TS,
          ram_event_ts: data.RAM_EVENT_TS,
          disk_event_ts: data.DISK_EVENT_TS,
          hostname: data.HOST_NAME,
          label: data.HOST_LABEL,
          public_ip: data.HOST_PUBLIC_IP,
          country: data.HOST_PUBLIC_IP_COUNTRY,
          os_name: data.HOST_OS_NAME,
          os_version: ifUnknown(
            data.HOST_OS_VERSION,
            data.SYSTEM_KERNEL_VERSION,
            data.HOST_OS_VERSION
          ),
          cpu_name: `${data.SYSTEM_CPU_MODEL}`,
          cpu_count: data.SYSTEM_CPU_LOGICAL_CPU_COUNT,
          ram_total: ifUnknown(
            data.SYSTEM_TOTAL_RAM,
            "unknown",
            sizeFormat(data.SYSTEM_TOTAL_RAM)
          ),
          ram_used_percentage: (
            ((+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) /
              +data.SYSTEM_TOTAL_RAM) *
              100 || 0
          ).toFixed(0),
          ram_used: sizeFormat(
            +(+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) || 0
          ),
          ram_warning:
            (+data.SYSTEM_FREE_RAM / +data.SYSTEM_TOTAL_RAM) * 100 <
            100 - RAM_THRESHOLD,
          isSwap: !!data.SYSTEM_TOTAL_SWAP && data.SYSTEM_TOTAL_SWAP !== "0",
          swap_total: ifUnknown(
            data.SYSTEM_TOTAL_SWAP,
            "unknown",
            sizeFormat(data.SYSTEM_TOTAL_SWAP)
          ),
          swap_used: (
            ((+data.SYSTEM_TOTAL_SWAP - +data.SYSTEM_FREE_SWAP) /
              +data.SYSTEM_TOTAL_SWAP) *
              100 || 0
          ).toFixed(0),
          disk_total: sizeFormat(+data.DISK_AVAIL + +data.DISK_USED),
          disk_used: (
            (+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) *
            100
          ).toFixed(0),
          disk_warning:
            (+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100 >
            DISK_THRESHOLD,
          humanizeDurationOnlineEvent: getDuration(data.ONLINE_EVENT_TS),
          countryFlag: getFlag(data.HOST_PUBLIC_IP_COUNTRY),
          countryName: getCountryName(data.HOST_PUBLIC_IP_COUNTRY),
          humanizeDurationRamEvent: getDuration(data.RAM_EVENT_TS),
          humanizeDurationDiskEvent: getDuration(data.DISK_EVENT_TS),
        }
  );
};

router.get(
  "/getMonitoringData",
  mustBeAuthorizedView(async (req, res) => {
    res.json(await getMonitoringData(req));
  })
);

router.post(
  "/edit_settings",
  mustBeAuthorizedView(async (req, res) => {
    const {
      disk_threshold,
      disk_stabilization_lvl,
      ram_threshold,
      ram_stabilization_lvl,
    } = request.body;

    database.data.settings = {
      RAM_THRESHOLD: +ram_threshold,
      RAM_STABILIZATION_LEVEL: +ram_stabilization_lvl,
      DISK_THRESHOLD: +disk_threshold,
      DISK_STABILIZATION_LEVEL: +disk_stabilization_lvl,
    };
    res.json({ ok: true });
  })
);

export default router;
