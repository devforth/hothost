import React from "react";
import { useState } from "react";
import { apiFetch, getData } from "../../../FetchApi";
import { useRef, useEffect } from "react";
import HttpMonitoringTable from "../HttpMonitoringTable/HttpMonitoringTable";
import validator from "validator";

const HttpMonitor = () => {
  const checkInputs = (inp, inpEl, setInpErr) => {
    if (!inp) {
      inpEl.current.focus();
      setInpErr(true);
      return false;
    } else return true;
  };
  const fetchData = async () => {
    setStatus("pending");

    const data = await getData("http-monitor");
    if (data.data) {
      setMonitoringHttpData(data.data);
    }
    setStatus("fullfield");
  };

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
  const [keyWordError, setKeyWordError] = useState(false);
  const [status, setStatus] = useState("fullfield");
  const [monitoringHttpData, setMonitoringHttpData] = useState([]);
  const resetFieds = function () {
    setMonitorUrlInp("");
    setLoginInp("");
    setPasswordInp("");
    setKeyWordInp("");
  };

  useEffect(() => {
    
    const intervalId = setInterval(fetchData, 10000);
    fetchData();
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const checkSslWarn =  async function (id) {
     const data = await apiFetch({id},"check-ssl");
     if (data) { fetchData() }
    
  }

  const loginInpEl = useRef(null);
  const passwordInpEl = useRef(null);
  const urlInpEl = useRef(null);
  const keywordInpEl = useRef(null);

  const addHttpMonitor = async function () {
    let body = {};
    let validationIsOk = false;

    if (checkInputs(monitorUrlInp, urlInpEl, setUrlError)) {
      validationIsOk = true;
      if (!validator.isURL(monitorUrlInp) && monitorUrlInp.includes('locallhost')) {
        setUrlError("Field value must be url");
        urlInpEl.current.focus();
        validationIsOk = false;
      }
    } else return;

    if (basicAuthChk) {
      if (checkInputs(loginInp, loginInpEl, setLoginError)) {
        validationIsOk = true;
      } else return;
      if (checkInputs(passwordInp, passwordInpEl, setPasswordError)) {
        validationIsOk = true;
      } else return;

      if (monitorTypeSlt !== "status_code") {
        if (checkInputs(keyWordInp, keywordInpEl, setKeyWordError)) {
          validationIsOk = true;
        } else return;
      }
      body = {
        URL: monitorUrlInp,
        enable_auth: basicAuthChk,
        monitor_interval: monitorIntervalRng,
        login: loginInp,
        password: passwordInp,
        monitor_type: monitorTypeSlt,
        key_word: keyWordInp,
      };
      if (validationIsOk) {
        const data = await apiFetch(body, "add_http_monitor");
        if (data) {
          resetFieds();
          setMonitoringHttpData(data.data);
        }
      }
    } else {
      if (monitorTypeSlt !== "status_code") {
        if (checkInputs(keyWordInp, keywordInpEl, setKeyWordError)) {
          validationIsOk = true;
        } else return;
      }
      body = {
        URL: monitorUrlInp,
        enable_auth: basicAuthChk,
        monitor_interval: monitorIntervalRng,
        login: "",
        password: "",
        monitor_type: monitorTypeSlt,
        key_word: keyWordInp,
      };
      if (validationIsOk) {
        const data = await apiFetch(body, "add_http_monitor");
        if (data) {
          resetFieds();
          setMonitoringHttpData(data.data);
        }
      }
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h5 className="mobile:w-min text-xl font-bold leading-none text-gray-900 dark:text-white">
          Add Http(s) monitoring
        </h5>
        <div>
          <button
            onClick={() => {
              setMonitorIsVisible(!monitorIsVisible);
            }}
            className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none mobile:w-max focus:ring-green-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center ml-2 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex mobile:inline items-center "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
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
      </div>
      <div id="monitor_form" className={monitorIsVisible ? "" : "hidden"}>
        <label
          htmlFor="URL"
          className={`block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 ${
            urlError ? "text-red-700 " : ""
          }`}
          style={{ color: urlError ? "red" : "" }}
        >
          {urlError && urlError === "Field value must be url"
            ? "Field value must be url"
            : urlError
            ? "Monitor url is required"
            : "Monitor url"}
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
          className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />

        <label
          htmlFor="monitor_interval"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-200"
        >
          Monitor interval (sec)
        </label>
        <div className="flex justify-between items-center mb-5">
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
            className="w-4/5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="text-gray-900 dark:text-gray-200">
            <span id="interval">{monitorIntervalRng}</span> sec.
          </div>
        </div>
        <label
          htmlFor="enable_auth"
          className="relative inline-flex items-center mb-4 cursor-pointer"
        >
          <input
            name="enable_auth"
            id="enable_auth"
            onClick={() => {
              setBasicAuthChk(!basicAuthChk);
            }}
            type="checkbox"
            value={basicAuthChk}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Enable basic auth
          </span>
        </label>
        <div id="baseAuth" className={`${basicAuthChk ? "" : "hidden"}`}>
          <label
            htmlFor="login"
            className={`block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 
            }`}
            style={{ color: loginError ? "red" : "" }}
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
            className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
          <label
            htmlFor="password"
            className={`block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 `}
            style={{ color: passwordError ? "red" : "" }}
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
            className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="monitor_type"
            className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-400"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="status_code">Status code is 200</option>
            <option value="keyword_exist">Keyword exists</option>
            <option value="keyword_not_exist">Keyword not exists</option>
          </select>
        </div>
        {monitorTypeSlt !== "status_code" ? (
          <div id="keyWordPlace">
            <label
              htmlFor="key_word"
              className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200"
              style={{ color: keyWordError ? "red" : "" }}
            >
              {" "}
              {keyWordError
                ? "status_code Key Word is required"
                : "status_code Key Word"}
            </label>
            <input
              ref={keywordInpEl}
              value={keyWordInp}
              onChange={(e) => {
                setKeyWordInp(e.target.value);
                setKeyWordError(false);
              }}
              name="key_word"
              id="keyWordInp"
              type="text"
              placeholder="Keyword"
              className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            />
          </div>
        ) : null}
        <button
          type="button"
          onClick={addHttpMonitor}
          disabled={passwordError || urlError || keyWordError || loginError}
          className={` ${
            passwordError || urlError || keyWordError || loginError
              ? "disabled"
              : null
          } mr-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500`}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => {
            setMonitorIsVisible(false);
          }}
          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        >
          Close
        </button>
        <div className="my-4 border-b-2 border-gray-200 dark:border-gray-700"></div>
      </div>
      <div className="flow-root overflow-auto mobile:truncate">
        <HttpMonitoringTable
          monitoringHttpData={monitoringHttpData}
          setMonitoringHttpData={setMonitoringHttpData}
          checkSslWarn={checkSslWarn}
        ></HttpMonitoringTable>
      </div>
    </div>
  );
};
{
}

export default HttpMonitor;
