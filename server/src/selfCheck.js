import humanizeDuration from "humanize-duration";
import env from "./env.js";
import PluginManager from "./pluginManager.js";
import { DATE_HUMANIZER_CONFIG } from "./utils.js";

const PING_INTERVAL_MS = 10 * 1000;
const PING_TIMEOUT_MS = 5 * 1000;
const UNREACHABLE_AFTER_MS = 30 * 1000;
export const HEALTH_PATH = "/api/health";

const startedAt = Date.now();
let lastOkAt = 0;
let unreachableSince = 0;
let reachableSince = env.WEB_PUBLIC_URL ? 0 : startedAt;

export const getReachableSince = () => reachableSince;

const notify = (eventType, label, extra = {}) =>
  PluginManager().handleEvents([eventType], {
    HOST_NAME: "HotHost",
    HOST_LABEL: `\`${label}\``,
    ...extra,
  });

const ping = async () => {
  const url = env.WEB_PUBLIC_URL + HEALTH_PATH;
  const now = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(PING_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    lastOkAt = now;
    if (reachableSince) return;
    reachableSince = now;
    console.log(`[selfCheck] ${url} reachable, per-host offline alerts enabled`);
    if (!unreachableSince) return;
    const downtime = humanizeDuration(now - unreachableSince, DATE_HUMANIZER_CONFIG);
    unreachableSince = 0;
    await notify("host_is_online", `self-check ok: ${url} reachable again after ${downtime}, per-host offline alerts resumed`, { EVENT_DURATION: downtime });
  } catch (e) {
    if (unreachableSince || now - (lastOkAt || startedAt) <= UNREACHABLE_AFTER_MS) return;
    reachableSince = 0;
    unreachableSince = now;
    console.log(`[selfCheck] ${url} unreachable for ${UNREACHABLE_AFTER_MS / 1000}s (${e.message}), per-host offline alerts paused`);
    await notify("host_is_offline", `self-check failed: ${url} unreachable (${e.message}), per-host offline alerts paused`);
  }
};

export const startSelfCheck = () => {
  if (!env.WEB_PUBLIC_URL) {
    console.log("[selfCheck] HOTHOST_WEB_PUBLIC_URL is not set, self-check disabled");
    return;
  }
  ping();
  setInterval(ping, PING_INTERVAL_MS);
};
