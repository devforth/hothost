import humanizeDuration from "humanize-duration";
import {
  calculateAsyncEvents,
  checkUserExistsOrCreate,
  DATE_HUMANIZER_CONFIG,
  startScheduler,
  dbClearScheduler,
} from "../utils.js";

const helpers = {
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
    return !country ? null : `${country.toLowerCase()}.svg`;
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
};

export const { getDuration, getFlag, getCountryName } = helpers;
