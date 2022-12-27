import fs from "fs";
import path from "path";
import { promisify } from "util";

import env from "./env.js";
import database from "./database.js";

const fsReaddirAsync = promisify(fs.readdir);

class PluginManager {
  constructor(isRss) {
    this.plugins = [];
    this.rssQueue = [];
    this.rssSendInterval = setInterval(() => this.processRssQueue(), 4000);
  }
  startInterval() {
    if (!this.rssSendInterval) {
      this.rssSendInterval = setInterval(() => this.processRssQueue(), 4000);
    }
  }

  async loadPlugins() {
    const internalPluginFiles = await fsReaddirAsync("src/plugins");
    const thirdPartyFiles = await fsReaddirAsync(
      path.join(env.DATA_PATH, "plugins")
    ).catch((e) => []);

    const internalPlugins = await Promise.all(
      internalPluginFiles
        .filter((f) => !f.endsWith(".src"))
        .map((f) => import("./" + path.join("plugins", f)))
    );

    const thirdPartyPlugins = await Promise.all(
      thirdPartyFiles.map((f) => import("./" + path.join("plugins", f)))
    );

    this.plugins = [].concat(internalPlugins.map((p) => p.default)).concat(
      thirdPartyPlugins.map((p) => {
        p.default.thirdParty = true;
        return p.default;
      })
    );
    await Promise.all(
      this.plugins
        .filter((p) => {
          return (
            database.data.pluginSettings.find((ps) => ps.id === p.id)
              ?.enabled ?? false
          );
        })
        .map((p) => p.onPluginEnabled && p.onPluginEnabled())
    );
  }

  async handleEvents(events, newData) {
    let hostEvents = [];
    let hostPlugins = {};

    if (newData.enabledNotifList) {
      const eventsList = Object.values(newData.enabledNotifList)
        .filter((e) => !e.value)
        .map((e) => e.events)
        .flat();
      hostEvents = [...eventsList];
    }

    if (!newData.enabledPlugins) {
      hostPlugins = {
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
    } else {
      hostPlugins = newData.enabledPlugins;
    }
    const pluginsForHost = [
      ["telegram-notifications", "TELEGRAM"],
      ["slack-notifications", "SLACK"],
      ["gmail-notifications", "EMAIL"],
      ["email-notifications", "EMAIL"],
    ];
    function getEnabledPluginsForHost() {
      if (hostPlugins.ALL_PLUGINS.value) {
        return pluginsForHost.map((p) => {
          return p[0];
        });
      } else {
        let newArr = [];
        pluginsForHost.forEach((p) => {
          if (hostPlugins[p[1]].value) {
            newArr.push(p[0]);
          }
        });
        return newArr;
      }
    }

    const enabledPlugins = getEnabledPluginsForHost();

    for (let eventType of events) {
      const plugins = this.plugins
        .map((p) => {
          const settings =
            database.data.pluginSettings.find((ps) => ps.id === p.id) || {};
          return {
            plugin: p,
            settings,
          };
        })

        .filter((p) => {
          return (
            p.settings.enabled &&
            p.settings.enabledEvents.includes(eventType) &&
            !hostEvents.includes(eventType) &&
            enabledPlugins.includes(p.plugin.id)
          );
        });

      // handle event by all plugins in parallel
      await Promise.all(
        plugins.map(async (p) => {
          try {
            await p.plugin.handleEvent({
              eventType,
              data: newData,
              settings: p.settings,
            });
          } catch (e) {
            console.error("Error in plugin", p.id, e, "stack:", e.stack);
          }
        })
      );
    }
  }

  async processRssQueue() {
    if (this.rssQueue.length) {
      const { rssFormatedMessage, enabledPlugins } = this.rssQueue.shift();
      const hostPlugins = enabledPlugins || {
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
      const pluginsForHost = [
        ["telegram-notifications", "TELEGRAM"],
        ["slack-notifications", "SLACK"],
        ["gmail-notifications", "EMAIL"],
        ["email-notifications", "EMAIL"],
      ];
      function getEnabledPluginsForHost() {
        if (hostPlugins.ALL_PLUGINS.value) {
          return pluginsForHost.map((p) => {
            return p[0];
          });
        } else {
          let newArr = [];
          pluginsForHost.forEach((p) => {
            if (hostPlugins[p[1]].value) {
              newArr.push(p[0]);
            }
          });
          return newArr;
        }
      }
      const enabledPluginsArr = getEnabledPluginsForHost();

      // plugins var is only enabled plugin for this event based on enabledPlugins
      const plugins = this.plugins
        .map((p) => {
          const settings =
            database.data.pluginSettings.find((ps) => ps.id === p.id) || {};
          return {
            plugin: p,
            settings,
          };
        })

        .filter((p) => {
          return p.settings.enabled && enabledPluginsArr.includes(p.plugin.id);
        });
      await Promise.all(
        plugins.map(async (p) => {
          try {
            await p.plugin.sendMessage(p.settings, rssFormatedMessage);
          } catch (e) {
            console.error("Error in plugin", p.id, e, "stack:", e.stack);
          }
        })
      );
    }
    const rssMonitor = database.data.httpMonitoringData.find(
      (p) => p.monitor_type === "rss_parser"
    );
    if (!rssMonitor) {
      this.stopProcessRssQueue();
    }
  }

  async handleRssEvent({ rssFormatedMessage, enabledPlugins }) {
    let messageString = "";
    let excludedFields = [
      "content:encoded",
      "content:encodedSnippet",
      "contentSnippet",
      "isoDate",
    ];
    const prepareMessage = (cutField) => {
      const CHARACTERS_LIMIT = 500;
      Object.entries(rssFormatedMessage).forEach((e) => {
        if (!excludedFields.includes(e[0])) {
          if (!cutField) {
            messageString = `${messageString}\n✅-${e[0]
              .charAt(0)
              .toUpperCase()}${e[0].slice(1)}:${e[1]})`;
          } else {
            messageString = `${messageString}\n⚠️-${e[0]
              .charAt(0)
              .toUpperCase()}${e[0].slice(1)}:${e[1].slice(
              0,
              CHARACTERS_LIMIT
            )}(short message...)`;
          }
        }
      });
    };
    prepareMessage();
    if (messageString.length > 4096) {
      messageString = "";
      prepareMessage(true);
    }
    this.rssQueue.push({ rssFormatedMessage: messageString, enabledPlugins });
  }

  stopProcessRssQueue() {
    clearInterval(this.rssSendInterval);
    this.rssSendInterval = null;
  }
}

let _instance;
const PluginManagerSingleton = () => {
  if (!_instance) {
    _instance = new PluginManager();
  }
  return _instance;
};

export default PluginManagerSingleton;
