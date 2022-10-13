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
  }));
};

router.get(
  "/",
  mustBeAuthorizedView(async (req, res) => {
    // res.locals.monitoringData = await getMonitoringData(req);
    res.render("home");
  })
);

router.get("/update", async (req, res) => {
  // res.locals.monitoringData = await getMonitoringData(req);
  res.render("monitoring_table", { layout: false });
});

router.get("/http_update", async (req, res) => {
  res.locals.httpMonitoringData = getHttpMonitor(req);
  res.render("httpMonitoring_table", { layout: false });
});

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

router.get(
  "/login/",
  mustNotBeAuthorizedView((req, res) => res.render("login"))
);

router.get(
  "/plugins/",
  mustBeAuthorizedView((req, res) => {
    res.locals.plugins = PluginManagerSingleton()
      .plugins.map((p) => {
        return {
          ...p,
          pluginEnabled: database.data.pluginSettings.find(
            (ps) => ps.id === p.id
          )?.enabled,
        };
      })
      .reverse();
    res.render("plugins");
  })
);

router.get(
  "/plugin/:id/",
  mustBeAuthorizedView((req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(
      (p) => p.id === req.params.id
    );

    if (!plugin) {
      res.redirect("/plugins/");
    } else {
      const pluginSettings = database.data.pluginSettings.find(
        (ps) => ps.id === plugin.id
      );
      res.locals.plugin = plugin;
      res.locals.pluginSettings = pluginSettings;
      res.locals.params = [
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
      ];

      res.locals.descriptionFull =
        plugin.longDescriptionMD && md().render(plugin.longDescriptionMD);
      res.render("plugin");
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
      const input = parseNestedForm(req.fields);
      console.log(input);

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
      res.status(200).send();
      // res.redirect('/plugins/');
    }
  })
);

router.post(
  "/plugin/disable/:id/",
  mustBeAuthorizedView(async (req, res) => {
    const plugin = PluginManagerSingleton().plugins.find(
      (p) => p.id === req.params.id
    );

    if (!plugin) {
      res.redirect("/plugins/");
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
      res.redirect(`/plugins/`);
    }
  })
);

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

router.get(
  "/http-monitor",
  mustBeAuthorizedView((req, res) => {
    res.locals.httpMonitoringData = getHttpMonitor();
    res.render("httpMonitor");
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

export default router;
