import express from "express";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import env from "./env.js";
import PluginManagerSingleton from "./pluginManager.js";
import md from "markdown-it";
import db from "./levelDB.js";
import sslChecker from "ssl-checker";

import {
  sizeFormat,
  authorizeUser,
  parseNestedForm,
  mustBeAuthorizedView,
  mustNotBeAuthorizedView,
  roundToNearestMinute,
  stopScheduleJob,
  checkStatus,
  createScheduleJob,
  readableRandomStringMaker,
  createMonitorDataset,
  eventDuration,
  getHostName,
  checkSslCert,
  anyNotificationDisabled,
  calculateDataEvent,
} from "./utils.js";
import {
  getCountryName,
  getDuration,
  getFlag,
  isNotAdmin,
} from "./helpers/helpers.js";

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
  const initialHostSettings = {
    disk_is_almost_full: {
      value: true,
      events: ["disk_is_almost_full", "disk_usage_recovered"],
    },
    host_is_offline: {
      value: true,
      events: ["host_is_offline", "host_is_online"],
    },
    ram_is_almost_full: {
      value: true,
      events: ["ram_is_almost_full", "ram_usage_recovered"],
    },
  };
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
          isLocal: env.ENV === "local" ? true : false,
        }
      : {
          id: data.id,
          // secret: req.user && data.secret,
          isLocal: env.ENV === "local" ? true : false,
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
          enabledNotifList:
            data?.enabledNotifList?.events || initialHostSettings,
          isNotificationDisabled: anyNotificationDisabled(
            data.enabledNotifList || initialHostSettings
          ),
        }
  );
};

router.get(
  "/getMonitoringData",
  mustBeAuthorizedView(async (req, res) => {
    res.status(200).json(await getMonitoringData(req));
  })
);

router.get(
  "/http-monitor",
  mustBeAuthorizedView((req, res) => {
    res
      .status(200)
      .json({ status: "success", code: 200, data: getHttpMonitor() });
  })
);

router.get(
  "/getUsers",
  mustBeAuthorizedView((req, res) => {
    return res.status(200).json({
      status: "success",
      code: 200,
      data: database.data.users.map((user) => {
        return {
          username: user.username,
          isNotAdmin: isNotAdmin(user.username),
          createdAt: user.createdAt,
          id: user.id,
        };
      }),
    });
    // res.locals.userInfo = database.data.users;
    // res.render("users");
  })
);

router.post(
  "/remove_user",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.body;
    const { users } = database.data;

    if (id) {
      const index = users.findIndex((el) => el.id === id);
      users.splice(index, 1);
      await database.write();
      return res.status(200).json({
        status: "successful",
        code: 200,
        data: database.data.users.map((user) => {
          return {
            username: user.username,
            isNotAdmin: isNotAdmin(user.username),
            createdAt: user.createdAt,
            id: user.id,
          };
        }),
      });
    } else {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }
  })
);
router.post(
  "/remove_host",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.body;

    const index = database.data.monitoringData.findIndex(
      (host) => host.id === id
    );
    if (index !== -1) {
      database.data.monitoringData.splice(index, 1);
      await database.write();
      return res.status(200).json({
        status: "successful",
        code: 200,
      });
    }
  })
);

router.post(
  "/remove_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.body;

    const index = database.data.monitoringData.findIndex((md) => md.id === id);
    if (index !== -1) {
      database.data.monitoringData.splice(index, 1);
      await database.write();
      return res.status(200).json({
        status: "successful",
        code: 200,
        data: await getMonitoringData(req),
      });
    }
  })
);

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

    res.status(200).json(await getMonitoringData(req));
  })
);

router.post(
  "/add_http_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const httpMonitorData = req.body;

    const monitor = createMonitorDataset(httpMonitorData);

    database.data.httpMonitoringData.push(monitor);
    await database.write();

    createScheduleJob(monitor.id, monitor.monitor_interval);
    PluginManagerSingleton().startInterval();

    const statusRes = await checkStatus(monitor);
    monitor.event_created = new Date().getTime();
    monitor.okStatus = statusRes.response;
    res
      .status(200)
      .json({ status: "successful", code: 200, data: getHttpMonitor() });
  })
);

router.post(
  "/edit_http_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const { id, ...newSettings } = req.body;
    const monitorIndex = database.data.httpMonitoringData.findIndex(
      (m) => m.id === id
    );
    if (monitorIndex !== -1) {
      database.data.httpMonitoringData[monitorIndex] = {
        ...database.data.httpMonitoringData[monitorIndex],
        last_rss_feed_time: new Date().getTime(),
        ...newSettings,
      };
      await database.write();
      res.status(200).json({ status: "successful", code: 200 });
    } else {
      res.status(400).json({ error: "invalid data" });
    }
  })
);

router.post(
  "/add_http_label",
  mustBeAuthorizedView(async (req, res) => {
    const { id, label } = req.body;

    const data = database.data.httpMonitoringData.find((el) => el.id === id);
    if (data) {
      data.HOST_LABEL = label.trim();
      await database.write();
    }
    res.json([req.body]);
  })
);

router.post(
  "/remove_http_monitor",
  mustBeAuthorizedView(async (req, res) => {
    const { id } = req.body;

    stopScheduleJob(id);
    const index = database.data.httpMonitoringData.findIndex(
      (host) => host.id === id
    );
    if (index !== -1) {
      database.data.httpMonitoringData.splice(index, 1);
      await database.write();
      res
        .status(200)
        .json({ status: "success", code: 200, data: getHttpMonitor() });
    }
  })
);

router.post(
  "/add_user",
  mustBeAuthorizedView(async (req, res) => {
    const user = req.body.user;

    const { users } = database.data;
    const existedLogin = users.findIndex((el) => el.username === user.username);

    if (existedLogin === -1) {
      users.push({
        id: uuidv4(),
        username: user.username,
        password: md5(user.password),
        createdAt: new Date().toDateString(),
      });
      await database.write();
      return res.status(200).json({
        status: "successful",
        code: 200,
        data: database.data.users.map((user) => {
          return {
            username: user.username,
            isNotAdmin: isNotAdmin(user.username),
            createdAt: user.createdAt,
            id: user.id,
          };
        }),
      });
    } else {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }
  })
);

router.post("/add_label", async (req, res) => {
  const { id, label } = req.body;

  const monData = database.data.monitoringData.find((el) => el.id === id);

  if (monData) {
    monData.HOST_LABEL = label.trim();
    await database.write();
  }
  res.json([req.body]);
});

router.get(
  "/checkAuth",
  mustNotBeAuthorizedView(async (req, res) => {
    return res.status(200).json({ status: "ok" });
  })
);

router.post(
  "/login",
  mustNotBeAuthorizedView(async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
      const jwtToken = await authorizeUser(username, password);

      if (jwtToken !== "error") {
        return res
          .cookie("__hhjwt", jwtToken, {
            maxAge: 60 * 60 * 1000,
            sameSite: "Strict", // prevents from broader class of CSRF attacks then even Lax, no need in external CSRF handlers for 92.16% of browsers
            secure: false, // some users might have non-SSL sites, probably should go from ENV var which gives greenlight
          })
          .status(200)
          .json({
            status: "successful",
            code: 200,
          });
      } else {
        return res.status(401).json({
          status: "rejected",
          code: 401,
          error: "invalid data",
        });
      }
    } else {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }
  })
);

router.post("/logout", (req, res) => {
  res.cookie("__hhjwt", "", { maxAge: -1 }).status(200).json({
    status: "successful",
    code: 200,
  });
});

router.post(
  "/edit_settings",
  mustBeAuthorizedView(async (req, res) => {
    const {
      disk_threshold,
      disk_stabilization_lvl,
      ram_threshold,
      ram_stabilization_lvl,
      host_is_down_confirmations,
      http_issue_confirmations,
      days_for_ssl_expire,
      hours_for_next_alert,
    } = req.body;

    database.data.settings = {
      RAM_THRESHOLD: +ram_threshold,
      RAM_STABILIZATION_LEVEL: +ram_stabilization_lvl,
      DISK_THRESHOLD: +disk_threshold,
      DISK_STABILIZATION_LEVEL: +disk_stabilization_lvl,
      HOST_IS_DOWN_CONFIRMATIONS: +host_is_down_confirmations,
      HTTP_ISSUE_CONFIRMATION: +http_issue_confirmations,
      DAYS_FOR_SSL_EXPIRED: +days_for_ssl_expire,
      HOURS_FOR_NEXT_ALERT: +hours_for_next_alert,
    };
    res.status(200).json({
      status: "sucessful",
      code: 200,
    });
  })
);

const getSettings = () => {
  const settings = database.data.settings;
  return {
    ram_threshold: settings.RAM_THRESHOLD,
    ram_stabilization_lvl: settings.RAM_STABILIZATION_LEVEL,
    disk_threshold: settings.DISK_THRESHOLD,
    disk_stabilization_lvl: settings.DISK_STABILIZATION_LEVEL,
    host_is_down_confirmations:
      settings.HOST_IS_DOWN_CONFIRMATIONS === undefined
        ? 1
        : settings.HOST_IS_DOWN_CONFIRMATIONS, // FALLBACK FOR USERS WHO HAD hh INSTALLED BEFORE 1.2.1
    http_issue_confirmations:
      settings.HTTP_ISSUE_CONFIRMATION === undefined
        ? 1
        : settings.HTTP_ISSUE_CONFIRMATION,
    days_for_ssl_expire:
      settings.DAYS_FOR_SSL_EXPIRED === undefined
        ? 14
        : settings.DAYS_FOR_SSL_EXPIRED,
    hours_for_next_alert:
      settings.HOURS_FOR_NEXT_ALERT === undefined
        ? 12
        : settings.HOURS_FOR_NEXT_ALERT,
  };
};

const getHttpMonitor = () => {
  const data = database.data.httpMonitoringData;

  return data.map((data) => ({
    id: data.id,
    url: data.URL,
    label: data.HOST_LABEL,
    status: data.okStatus,
    sslWarning: data?.sslWarning,
    certificateExpireDate: data?.certificateExpireDate,
    lastEventTs: data.event_created,
    monitorLastEventsTs: getDuration(data.event_created),
    errno: data?.errno,
    sslError: data?.SslError,
    monitor_type: data.monitor_type,
    certInfo: data.cert,
    interval: data.monitor_interval,
    login: data.login,
    password: data.password,
    keyWord: data.key_word,
    enabledPlugins: data.enabledPlugins,
  }));
};

router.get(
  "/getSettings",
  mustBeAuthorizedView((req, res) => {
    return res
      .status(200)
      .json({ status: "successful", code: 200, data: getSettings() });
  })
);
export default router;

router.get(
  "/plugins/",
  mustBeAuthorizedView((req, res) => {
    return res.status(200).json({
      status: "successful",
      code: 200,
      plugins: PluginManagerSingleton()
        .plugins.map((p) => {
          return {
            //...p,
            iconUrlOrBase64: p.iconUrlOrBase64,
            id: p.id,

            pluginEnabled: database.data.pluginSettings.find(
              (ps) => ps.id === p.id
            )?.enabled,
          };
        })
        .reverse(),
    });
  })
);

router.get(
  "/plugin/:id/",
  mustBeAuthorizedView((req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(
      (p) => p.id === req.params.id
    );

    if (!plugin) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
      });
    } else {
      const pluginSettings = database.data.pluginSettings.find(
        (ps) => ps.id === plugin.id
      );

      return res.status(200).json({
        status: "success",
        code: 200,
        data: {
          plugin: {
            name: plugin.name,
            id: plugin.id,
          },
          pluginSettings,
          params: [
            ...plugin.supportedEvents.map((e) => {
              return {
                id: e,
                value: pluginSettings?.enabledEvents.includes(e) ?? true,
                name: `Notify on ${e}`,
                type: "bool",
                inputName: `events[${e}]`,
              };
            }),
            ...plugin.params.map((p) => {
              const value = pluginSettings?.params[p.id];
              return {
                ...p,
                value: value || p.default_value,
                inputName: `params[${p.id}]`,
                required: p.required ?? true,
              };
            }),
          ],
          descriptionFull:
            plugin.longDescriptionMD && md().render(plugin.longDescriptionMD),
        },
      });
    }
  })
);

router.post(
  "/plugin/:id/",
  mustBeAuthorizedView(async (req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(
      (p) => p.id === req.params.id
    );

    if (!plugin) {
      res.redirect("/plugins/");
    } else {
      const input = parseNestedForm(req.body);

      const psIndex = database.data.pluginSettings.findIndex(
        (ps) => ps.id === plugin.id
      );

      //check last telegramChannelId
      let oldBotToken = database.data.pluginSettings[psIndex]?.params?.botToken;

      if (oldBotToken && oldBotToken !== input.params.botToken) {
        database.data.telegramLastChannelId = null;
        console.log("lastTelegramChatId Was cleaned");
      }
      //check last telegramChannelId

      const newPluginSetting = {
        id: plugin.id,
        params: input.params,
        enabledEvents: input.events ? Object.keys(input.events) : [],
        enabled: true,
      };

      if (psIndex !== -1) {
        if (
          !database.data.pluginSettings[psIndex].enabled &&
          newPluginSetting.enabled
        ) {
          await plugin.onPluginEnabled?.();
        }
        database.data.pluginSettings[psIndex] = newPluginSetting;
        if (input.notify) {
          await plugin.sendMessage?.(newPluginSetting);
        }
      } else {
        database.data.pluginSettings.push(newPluginSetting);
        await plugin.onPluginEnabled?.();
        if (input.notify) {
          await plugin.sendMessage?.(newPluginSetting);
        }
      }

      await database.write();
      res.status(200).json({
        status: "success",
        code: 200,
      });
      // res.redirect('/plugins/');
    }
  })
);

router.post(
  "/plugin_disable/",
  mustBeAuthorizedView(async (req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(
      (p) => p.id === req.body.id
    );
    //clean last telegramChannel
    if (req.body.id === "telegram-notifications") {
      database.data.telegramLastChannelId = null;
    }
    //
    if (!plugin) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
      });
    } else {
      const psIndex = database.data.pluginSettings.findIndex(
        (ps) => ps.id === plugin.id
      );
      const newPluginSetting = {
        enabled: false,
      };

      if (psIndex !== -1) {
        if (database.data.pluginSettings[psIndex].enabled) {
          await plugin.onPluginDisabled?.();
        }
        database.data.pluginSettings[psIndex] = newPluginSetting;
      }
      await database.write();
      return res.status(200).json({
        status: "success",
        code: 200,
      });
    }
  })
);

router.post(
  "/get_host_settings/",
  mustBeAuthorizedView(async (req, res) => {
    const id = req.body.id;
    const host = database.data.monitoringData.find((host) => host.id === id);
    if (!host) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }

    if (!host.enabledNotifList) {
      host.enabledNotifList = {
        disk_is_almost_full: {
          value: true,
          events: ["disk_is_almost_full", "disk_usage_recovered"],
        },
        host_is_offline: {
          value: true,
          events: ["host_is_offline", "host_is_online"],
        },
        ram_is_almost_full: {
          value: true,
          events: ["ram_is_almost_full", "ram_usage_recovered"],
        },
      };
    }

    await database.write();
    return res.status(200).json({
      status: "success",
      code: 200,
      data: host.enabledNotifList,
    });
  })
);

router.post(
  "/get_plugins_for_http-monitor/",
  mustBeAuthorizedView(async (req, res) => {
    const id = req.body.id;
    const host = database.data.httpMonitoringData.find(
      (host) => host.id === id
    );
    if (!host) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }

    if (!host.enabledPlugins) {
      host.enabledPlugins = {
        ALL_PLUGINS: {
          value: true,
        },
        TELEGRAM: {
          value: true,
        },
        SLACK: {
          value: true,
        },
        EMAIL: {
          value: true,
        },
      };
    }
    await database.write();
    return res.status(200).json({
      status: "success",
      code: 200,
      data: host.enabledPlugins,
    });
  })
);

router.post(
  "/get_filters_for_RSS/",
  mustBeAuthorizedView(async (req, res) => {
    const id = req.body.id;
    const host = database.data.httpMonitoringData.find(
      (host) => host.id === id
    );
    if (!host) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }

    if (!host.rssFilters) {
      host.rssFilters = [
        {
          name: "Exclude",
          data: [],
        },
        { 
          name: "Highlighted", 
          data: []
        },
        { 
          name: "OnlyPrio", 
          data: false
        },
      ];
    }
    await database.write();
    return res.status(200).json({
      status: "success",
      code: 200,
      data: host.rssFilters,
    });
  })
);

router.post(
  "/set_filters_for_RSS/",
  mustBeAuthorizedView(async (req, res) => {
    const id = req.body.id;
    const filters = req.body.filters;
    const host = database.data.httpMonitoringData.find(
      (host) => host.id === id
    );
    if (!host || host.monitor_type !== "rss_parser") {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }

    if (filters) {
      host.rssFilters = filters;
    }
    await database.write();
    return res.status(200).json({
      status: "success",
      code: 200,
    });
  })
);

router.post(
  "/set_plugins_for_http-monitor/",
  mustBeAuthorizedView(async (req, res) => {
    const id = req.body.id;
    const plugins = req.body.plugins;
    const host = database.data.httpMonitoringData.find(
      (host) => host.id === id
    );
    if (!host) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }
    if (plugins) {
      host.enabledPlugins = plugins;
    }
    await database.write();
    return res.status(200).json({
      status: "success",
      code: 200,
    });
  })
);

router.post(
  "/save_host_settings/",
  mustBeAuthorizedView(async (req, res) => {
    const id = req.body.id;
    const settings = req.body.settings;
    const host = database.data.monitoringData.find((host) => host.id === id);
    if (!host) {
      return res.status(401).json({
        status: "rejected",
        code: 401,
        error: "invalid data",
      });
    }
    if (settings) {
      host.enabledNotifList = settings;
    }
    await database.write();
    return res.status(200).json({
      status: "success",
      code: 200,
    });
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
    if (key !== "usedRam") {
      processEntries.push({
        id: id + 1,
        data: value,
        total_usage: key,
        ram_usage: sizeFormat(key * 1024),
        color: colors[id],
      });
      id++;
    }
  }
  return processEntries;
};

const getRamUsage = (data) => {
  for (const [key, value] of Object.entries(data)) {
    if (key === "usedRam") {
      return value;
    }
  }
};

router.get(
  "/getProcess/:id/:timeStep/",
  mustBeAuthorizedView(async (req, res) => {
    const { id, timeStep } = req.params;

    const minutesLeft = timeStep * 1000 * 60;
    const now = new Date().getTime();
    const time = roundToNearestMinute(now - minutesLeft);

    const dbIndex = db.sublevel(id, { valueEncoding: "json" });
    const dbHostState = db.sublevel("options", { valueEncoding: "json" });

    const restartTime = await dbHostState
      .get(id)
      .then((res) => res.restartTime)
      .catch(() => 0);

    let ramUsage = "0";
    const processByTime = await dbIndex
      .get(+time)
      .then((res) => {
        ramUsage = getRamUsage(res);
        return generateProcessData(res).reverse();
      })
      .catch((err) => []);

    res.json({
      restartTime: restartTime,
      process: processByTime,
      totalRamUsage: sizeFormat(ramUsage),
    });
  })
);

router.post("/check-ssl", async (req, res) => {
  const { id } = req.body;
  const now = new Date().getTime();

  const monData = database.data.httpMonitoringData.find((el) => el.id === id);

  if (monData) {
    let cert = null;
    if (!monData.URL.includes("localhost:")) {
      try {
        cert = await sslChecker(getHostName(monData.URL));
      } catch (e) {
        console.log(`sslChecker error for ${monData.URL}`, new Date(), e);
      }

      checkSslCert(cert, monData);
      monData.lastSslCheckingTime = new Date().getTime();
      monData.cert = cert;
      await database.write();
      return res.status(200).json({
        status: "success",
        code: 200,
      });
    }
  }
});
