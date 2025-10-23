import React from "react";
import { getData, apiFetch } from "../../../FetchApi.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Toast } from "flowbite-react";
import InputExplanation from "./InputExplanation.jsx";
import { clampPercentString } from "../../utils";

const Settings = () => {
  const [defaultSettings, setDefaultSettings] = useState("");
  const [inpError, setInpError] = useState(false);

  const [diskUsage, setDiskUsage] = useState(
    defaultSettings.disk_threshold || 0
  );
  const [diskStabilization, setdiskStabilization] = useState(
    defaultSettings.disk_stabilization_lvl || 0
  );
  const [RAMusage, setRAMusage] = useState(defaultSettings.ram_threshold || 0);
  const [RAMstabilization, setRAMstabilization] = useState(
    defaultSettings.ram_stabilization_lvl || 0
  );

  const [HOSTDOWNnotificationDelay, setHOSTDOWNnotificationDelay] = useState({
    value: 1,
    error: false,
  });
  const [HTTPIssueNotificationDelay, setHTTPIssueNotification] = useState({
    value: 1,
    erorr: false,
  });
  const [daysForSslExpireNotify, setDaysForSslExpireNotify] = useState({
    value: 14,
  });
  const [hoursForNextAlert, setHoursForNextAlert] = useState({ value: 12 });

  const [toastState, setToastState] = useState({
    isVisible: false,
    content: "red",
    type: "red",
  });

  const showToast = function () {
    setToastState({ isVisible: true });
  };

  let navigate = useNavigate();
  function goToHome() {
    navigate("/home");
  }
  useEffect(() => {
    const fetchData = async () => {
      const data = await getData("getSettings");
      if (data) {
        setDefaultSettings(data.data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setDiskUsage(defaultSettings.disk_threshold);
    setdiskStabilization(defaultSettings.disk_stabilization_lvl);
    setRAMstabilization(defaultSettings.ram_stabilization_lvl);
    setRAMusage(defaultSettings.ram_threshold);
    setHOSTDOWNnotificationDelay({
      ...HOSTDOWNnotificationDelay,
      value: defaultSettings.host_is_down_confirmations,
    });
    setHTTPIssueNotification({
      ...HTTPIssueNotificationDelay,
      value: defaultSettings.http_issue_confirmations,
    });
    setDaysForSslExpireNotify({
      ...daysForSslExpireNotify,
      value: defaultSettings.days_for_ssl_expire,
    });
    setHoursForNextAlert({ value: defaultSettings.hours_for_next_alert });
  }, [defaultSettings]);

  const isArrNumber = function (arr) {
    let finalArr = [];
    let newarr = [];
    arr.forEach((element) => {
      if (isNaN(+element)) {
      } else {
        newarr.push(+element);
      }
    });
    if (newarr.length === arr.length) {
      const validatedArr = newarr.map((e) => {
        return e > 100 ? 100 : e;
      });
      finalArr = validatedArr;
    } else {
      finalArr = ["err"];
    }
    return finalArr;
  };
  const confirmationFieldValidation = function (value) {
    if (+value < 0) return 0;
    else {
      if (isNaN(+value)) {
        return 1;
      } else {
        return +value;
      }
    }
  };

  const saveSettings = async function () {
    setHOSTDOWNnotificationDelay({
      ...HOSTDOWNnotificationDelay,
      value: confirmationFieldValidation(HOSTDOWNnotificationDelay.value),
    });
    setHTTPIssueNotification({
      ...HTTPIssueNotificationDelay,
      value: confirmationFieldValidation(HTTPIssueNotificationDelay.value),
    });
    setHoursForNextAlert({
      value: confirmationFieldValidation(hoursForNextAlert.value),
    });

    const inptValues = [
      diskUsage,
      diskStabilization,
      RAMusage,
      RAMstabilization,
      HOSTDOWNnotificationDelay.value,
      HTTPIssueNotificationDelay.value,
      daysForSslExpireNotify.value,
      hoursForNextAlert.value,
    ];
    const validated = isArrNumber(inptValues);

    if (validated[0] !== "err" && !inpError) {
      const body = {
        disk_threshold: validated[0],
        disk_stabilization_lvl: validated[1],
        ram_threshold: validated[2],
        ram_stabilization_lvl: validated[3],
        host_is_down_confirmations: validated[4],
        http_issue_confirmations: validated[5],
        days_for_ssl_expire: validated[6],
        hours_for_next_alert: validated[7],
      };
      const data = await apiFetch(body, "edit_settings");
      if (data.code === 200) {
        // setDefaultSettings()
        // setInpError;
        // setDiskUsage;
        // setdiskStabilization;
        showToast();
        setTimeout(() => {
          setToastState({ isVisible: false });
        }, 3000);

        setDiskUsage(validated[0]);
        setdiskStabilization(validated[1]);
        setRAMstabilization(validated[3]);
        setRAMusage(validated[2]);
      }
    } else {
      setInpError(true);
    }
  };

  return (
    <div>
      <div className="container mx-auto flex justify-center">
        <div className=" p-4 my-5 mx-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <div onClick={goToHome} className="cursor-pointer">
              <p
                className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
            focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5
            text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to hosts list
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h5 className="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">
              Settings
            </h5>
          </div>
          <div className="w-full block divide-gray-200 dark:divide-gray-700">
            <div className="mb-5">
              <label
                for="disk_threshold"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Disk usage threshold in percents.
              </label>
              <input
                name="disk_threshold"
                value={diskUsage ?? ""}
                type="number"
                min={0}
                max={100}
                onChange={(e) => {
                  setDiskUsage(clampPercentString(e.currentTarget.value, 0, 100));
                  setInpError(false);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p className="text-xs text-gray-400 dark:text-gray-300">
                If disk usage exceeds this value then disk_is_almost_full alert
                is generated
              </p>
            </div>
            <div className="mb-5">
              <label
                for="disk_stabilization_lvl"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Disk stabilization level in percents.
              </label>
              <input
                name="disk_stabilization_lvl"
                value={diskStabilization ?? ""}
                type="number"
                min={0}
                max={100}
                onChange={(e) => {
                  setdiskStabilization(clampPercentString(e.currentTarget.value, 0, 100));
                  setInpError(false);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="mb-5">
              <label
                for="ram_threshold"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Ram usage threshold in percents.
              </label>
              <input
                name="ram_threshold"
                value={RAMusage ?? ""}
                type="number"
                min={0}
                max={100}
                onChange={(e) => {
                  setRAMusage(clampPercentString(e.currentTarget.value, 0, 100));
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p className="text-xs text-gray-400 dark:text-gray-300">
                If RAM usage exceeds this value then ram_is_almost_full alert is
                generated.
              </p>
            </div>
            <div className="mb-5">
              <label
                for="ram_stabilization_lvl"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Ram stabilization level in percents.
              </label>
              <input
                name="ram_stabilization_lvl"
                value={RAMstabilization ?? ""}
                type="number"
                min={0}
                max={100}
                onChange={(e) => {
                  setRAMstabilization(clampPercentString(e.currentTarget.value, 0, 100));
                  setInpError(false);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="mb-5">
              <label
                for="notificationDelay"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Host is Down confirmations
              </label>
              <input
                name="notificationDelay"
                value={
                  HOSTDOWNnotificationDelay.value === undefined
                    ? ""
                    : HOSTDOWNnotificationDelay.value
                }
                type="number"
                min={0}
                onChange={(e) => {
                  setHOSTDOWNnotificationDelay({
                    ...HOSTDOWNnotificationDelay,
                    value: clampPercentString(e.currentTarget.value, 0),
                  });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <InputExplanation
                text={[
                  "0 - send notification and update status instantly, once you receive host is down event. Fastest - alert is send within MONITORING_INTERVAL (default 30 seconds). But might give false positive alerts during short-term network issue.",
                  "1 - (Default value) - send notification only after 1st event which confirms host is down. Alert is send within 2 * MONITORING_INTERVAL.",
                  "N - send notification after N confirmations. Notification is delayed by (N + 1) * MONITORING_INTERVAL.",
                ]}
              ></InputExplanation>
            </div>
            <div className="mb-5">
              <label
                for="HTTPnotificationDelay"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Http issue confirmations
              </label>
              <input
                name="HTTPnotificationDelay"
                value={
                  HTTPIssueNotificationDelay.value === undefined
                    ? ""
                    : HTTPIssueNotificationDelay.value
                }
                type="number"
                min={0}
                onChange={(e) => {
                  setHTTPIssueNotification({
                    ...HTTPIssueNotificationDelay,
                    value: clampPercentString(e.currentTarget.value, 0),
                  });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <InputExplanation
                text={[
                  "0 - send notification and update status instantly, once you receive host is down event. Fastest - alert is send within MONITORING_INTERVAL (selected in settings). But might give false positive alerts during short-term network issue.",
                  "1 - (Default value) - send notification only after 1st event which confirms host is down. Alert is send within 2 * MONITORING_INTERVAL.",
                  "N - send notification after N confirmations. Notification is delayed by (N + 1) * MONITORING_INTERVAL.",
                ]}
              ></InputExplanation>
            </div>
            <div className="mb-5">
              <label
                for="ssl_notification period"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Days before SSL expiration
              </label>
              <input
                name="ssl_notification period"
                value={daysForSslExpireNotify.value || ""}
                type="number"
                min={0}
                onChange={(e) => {
                  setDaysForSslExpireNotify({ value: clampPercentString(e.currentTarget.value, 0) });
                  setInpError(false);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">
                {" "}
                Send warning message before SSL expiration.{" "}
              </p>
              {/* <!-- <p className="text-xs text-gray-400 dark:text-gray-300">--------</p> --> */}
            </div>
            <div className="mb-5">
              <label
                for="diskAlert repeat period"
                className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Hours for next disc notification
              </label>
              <input
                name="diskAlert repeat period"
                value={hoursForNextAlert.value || ""}
                type="number"
                min={0}
                onChange={(e) => {
                  setHoursForNextAlert({ value: clampPercentString(e.currentTarget.value, 0) });
                  setInpError(false);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <InputExplanation
                text={[
                  "0  - only send a notification the first time an alert occurs",
                  "12 - (Default value) - send  notification every 12 hours if there is 'Disk usage alert'",
                  "N  - send notification after N hours if there is 'Disk usage alert'",
                ]}
              ></InputExplanation>
              {/* <!-- <p className="text-xs text-gray-400 dark:text-gray-300">--------</p> --> */}
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={saveSettings}
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800  disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
                disabled={
                  diskUsage === "" ||
                  diskStabilization === "" ||
                  RAMusage === "" ||
                  RAMstabilization === "" ||
                  daysForSslExpireNotify.value === "" ||
                  hoursForNextAlert.value === "" ||
                  inpError
                }
              >
                Submit
              </button>
              {inpError ? (
                <p className="block mb-2 text-sm font-semibold  ml-3  text-red-600">
                  Inputs values must be numbers
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {toastState.isVisible ? (
        <div className="fixed bottom-0 right-0 z-50">
          <Toast
            className={
              " bg-green-100 text--500 dark:bg-green-800 dark:text-green-200"
            }
          >
            <div
              className={`inline-flex mr-1 h-8 w-8 shrink-0 shadow-lg items-center justify-center rounded-lg bg-green-100 text--500 dark:bg-green-800 dark:text-green-200 z-50`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            Settings saved!
            <div className="ml-3 text-sm font-normal"></div>
            <Toast.Toggle />
          </Toast>
        </div>
      ) : null}
    </div>
  );
};
export default Settings;
