import md5 from "md5";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import humanizeDuration from "humanize-duration";
import fetch from "node-fetch";
import sslCertificate from 'get-ssl-certificate'
import env from "./env.js";
import database from "./database.js";
import PluginManager from "./pluginManager.js";
import levelDb from "./levelDB.js";
import db from "./database.js";

export const DATE_HUMANIZER_CONFIG = {
  round: true,
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
};

const expiredError = "CERT_HAS_EXPIRED"
const wrongHostNameError = "ERR_TLS_CERT_ALTNAME_INVALID"

export const checkUserExistsOrCreate = async () => {
  if (database.data.users.length === 0) {
    database.data.users.push({
      id: uuidv4(),
      username: env.WEB_ADMIN_USERNAME,
      password: md5(env.WEB_ADMIN_PASSWORD),
      createdAt: new Date().toDateString(),
    });
    await database.write();
  }
};
export const authorizeUser = async (username, password) => {
  const passwordHash = md5(password);
  const user = await database.data.users.find(
    (user) => user.username === username && user.password === passwordHash
  );
  if (user) {
    return jwt.sign(
      {
        id: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      env.WEB_JWT_SECRET
    );
  } else {
    return "error";
  }
};
export const mustNotBeAuthorizedView = (callback) => {
  return (req, res) => {
    if (req.user) res.status(403).json({ error: "Can`t access when authorized" })
    else callback(req, res);
  };
};
export const mustBeAuthorizedView = (callback) => {
  return (req, res) => {
    if (!req.user) {
      //res.redirect(`/login/?next=${req.path}`);
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      callback(req, res);
    }
  };
};
export const sizeFormat = (a) => {
  let value = parseInt(a);
  for (let unit of ["B", "KiB", "MiB", "GiB", "TiB"]) {
    if (Math.abs(value) < 1024) {
      return `${value.toFixed(2)} ${unit}`;
    }

    value /= 1024;
  }

  return `${value.toFixed(2)} PiB`;
};
export const readableRandomStringMaker = (length) => {
  for (
    var s = "";
    s.length < length;
    s +=
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
        (Math.random() * 62) | 0
      )
  );
  return s;
};

export const calculateEvent = (
  prevTrigger,
  newTrigger,
  eventOnValue,
  eventOffValue
) => {
  if (prevTrigger !== newTrigger) {
    if (newTrigger) return eventOnValue;
    else return eventOffValue;
  }
  return null;
};

export const calculateWarning = (
  usage,
  lastEvent,
  threshold,
  stabilizationLvl
) => {
  const onEventBound = threshold + stabilizationLvl;
  const offEventBound = threshold - stabilizationLvl;

  if (usage > onEventBound) {
    return true;
  } else if (usage < offEventBound) {
    return false;
  } else if (usage <= onEventBound && usage >= offEventBound) {
    return lastEvent;
  }
};

export const calculateDataEvent = (prevData, newData) => {
  const events = [];
  const {
    RAM_THRESHOLD,
    RAM_STABILIZATION_LEVEL,
    DISK_THRESHOLD,
    DISK_STABILIZATION_LEVEL,
  } = database.data.settings;

  const calculateDiskWarning = (data) => {
    const diskUsage =
      (+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100;
    const warning = calculateWarning(
      diskUsage,
      data.last_disk_event,
      DISK_THRESHOLD,
      DISK_STABILIZATION_LEVEL
    );

    data.last_disk_event = warning;
    return warning;
  };
  const calculateRamWarning = (data) => {
    const ramUsage =
      ((+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) /
        +data.SYSTEM_TOTAL_RAM) *
      100;
    const warning = calculateWarning(
      ramUsage,
      data.last_ram_event,
      RAM_THRESHOLD,
      RAM_STABILIZATION_LEVEL
    );

    data.last_ram_event = warning;
    return warning;
  };

  const diskSpaceEvent = calculateEvent(
    calculateDiskWarning(prevData),
    calculateDiskWarning(newData),
    "disk_is_almost_full",
    "disk_usage_recovered"
  );
  events.push(diskSpaceEvent);

  const ramEvent = calculateEvent(
    calculateRamWarning(prevData),
    calculateRamWarning(newData),
    "ram_is_almost_full",
    "ram_usage_recovered"
  );
  events.push(ramEvent);

  if (!prevData.online && newData.online ) {
    events.push("host_is_online");
  }

  return events.filter((e) => e);
};

export const calculateAsyncEvents = async () => {
  const {
    HOST_IS_DOWN_CONFIRMATIONS,
   
  } = database.data.settings;


  await Promise.all(
    database.data.monitoringData.map((data) => {
      const safePeriod = 0.1 * 1000
      const events = [];
      
      const online = data.updatedAt + +data.MONITOR_INTERVAL * 1000 * (1 + +(HOST_IS_DOWN_CONFIRMATIONS||0)) + safePeriod >= new Date().getTime();
      if (!online && data.online) {
          events.push("host_is_offline");
          data.online = false;
        data.ONLINE_EVENT_TS = new Date().getTime();
        }


      PluginManager().handleEvents(
        events.filter((e) => e),
        {
          HOST_NAME: data.HOST_NAME,
          HOST_LABEL:
            data.HOST_LABEL && data.HOST_LABEL !== ""
              ? `\`${data.HOST_LABEL}\``
              : "",
        }
      );
    })
  );
};

export const generateHttpEvent = (prevData, newData) => {
  const events = [];
  let reason = "";

  if (!prevData.okStatus && newData.okStatus) {
    events.push("http_host_up");
    if (prevData.SslError && !newData.SslError){
      reason = `The hostname ${newData.url} is correctly listed in the certificate.`
    }
    else {
    switch (newData.monitor_type) {
      case "status_code":
        reason = "Response status code back to 200";
        break;
      case "keyword_exist":
        reason = `Keyword ${newData.key_word} exists`;
        break;
      case "keyword_not_exist":
        reason = `Keyword ${newData.key_word} does not exist`;
        break;
    }
    }
   }
  if (prevData.okStatus && !newData.okStatus) {


    events.push("http_host_down");
    if (newData.SslError) { 
      if (newData.SslError === expiredError) {
        reason = "Certificate has expired"
      }
      if (newData.SslError === wrongHostNameError) {
        reason = `Hostname/IP does not match certificate's altnames: ${newData.url} is not in the cert's list: `
      }
    } 
    else {
      switch (newData.monitor_type) {
        case "status_code":
          reason = newData.status
            ? `Response status code is ${newData.status}`
            : "Host down";
          break;
        case "keyword_exist":
          reason = `Keyword ${newData.key_word} no longer exists`;
          break;
        case "keyword_not_exist":
          reason = `Keyword ${newData.key_word} exists again`;
          break;
      }
    }
  }

  if (events.length !== 0) {
    PluginManager().handleEvents(
      events.filter((e) => e),
      {
        HOST_NAME: newData.URL,
        HOST_LABEL:
          newData.label && newData.label !== "" ? `\`${newData.label}\`` : "",
        EVENT_DURATION: humanizeDuration(
          newData.event_created - prevData.event_created,
          DATE_HUMANIZER_CONFIG
        ),
        EVENT_REASON: reason,
      }
    );
  }
};

export const generateHttpWarningEvents = (newData,expireDate)=>{
  const events = [];
  
  let reason = `Ssl certificate expires ${new Date(expireDate)}  `;
  if (newData.sslWarning) {
    events.push("ssl_is_almost_expire")
  }
  if (events.length !== 0) {
    PluginManager().handleEvents(
      events.filter((e) => e),
      {
        HOST_NAME: newData.URL,
        HOST_LABEL:
          newData.label && newData.label !== "" ? `\`${newData.label}\`` : "",
        CERT_VALID_UNTIL: new Date(expireDate),
        EVENT_REASON: reason,
      }
    );
  }

}

export const parseNestedForm = (fields) => {
  return Object.keys(fields).reduce((acc, key) => {
    const nestedStartIndex = key.indexOf("[");

    if (nestedStartIndex !== -1) {
      const rootKey = key.substring(0, nestedStartIndex);
      const nestedKeys = key
        .substring(nestedStartIndex + 1, key.length - 1)
        .split("][");
      const lastKey = nestedKeys.pop();

      acc[rootKey] ||= {};
      const lastObj = nestedKeys.reduce((acc, nestedKey) => {
        acc[nestedKey] ||= {};
        return acc[nestedKey];
      }, acc[rootKey]);
      lastObj[lastKey] = fields[key];
    } else {
      acc[key] = fields[key];
    }
    return acc;
  }, {});
};

export const eventDuration = (data, events) => {
  if (!data) {
    return;
  }
  const now = new Date().getTime();
  let duration;
  switch (events[0]) {
    case "host_is_online":
      duration = now - data.ONLINE_EVENT_TS;
      break;
    case "ram_usage_recovered":
      duration = now - data.RAM_EVENT_TS;
      break;
    case "disk_usage_recovered":
      duration = now - data.DISK_EVENT_TS;
      break;
  }

  return humanizeDuration(duration, DATE_HUMANIZER_CONFIG);
};

export const setWarning = (data, prevData) => {
  const { RAM_THRESHOLD, DISK_THRESHOLD } = database.data.settings;
  const isRamWarning =
    (+data.SYSTEM_FREE_RAM / +data.SYSTEM_TOTAL_RAM) * 100 <
    100 - RAM_THRESHOLD;
  const isDiskWarning =
    (+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100 >
    DISK_THRESHOLD;

  if (isRamWarning && !prevData.last_ram_event) {
    data.RAM_EVENT_TS = new Date().getTime();
  }
  if (isDiskWarning && !prevData.last_disk_event) {
    data.DISK_EVENT_TS = new Date().getTime();
  }
};

export const createMonitorDataset = (data) => {
  const now = new Date().getTime();
  const monitor = {
    id: uuidv4(),
    event_created: now,
  };
  for (const key in data) {
    if (data[key] !== "" && typeof data[key] !== "boolean") {
      monitor[key] = data[key].trim();
    }
  }
  return monitor;
};

export const checkStatus = async (hostData) => {
  // const {URL, monitor_type, key_word, enable_auth, login, password} = hostData;
  // const basicAuth = 'Basic ' + Buffer.from(`${hostData.login}:${hostData.password}`).toString('base64');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  
  const response = hostData.enable_auth
    ? await fetch(hostData.URL, {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${hostData.login}:${hostData.password}`).toString(
              "base64"
            ),
        },
        signal: controller.signal,
      }).catch(() => null)
    : await fetch(hostData.URL, { signal: controller.signal }).catch((e) => e);
  clearTimeout(timeout);

  
 
  if (!response) {
    return { 
      error: 'No response',
      response: false 
    }
  }
  if (response.errno ) {
    

    if(response.errno === expiredError){
      hostData.SslError = expiredError
    }
    if(response.errno === wrongHostNameError){
      hostData.SslError = wrongHostNameError

    }
    return { 
      error: response.errno,
      response: false 
    }
  }
  switch (hostData.monitor_type) {
    case "status_code":
      return {
        status: response.status,
        response: response.status === 200,
      };
    case "keyword_exist": {
      const respText = await response.text();
      return {
        response: respText.includes(hostData.key_word)
      };
    }
    case "keyword_not_exist": {
      const respText = await response.text();
      return {
        response: !respText.includes(hostData.key_word),
      };
    }
  }
};

export const startScheduler = () => {
  database.data.httpMonitoringData.map((data) => {
    createScheduleJob(data.id, data.monitor_interval);
  });
};

export const schedulerTask = [];

export const createScheduleJob = (httpHostId, interval) => {
 


  const job = setInterval(async () => {
    const dbData = database.data.httpMonitoringData.find(
      (host) => host.id == httpHostId
    );
    const certificateExpireDate =!dbData.URL.includes("localhost:") ? new Date((await getSSLCert(getHostName(dbData.URL))).valid_to).getTime() : null;
    const now = new Date().getTime();
    const nullTime = new Date(0).getTime()
    const { HTTP_ISSUE_CONFIRMATION,DAYS_FOR_SSL_EXPIRED } = database.data.settings;
    const res = await checkStatus(dbData);  
    if (res.response !== dbData.okStatus  ) {     
      if (!dbData.numberOfFalseWarnings) {
        dbData.numberOfFalseWarnings = 0
      }
      if (!dbData.firstFalseConfirmationTime) {
        dbData.firstFalseConfirmationTime = new Date().getTime();
      }
      dbData.numberOfFalseWarnings = dbData.numberOfFalseWarnings + 1
     
      if (dbData.numberOfFalseWarnings >= +(HTTP_ISSUE_CONFIRMATION||0) + 1) {
        generateHttpEvent(dbData, {
          ...dbData,
          okStatus: !!res.response,
          status: res.status,
          event_created: dbData.firstFalseConfirmationTime,
        });

        dbData.okStatus = res.response;
        dbData.event_created = dbData.firstFalseConfirmationTime;
        dbData.numberOfFalseWarnings = 0;
        dbData.firstFalseConfirmationTime = 0; 
        dbData.SslError = ""     
      }
    }
    else { dbData.numberOfFalseWarnings = 0;
           dbData.firstFalseConfirmationTime = 0
           dbData.SslError = ""
    }
    if (!dbData.lastSslCheckingTime && !dbData.URL.includes("localhost:")){
      dbData.lastSslCheckingTime = nullTime
    }
    const checkingSSLintervalHours = 24;

    if (dbData.lastSslCheckingTime + checkingSSLintervalHours * 3600 * 1000 <= now) {
      if (now >=  certificateExpireDate - daysToMs(DAYS_FOR_SSL_EXPIRED || 14)){
       
        dbData.lastSslCheckingTime = now
        dbData.sslWarning = true
        generateHttpWarningEvents(dbData,certificateExpireDate)
      }
      else {
        dbData.sslWarning = false

      }
    
    }  
   
    
    
    
    await database.write();
  }, interval * 1000);

  schedulerTask.push({
    id: httpHostId,
    scheduleJob: job,
  });
};

export const stopScheduleJob = (id) => {
  const task = schedulerTask.find((el) => el.id === id);
  clearInterval(task?.scheduleJob);
};

export const roundToNearestMinute = (date) => {
  const minutes = 1;
  const ms = 1000 * 60 * minutes;

  return Math.ceil(date / ms) * ms;
};

export const dbClearScheduler = async () => {
  const now = new Date().getTime();
  const time = now - 48 * 60 * 60 * 1000; // 48 hours ago in ms
  const { monitoringData } = database.data;

  monitoringData.map(async (host) => {
    const id = host.id;
    const dbIndex = levelDb.sublevel(id, { valueEncoding: "json" });
    await dbIndex.clear({ lt: time.toString() }).catch((e) => console.log(e));
  });
};

const getSSLCert = async function (url) {
  return  await sslCertificate.get(url)
}

const getHostName = (url)=>{
  return new URL(url).host
}

 export const daysToMs = function(days){
  return +days * 24 * 3600 * 1000 
 }


