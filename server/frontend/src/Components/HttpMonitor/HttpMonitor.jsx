import React from "react";
import { useState } from "react";
import { apiFetch, getData } from "../../../FetchApi";
import { useRef, useEffect } from "react";
import HttpMonitoringTable from "../HttpMonitoringTable/HttpMonitoringTable";

const HttpMonitor = () => {
  const [monitorIsVisible, setMonitorIsVisible] = useState(false);
  const [monitorUrlInp, setMonitorUrlInp] = useState("");
  const [monitorIntervalRng, setMonitorIntervalRng] = useState("30");
  const [basicAuthChk, setBasicAuthChk] = useState(false);
  const [loginInp, setLoginInp] = useState("");
  const [passwordInp, setPasswordInp] = useState("");
  const [monitorTypeSlt, setMonitorTypeSlt] = useState("status_code");
  const [keyWordInp, setKeyWordInp] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [status, setStatus] = useState("fullfield");
  const [monitoringHttpData, setMonitoringHttpData] = useState([]);
  const resetFieds = function () {
    setMonitorUrlInp("");

    setLoginInp("");
    setPasswordInp("");
    setKeyWordInp("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setStatus("pending");

      const data = await getData("http-monitor");
      if (data.data) {
        setMonitoringHttpData(data.data);
      }
      setStatus("fullfield");
    };
    const intervalId = setInterval(fetchData, 10000);
    fetchData();
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const loginInpEl = useRef(null);
  const passwordInpEl = useRef(null);
  const urlInpEl = useRef(null);

  const addHttpMonitor = async function () {
    if (!monitorUrlInp) {
      urlInpEl.current.focus();
      setUrlError(true);
    } else {
      if (basicAuthChk) {
        if (!loginInp) {
          setLoginError(true);
          loginInpEl.current.focus();
        } else {
          if (!passwordInp) {
            setPasswordError(true);
            passwordInpEl.current.focus();
          } else {
            const body = {
              URL: monitorUrlInp,
              enable_auth: basicAuthChk,
              monitor_interval: monitorIntervalRng,
              login: loginInp,
              password: passwordInp,
              monitor_type: monitorTypeSlt,
              key_word: keyWordInp,
            };

            const data = await apiFetch(body, "add_http_monitor");
            if (data) {
              resetFieds();
              setMonitoringHttpData(data.data);
            }
          }
        }
      } else {
        if (!passwordInp) {
          setPasswordError(true);
          passwordInpEl.current.focus();
        } else {
          const body = {
            URL: monitorUrlInp,
            enable_auth: basicAuthChk,
            monitor_interval: monitorIntervalRng,
            login: loginInp,
            password: passwordInp,
            monitor_type: monitorTypeSlt,
            key_word: keyWordInp,
          };

          const data = await apiFetch(body, "add_http_monitor");
          if (data) {
            resetFieds();
            setMonitoringHttpData(data.data);
          }
        }
      }
    }
  };
  return (
    <div>
      <div class="flex justify-between items-center mb-4">
        <h5 class="mobile:w-min text-xl font-bold leading-none text-gray-900 dark:text-white">
          Add Http(s) monitoring
        </h5>
        <button
          onClick={() => {
            setMonitorIsVisible(!monitorIsVisible);
          }}
          class="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none mobile:w-max focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex mobile:inline items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add new host
        </button>
      </div>
      <div id="monitor_form" class={monitorIsVisible ? "" : "hidden"}>
        <label
          for="URL"
          class={`block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 ${
            urlError && "text-red-700"
          }`}
        >
          {urlError ? "Monitor url is required" : "Monitor url"}
        </label>

        <input
          ref={urlInpEl}
          name="URL"
          id="monitorURL"
          value={monitorUrlInp}
          onChange={(e) => {
            setMonitorUrlInp(e.target.value);
            setUrlError(false);
          }}
          type="text"
          placeholder="https://example.com"
          required
          class="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />

        <label
          for="monitor_interval"
          class="block text-sm font-semibold text-gray-900 dark:text-gray-200"
        >
          Monitor interval (sec)
        </label>
        <div class="flex justify-between items-center mb-5">
          <input
            name="monitor_interval"
            id="monitorInterval"
            onChange={(e) => {
              setMonitorIntervalRng(e.target.value);
            }}
            type="range"
            min="1"
            max="120"
            value={monitorIntervalRng}
            class="w-4/5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div class="text-gray-900 dark:text-gray-200">
            <span id="interval">{monitorIntervalRng}</span> sec.
          </div>
        </div>
        <label
          for="enable_auth"
          class="relative inline-flex items-center mb-4 cursor-pointer"
        >
          <input
            name="enable_auth"
            id="enable_auth"
            onClick={() => {
              setBasicAuthChk(!basicAuthChk);
            }}
            type="checkbox"
            value={basicAuthChk}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Enable basic auth
          </span>
        </label>
        <div id="baseAuth" class={`${basicAuthChk ? "" : "hidden"}`}>
          <label
            for="login"
            class={`block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 ${
              loginError && "text-red-700"
            }`}
          >
            {loginError ? "Login is required" : "Login"}
          </label>
          <input
            ref={loginInpEl}
            name="login"
            value={loginInp}
            onChange={(e) => {
              setLoginInp(e.target.value);
              setLoginError(false);
            }}
            id="login"
            type="text"
            placeholder="login"
            class="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
          <label
            for="password"
            class={`block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 ${
              passwordError && "text-red-700"
            }`}
          >
            {passwordError ? "Password is required" : "Password"}
          </label>
          <input
            ref={passwordInpEl}
            name="password"
            value={passwordInp}
            onChange={(e) => {
              setPasswordInp(e.target.value);
              setPasswordError(false);
            }}
            id="password"
            type="password"
            class="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div class="mb-6">
          <label
            for="monitor_type"
            class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-400"
          >
            Select monitor type
          </label>
          <select
            value={monitorTypeSlt}
            id="monitor_type"
            onChange={(e) => {
              setMonitorTypeSlt(e.target.value);
            }}
            name="monitor_type"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="status_code">Status code is 200</option>
            <option value="keyword_exist">Keyword exists</option>
            <option value="keyword_not_exist">Keyword not exists</option>
          </select>
        </div>
        <div
          id="keyWordPlace"
          class={monitorTypeSlt === "status_code" ? "hidden" : ""}
        >
          <label
            for="key_word"
            class="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
          >
            "status_code" Key Word
          </label>
          <input
            value={keyWordInp}
            onChange={(e) => {
              setKeyWordInp(e.target.value);
            }}
            name="key_word"
            id="keyWordInp"
            type="text"
            placeholder="Keyword"
            class="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={addHttpMonitor}
          class=" mr-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => {
            setMonitorIsVisible(false);
          }}
          class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        >
          Close
        </button>
        <div class="my-4 border-b-2 border-gray-200 dark:border-gray-700"></div>
      </div>
      <div class="flow-root overflow-auto mobile:truncate">
        <HttpMonitoringTable
          monitoringHttpData={monitoringHttpData}
          setMonitoringHttpData={setMonitoringHttpData}
        ></HttpMonitoringTable>
      </div>
    </div>
  );
};
{
}

export default HttpMonitor;
