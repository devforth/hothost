import React from "react";
import { useState } from "react";
import { apiFetch, getData } from "../../../FetchApi";
import { useRef, useEffect } from "react";
import HttpMonitoringTable from "../HttpMonitoringTable/HttpMonitoringTable";
import validator from "validator";
import { Toast } from "flowbite-react";
import ToggleButton from "../ToggleButton/ToggleButton.jsx";

const HttpMonitor = () => {

  const MIN_INTERVAL_HTTP_MONITORING = 1;
  const MAX_INTERVAL_HTTP_MONITORING = 600;

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
      const rssMonitors = data.data.filter(
        (m) => m.monitor_type === "rss_parser"
      );
      const httpMonitors = data.data.filter(
        (m) => m.monitor_type !== "rss_parser"
      );

      setMonitoringHttpData([...httpMonitors, ...rssMonitors]);
    }
    setStatus("fullfield");
  };
  const [editError, setEditError] = useState(false);
  const [lastCHangedMonitorId, setLastCHangedMonitorId] = useState("");
  const [edditingMonitor, setEdditingMonitor] = useState(false);
  const [monitorIsVisible, setMonitorIsVisible] = useState(false);
  const [monitorUrlInp, setMonitorUrlInp] = useState("");
  const [monitorIntervalRng, setMonitorIntervalRng] = useState("30");
  const [basicAuthChk, setBasicAuthChk] = useState(false);
  const [loginInp, setLoginInp] = useState("");
  const [passwordInp, setPasswordInp] = useState("");
  const [monitorTypeSlt, setMonitorTypeSlt] = useState("status_code");
  const [keyWordInp, setKeyWordInp] = useState("");
  const [caseSensitiveChk, setCaseSensitiveChk] = useState(false);
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

  const updateInterval = value => {
    if (isNaN(value)) {
      return;
    }

    setMonitorIntervalRng(Math.max(MIN_INTERVAL_HTTP_MONITORING, Math.min(MAX_INTERVAL_HTTP_MONITORING, value)));
  }

  useEffect(() => {
    const intervalId = setInterval(fetchData, 10000);
    fetchData();
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const changeMonitorSetting = function (id) {
    setLastCHangedMonitorId(id);
    const findingHost = monitoringHttpData.filter((el) => el.id === id)[0];
    if (findingHost) {
      setMonitorUrlInp(findingHost.url);
      updateInterval(findingHost.interval);
      if (findingHost.login) {
        setBasicAuthChk(!basicAuthChk);
        setLoginInp(findingHost.login);
        setPasswordInp(findingHost.password);
      }
      setMonitorTypeSlt(findingHost.monitor_type);
      if (findingHost.monitor_type !== "status_code") {
        setKeyWordInp(findingHost.keyWord);
      }
    }

    setEdditingMonitor(!edditingMonitor);
    setMonitorIsVisible(true);
  };

  const checkSslWarn = async function (id) {
    const data = await apiFetch({ id }, "check-ssl");
    if (data) {
      fetchData();
    }
  };

  const loginInpEl = useRef(null);
  const passwordInpEl = useRef(null);
  const urlInpEl = useRef(null);
  const keywordInpEl = useRef(null);

  const addHttpMonitor = async function () {
    let body = {};
    let validationIsOk = false;

    if (checkInputs(monitorUrlInp, urlInpEl, setUrlError)) {
      validationIsOk = true;
      if (
        !validator.isURL(monitorUrlInp) &&
        monitorUrlInp.includes("locallhost")
      ) {
        setUrlError("Field value must be url");
        urlInpEl.current.focus();
        validationIsOk = false;
      }
    } else return;
    // add Rss Parser
    if (monitorTypeSlt === "rss_parser") {
      body = {
        URL: monitorUrlInp,

        monitor_interval: monitorIntervalRng,

        monitor_type: monitorTypeSlt,

        enabledPlugins: {
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
        },
      };
      if (validationIsOk) {
        const data = await apiFetch(body, "add_http_monitor");
        if (data) {
          resetFieds();
          setMonitoringHttpData(data.data);
        }
      }
      return;
    }
    // add Rss Parser

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
        caseInsensitive: !caseSensitiveChk,
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
        caseInsensitive: !caseSensitiveChk,
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
  const editHttpMonitor = async (id) => {
    const body = {
      URL: monitorUrlInp,
      enable_auth: basicAuthChk,
      monitor_interval: monitorIntervalRng,
      login: basicAuthChk ? loginInp : "",
      password: basicAuthChk ? passwordInp : "",
      monitor_type: monitorTypeSlt,
      key_word: keyWordInp,
      caseInsensitive: !caseSensitiveChk,
      id,
    };

    const data = await apiFetch(body, "edit_http_monitor");
    if (!data.error) {
      setEdditingMonitor(false);
    } else {
      setEditError(true);
      setTimeout(() => {
        setEditError(false);
      }, 5000);
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h5 className="mobile:w-min text-xl font-bold leading-none text-gray-900 dark:text-white">
          {edditingMonitor
            ? "Change Http(s) monitoring"
            : "Add Http(s) monitoring"}
        </h5>
        <div>
          {edditingMonitor ? (
            <button
              type="button"
              onClick={() => {
                setEdditingMonitor(!edditingMonitor);
                setMonitorIsVisible(!monitorIsVisible);
              }}
              class=" text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-toggle="modal_label-{{@index}}"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          ) : (
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
          )}
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
          className="bg-gray-50 border mb-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />

        <label
          htmlFor="monitor_interval"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-200"
        >
          Monitor interval (sec)
        </label>
        <div className="flex items-center mb-5 gap-4">
          <input
            name="monitor_interval"
            id="monitorInterval"
            onChange={(e) => {
              updateInterval(e.target.value);
            }}
            type="range"
            min={MIN_INTERVAL_HTTP_MONITORING}
            max={MAX_INTERVAL_HTTP_MONITORING}
            value={monitorIntervalRng}
            className="w-4/5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 flex-1"
          />
          <div className={'flex items-center gap-4'}>
            <input
                    className="w-16 text-center p-2 rounded border bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    onChange={(e) => updateInterval(e.target.value)}
                    value={monitorIntervalRng}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        updateInterval( +monitorIntervalRng + 1);
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        updateInterval( +monitorIntervalRng - 1);
                      }
                    }}
            />
            <span className="text-gray-900 dark:text-gray-200">sec</span>
          </div>
        </div>
        {monitorTypeSlt !== "rss_parser" ? (
          <ToggleButton
                  text={"Enable basic auth"}
                  value={basicAuthChk}
                  toggle={() => setBasicAuthChk(!basicAuthChk)}
          />
        ) : null}
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
            <option value="keyword_exist">Keyword must exist in response</option>
            <option value="keyword_not_exist">Keyword must not exist in response</option>
            <option value="rss_parser">RSS parser</option>
          </select>
        </div>
        {monitorTypeSlt !== "status_code" && monitorTypeSlt !== "rss_parser" ? (
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
            <ToggleButton
                    text={"Case sensitive"}
                    value={caseSensitiveChk}
                    toggle={() => setCaseSensitiveChk(!caseSensitiveChk)}
            />
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (edditingMonitor) {
              editHttpMonitor(lastCHangedMonitorId);
            } else {
              addHttpMonitor();
            }
          }}
          disabled={passwordError || urlError || keyWordError || loginError}
          className={` ${
            passwordError || urlError || keyWordError || loginError
              ? "disabled"
              : null
          } mr-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500`}
        >
          {edditingMonitor ? "Edit" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMonitorIsVisible(false);
            setEdditingMonitor(false);
          }}
          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        >
          Close
        </button>
        <div className="my-4 border-b-2 border-gray-200 dark:border-gray-700"></div>
      </div>
      {edditingMonitor ? null : (
        <div className="flow-root overflow-auto mobile:truncate">
          <HttpMonitoringTable
            monitoringHttpData={monitoringHttpData}
            setMonitoringHttpData={setMonitoringHttpData}
            checkSslWarn={checkSslWarn}
            changeMonitorSetting={changeMonitorSetting}
          ></HttpMonitoringTable>
        </div>
      )}
      {editError ? (
        <div className="absolute bottom-0 right-0">
          <Toast
            className={
              " bg-red-100 text--500 dark:bg-red-800 dark:text-red-200"
            }
          >
            <div
              className={`inline-flex h-8 w-8 shrink-0 shadow-lg items-center justify-center rounded-lg bg-red-100 text--500 dark:bg-red-800 dark:text-red-200 z-50`}
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="ml-1"> Can`t edit monitor</p>
            <div className="ml-3 text-sm font-normal"></div>
            <Toast.Toggle />
          </Toast>
        </div>
      ) : null}
    </div>
  );
};
{
}

export default HttpMonitor;
