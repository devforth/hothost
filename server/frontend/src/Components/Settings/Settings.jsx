import React from "react";
import { getData, apiFetch } from "../../../FetchApi.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tooltip } from "flowbite-react";
import { Toast } from "flowbite-react";

const Settings = () => {
  const [defaultSettings, setDefaultSettings] = useState("");
  const [inpError, setInpError] = useState(false);

  const [diskUsage, setDiskUsage] = useState(defaultSettings.disk_threshold);
  const [diskStabilization, setdiskStabilization] = useState(
    defaultSettings.disk_stabilization_lvl
  );
  const [RAMusage, setRAMusage] = useState(defaultSettings.ram_threshold);
  const [RAMstabilization, setRAMstabilization] = useState(
    defaultSettings.ram_stabilization_lvl
  );

  const [HOSTDOWNnotificationDelay,setHOSTDOWNnotificationDelay] = useState({value:1,error:false})
  const [HTTPIssueNotificationDelay, setHTTPIssueNotification] = useState({value:1, erorr:false})

  const [toastState, setToastState] = useState({
    isVisible: false,
    content: "red",
    type: "red",
  });

  const showToast = function () {
    setToastState({ isVisible: true });
  };

  let navigate = useNavigate();
  function handleClick() {
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
    setDiskUsage (defaultSettings.disk_threshold);
    setdiskStabilization (defaultSettings.disk_stabilization_lvl);
    setRAMstabilization (defaultSettings.ram_stabilization_lvl);
    setRAMusage (defaultSettings.ram_threshold);
    setHOSTDOWNnotificationDelay ({...HOSTDOWNnotificationDelay, value:defaultSettings.host_is_down_confirmations});
    setHTTPIssueNotification({...HTTPIssueNotificationDelay, value:defaultSettings.http_issue_confirmations});
    
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
  const confirmationFieldValidation = function(value){
   if (+value > 10)
      {return 10}
    else if ( +value <0 )
      { return 0 }
    else { return +value}     
  }

  const saveSettings = async function () {
   
    setHOSTDOWNnotificationDelay(
      {
        ...HOSTDOWNnotificationDelay,
        value:confirmationFieldValidation(HOSTDOWNnotificationDelay.value)
      }
      );
    setHTTPIssueNotification({
      ...HTTPIssueNotificationDelay,
      value:confirmationFieldValidation(HTTPIssueNotificationDelay.value)
    });


    


    const inptValues = [
      diskUsage,
      diskStabilization,
      RAMusage,
      RAMstabilization,
    ];
    
    if (isArrNumber(inptValues)[0] && isArrNumber(inptValues)[0] !== "err") {
      const body = {
        disk_threshold: isArrNumber(inptValues)[0],
        disk_stabilization_lvl: isArrNumber(inptValues)[1],
        ram_threshold: isArrNumber(inptValues)[2],
        ram_stabilization_lvl: isArrNumber(inptValues)[3],
        host_is_down_confirmations: confirmationFieldValidation(HOSTDOWNnotificationDelay.value),
        http_issue_confirmations: confirmationFieldValidation(HTTPIssueNotificationDelay.value)
      };
      const data = await apiFetch(body, "edit_settings");
      if ((data.code = 200)) {
        // setDefaultSettings()
        // setInpError;
        // setDiskUsage;
        // setdiskStabilization;
        showToast();
        setTimeout(() => {
          setToastState({ isVisible: false });
        }, 3000);

        setDiskUsage(isArrNumber(inptValues)[0]);
        setdiskStabilization(isArrNumber(inptValues)[1]);
        setRAMstabilization(isArrNumber(inptValues)[3]);
        setRAMusage(isArrNumber(inptValues)[2]);
      }
    } else {
      setInpError(true);
    }
  };

  return (
    <div>
      <div class="container mx-auto flex justify-center">
        <div class=" p-4 my-5 mx-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700">
          <div class="flex justify-between items-center mb-5">
            <div onClick={handleClick}>
              <p
                class="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
            focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5
            text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
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

          <div class="flex justify-between items-center mb-4">
            <h5 class="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">
              Settings
            </h5>
          </div>
          <div class="w-full block divide-gray-200 dark:divide-gray-700">
            <div class="mb-5">
              <label
                for="disk_threshold"
                class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Disk usage threshold in percents.
              </label>
              <input
                name="disk_threshold"
                value={diskUsage}
                onChange={(e) => {
                  setDiskUsage(e.currentTarget.value);
                  setInpError(false);
                }}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p class="text-xs text-gray-400 dark:text-gray-300">
                If disk usage exceeds this value then disk_is_almost_full alert
                is generated
              </p>
            </div>
            <div class="mb-5">
              <label
                for="disk_stabilization_lvl"
                class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Disk stabilization level in percents.
              </label>
              <input
                name="disk_stabilization_lvl"
                value={diskStabilization}
                onChange={(e) => {
                  setdiskStabilization(e.currentTarget.value);
                  setInpError(false);
                }}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              {/* <!-- <p class="text-xs text-gray-400 dark:text-gray-300">--------</p> --> */}
            </div>
            <div class="mb-5">
              <label
                for="ram_threshold"
                class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Ram usage threshold in percents.
              </label>
              <input
                name="ram_threshold"
                value={RAMusage}
                onChange={(e) => {
                  setRAMusage(e.currentTarget.value);
                }}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p class="text-xs text-gray-400 dark:text-gray-300">
                If RAM usage exceeds this value then ram_is_almost_full alert is
                generated.
              </p>
            </div>
            <div class="mb-5">
              <label
                for="ram_stabilization_lvl"
                class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Ram stabilization level in percents.
              </label>
              <input
                name="ram_stabilization_lvl"
                value={RAMstabilization}
                onChange={(e) => {
                  setRAMstabilization(e.currentTarget.value);
                  setInpError(false);
                }}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              {/* <!-- <p class="text-xs text-gray-400 dark:text-gray-300">--------</p> --> */}
            </div>
            <div class="mb-5">
              <label
                for="notificationDelay"
                class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Host is Down confirmations
              </label>
              <input
                name="notificationDelay"
                value={HOSTDOWNnotificationDelay.value}
                onChange={(e) => {
                  setHOSTDOWNnotificationDelay({
                    ...HOSTDOWNnotificationDelay,
                    value:e.currentTarget.value});
                  
                }}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p class="text-xs text-gray-400 dark:text-gray-300 mt-1"> 0 - send notification and update status instantly, once you receive host is down event. Fastest - alert is send within MONITORING_INTERVAL (default 30 seconds). But might give false positive alerts during short-term network issue.</p>
              <p class="text-xs text-gray-400 dark:text-gray-300 mt-1"> 1 - (Default value) - send notification only after 1st event which confirms host is down. Alert is send within 2 * MONITORING_INTERVAL.</p>
              <p class="text-xs text-gray-400 dark:text-gray-300 mt-1"> N - send notification after N confirmations. Notification is delayed by (N + 1) * MONITORING_INTERVAL.</p>
              </div>
            <div class="mb-5">
              <label
                for="HTTPnotificationDelay"
                class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              >
                Http issue confirmations
              </label>
              <input
                name="HTTPnotificationDelay"
                value={HTTPIssueNotificationDelay.value}
                onChange={(e) => {
                  setHTTPIssueNotification({
                    ...HTTPIssueNotificationDelay,
                    value:e.currentTarget.value});
                
                }}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <p class="text-xs text-gray-400 dark:text-gray-300 mt-1"> 0 - send notification and update status instantly, once you receive host is down event. Fastest - alert is send within MONITORING_INTERVAL (selected in settings). But might give false positive alerts during short-term network issue.</p>
              <p class="text-xs text-gray-400 dark:text-gray-300 mt-1"> 1 - (Default value) - send notification only after 1st event which confirms host is down. Alert is send within 2 * MONITORING_INTERVAL.</p>
              <p class="text-xs text-gray-400 dark:text-gray-300 mt-1"> N - send notification after N confirmations. Notification is delayed by (N + 1) * MONITORING_INTERVAL.</p>

              


              
              
             
            </div>
            <button
              type="button"
              onClick={saveSettings}
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800  disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
              disabled={
                !diskUsage ||
                !diskStabilization ||
                !RAMusage ||
                !RAMstabilization ||
                inpError
              }
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      {toastState.isVisible ?
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
        </div> : null }

    </div>
  );
};
export default Settings;
