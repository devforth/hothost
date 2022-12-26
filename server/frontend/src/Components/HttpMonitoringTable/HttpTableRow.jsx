import React from "react";
import { useState } from "react";
import OutsideHider from "../OutsideAlert/OutsideAlert";
import { Tooltip, Dropdown } from "flowbite-react";
import SSLinfo from "./SSLinfo";

const HttpTableRow = (props) => {
  const [chosenHost, setChosenHost] = useState("");

  const [dotsIsVisible, setDotsIsvisible] = useState(false);
  const monitor = props.monitor;
  const getDeleteId = props.getDeleteId;
  const getLabelId = props.getLabelId;
  const changeMonitorSetting = props.changeMonitorSetting;
  const addNotificationSettings = props.addNotificationSettings;
  const getNOtificationOfMonitor = props.getNOtificationOfMonitor;

  const checkSslWarn = props.checkSslWarn;

  return (
    <tr className="py-4 mobile:grid mobile:gap-4 mobile:grid-cols-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 ">
      <td className="pr-4 flex-1 items-center text-base font-semibold text-gray-900 dark:text-white">
        {monitor.status ? (
          <span>🟢OK</span>
        ) : (
          <Tooltip
            content={`Host error: ${monitor.sslError || monitor.errno}`}
            placement="bottom"
          >
            <span
              data-tooltip-placement="bottom"
              data-tooltip-target="tooltip_online_alert-{{@index}}"
            >
              🔴 Error
            </span>
          </Tooltip>
        )}
      </td>
      <td className="pr-4 row-start-2 col-start-1   flex-1 text-gray-900 dark:text-white   ">
        <Tooltip
          content={`Monitor type : ${monitor.monitor_type}`}
          placement="bottom"
        >
          <p className="overflow-hidden max-w-[400px] truncate">
            <span className="whitespace-">
              <a href={monitor.url} target="_blank">
                {monitor.url}
              </a>
            </span>
            {monitor.label && monitor.label !== "" && (
              <span className="bg-gray-200 text-gray-800 text-sm dark:text-white dark:bg-gray-700 rounded-lg font-semibold px-2.5 py-0.5 ml-1">
                {monitor.label}
              </span>
            )}
          </p>
        </Tooltip>

        {monitor.sslWarning ? (
          <div className="flex items-center">
            <Tooltip
              content={`SSL certificate will expire soon. Certificate is valid until: ${new Date(
                monitor.certificateExpireDate
              )}`}
              placement="bottom"
            >
              <span className="bg-yellow-200 text-yellow-500 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-500">
                Warning
              </span>
            </Tooltip>
            <button
              onClick={() => {
                checkSslWarn(monitor.id);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 ml-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </td>
      <td className="pr-4 flex-1 items-center text-base font-semibold text-gray-900 dark:text-white">
        <SSLinfo certInfo={monitor.certInfo}></SSLinfo>
      </td>

      <td className="pr-4 flex-1 text-gray-900 dark:text-white min-w-max">
        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
          Up\down time
        </p>
        <p>{monitor.monitorLastEventsTs}</p>
      </td>
      <td>
        {" "}
        {!monitor?.enabledPlugins?.ALL_PLUGINS.value &&
        monitor?.enabledPlugins &&
        Object?.entries(monitor?.enabledPlugins)
          .filter((e) => {
            return e[1].value === false && e[0] !== "ALL_PLUGINS";
          })
          .at(0) ? (
          <div className="dark:text-white text-black ">
            <Tooltip
              content={`Disabled plugin${
                Object.entries(monitor?.enabledPlugins)
                  .filter((e) => {
                    return e[1].value === false;
                  })
                  .at(1)
                  ? "s"
                  : ""
              }: ${Object.entries(monitor?.enabledPlugins)
                .filter((e) => {
                  return e[1].value !== false;
                })
                .map((e) => {
                  return e[0];
                })
                .join(" | ")}`}
              placement="left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
                />
              </svg>
            </Tooltip>
          </div>
        ) : null}{" "}
      </td>
      <td className="mobile:flex mobile:self-center mobile:place-content-end">
        <OutsideHider state={dotsIsVisible} setstate={setDotsIsvisible}>
          <button
            id={monitor.id}
            onClick={(e) => {
              setChosenHost(e.target.id);
              setDotsIsvisible(!dotsIsVisible);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="dropdownDots-{{@index}}"
              data-dropdown-toggle="dropdownDotsInfo-{{@index}}"
              data-dropdown-placement="bottom-end"
              className="h-6 w-6 text-gray-700 dark:text-gray-100 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          <div
            id="dropdownDotsInfo-{{@index}}"
            className={`z-10 ${
              dotsIsVisible ? "absolute translate-x-[-75%]" : "hidden "
            }  w-max bg-white shadow text-sm font-medium text-white rounded-lg transition-opacity duration-300 dark:bg-gray-700`}
          >
            <button
              type="button"
              id={monitor.id}
              onClick={(e) => {
                getLabelId(e.target.id);
                setDotsIsvisible(false);
              }}
              data-modal-toggle="modal_label-{{@index}}"
              className="mx-3 flex text-sm my-2 text-gray-900 dark:text-white hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 pr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Add label
            </button>
            <button
              type="button"
              id={monitor.id}
              onClick={(e) => {
                changeMonitorSetting(e.target.id);
                setDotsIsvisible(false);
              }}
              data-modal-toggle="modal_delete-{{@index}}"
              className="mx-3 my-2 flex text-left hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6 pr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </button>
            <button
              type="button"
              id={monitor.id}
              onClick={(e) => {
                getNOtificationOfMonitor(e.target.id);
                setDotsIsvisible(false);
              }}
              data-modal-toggle="modal_delete-{{@index}}"
              className="mx-3 my-2 flex text-left hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6 pr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              Send to
            </button>
            <button
              type="button"
              id={monitor.id}
              onClick={(e) => {
                getDeleteId(e.target.id);
                setDotsIsvisible(false);
              }}
              data-modal-toggle="modal_delete-{{@index}}"
              className="mx-3 my-2 flex text-left text-red-600 hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 pr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </OutsideHider>
      </td>
    </tr>
  );
};

export default HttpTableRow;
