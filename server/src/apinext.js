import express from "express";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import env from "./env.js";
import PluginManagerSingleton from "./pluginManager.js";
import md from "markdown-it";
import db from "./levelDB.js";

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
          secret: req.user && data.secret,
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

    await checkStatus(monitor).then((res) => {
      monitor.event_created = new Date().getTime();
      monitor.okStatus = res.response;
    });
    res
      .status(200)
      .json({ status: "successful", code: 200, data: getHttpMonitor() });
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
    } = req.body;

    database.data.settings = {
      RAM_THRESHOLD: +ram_threshold,
      RAM_STABILIZATION_LEVEL: +ram_stabilization_lvl,
      DISK_THRESHOLD: +disk_threshold,
      DISK_STABILIZATION_LEVEL: +disk_stabilization_lvl,
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
  };
};

const getHttpMonitor = () => {
  const data = database.data.httpMonitoringData;

  return data.map((data) => ({
    id: data.id,
    url: data.URL,
    label: data.label,
    status: data.okStatus,
    lastEventTs: data.event_created,
    monitorLastEventsTs: getDuration(data.event_created),
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
            ...p,
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
          plugin,
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

      // res.locals.plugin = plugin;
      // res.locals.pluginSettings = pluginSettings;
      // res.locals.params = [
      //   ...plugin.supportedEvents.map((e) => {
      //     return {
      //       id: e,
      //       value: pluginSettings?.enabledEvents.includes(e) ?? true,
      //       name: `Notify on ${e}`,
      //       type: "bool",
      //       inputName: `events[${e}]`,
      //     };
      //   }),
      //   ...plugin.params.map((p) => {
      //     const value = pluginSettings?.params[p.id];
      //     return {
      //       ...p,
      //       value: value || p.default_value,
      //       inputName: `params[${p.id}]`,
      //       required: p.required ?? true,
      //     };
      //   }),
      // ];

      // res.locals.descriptionFull =
      //   plugin.longDescriptionMD && md().render(plugin.longDescriptionMD);
      // res.render("plugin");
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
      const newPluginSetting = {
        id: plugin.id,
        params: input.params,
        enabledEvents: Object.keys(input.events),
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

    const processByTime = await dbIndex
      .get(+time)
      .then((res) => generateProcessData(res).reverse())
      .catch((err) => []);

    res.json({
      restartTime: restartTime,
      process: processByTime,
    });
  })
);

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
