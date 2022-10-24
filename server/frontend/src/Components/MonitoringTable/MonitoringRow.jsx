import React from "react";
import { useState, useEffect, useRef } from "react";
import { Tooltip, Dropdown } from "flowbite-react";

const MonitoringRow = (props) => {
  const [chosenHost, setChosenHost] = useState("");
  const [dotsIsVisible, setDotsIsvisible] = useState(false);
  const host = props.host;
  const getDeleteId = props.getDeleteId;
  const getLabelId = props.getLabelId;
  const getTimeline = props.getTimeline;
  const setChosenId = props.setChosenId;
  const index = props.index;

  //   const handleClickOutside = (e) => {
  //     console.log(e.target, chosenHost);
  //   };

  //   useEffect(() => {
  //     const useOutsideAlerter = function () {
  //       // Bind the event listener
  //       document.addEventListener("mousedown", handleClickOutside);
  //       return () => {
  //         // Unbind the event listener on clean up
  //         document.removeEventListener("mousedown", handleClickOutside);
  //       };
  //     };
  //     useOutsideAlerter();
  //   }, []);

  return (
    <tr
      key={host.id}
      className="py-4 mobile:grid mobile:gap-4 mobile:grid-cols-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700 w-full"
    >
      <td className="mobile:hidden py-4 pr-4 flex-shrink-0">
        <img
          className="min-w-[32px] min-h-[32px] rounded-full w-[8px]"
          src={`/src/assets/${host.icon_name}.svg`}
          alt="OS"

          // import PreviousMap from "postcss/lib/previous-map.js";
        />
      </td>
      <td className="row-start-1 col-start-3 pr-4 flex-1 items-center text-base font-semibold text-gray-900 dark:text-white">
        <Tooltip content={host.humanizeDurationOnlineEvent} placement="bottom">
          <span>{host.online ? <span>🟢 On</span> : <span>🔴 Off</span>}</span>
        </Tooltip>
      </td>
      <td className="pr-4 flex-1 row-start-1 col-start-1 col-span-3 min-w-max">
        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
          {host.hostname}
          {host.label && host.label !== "" && (
            <span className="bg-gray-200 text-gray-800 text-sm dark:text-white dark:bg-gray-700 rounded-lg font-semibold px-2.5 py-0.5">
              {host.label}
            </span>
          )}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex">
          <span className="flex  text-center items-center">
            Public IP:&nbsp;
            {host.countryFlag && (
              <Tooltip content={host.countryName} placement="bottom">
                <img
                  className="h-4 w-4 m-1"
                  src={`/src/assets/flags/${host.countryFlag}`}
                  data-tooltip-placement="bottom"
                  data-tooltip-target="tooltip"
                  alt="country"
                />{" "}
              </Tooltip>
            )}
            {host.public_ip && <span>{host.public_ip}</span>}
          </span>
        </p>
      </td>
      <td className="flex-1 sm:px-4 min-w-max">
        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
          {host.os_name}
        </p>
        <Tooltip content={host.os_version} placement="bottom">
          <p
            className="text-sm text-gray-500 truncate dark:text-gray-400 w-20"
            data-tooltip-placement="bottom"
          >
            {host.os_version}
          </p>
        </Tooltip>
      </td>
      <td className="flex-1 pr-4 row-start-2 col-span-3 min-w-max">
        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
          💻 {host.cpu_name}
        </p>
        <div className="text-sm text-gray-500 truncate dark:text-gray-400 flex">
          <p> CPUs: {host.cpu_count}</p>
          <Tooltip content={` Used RAM: ${host.ram_used}`} placement="bottom">
            <span className="inline-flex ml-2">
              RAM:{" "}
              {`${host.ram_total} 
                  ${host.ram_used_percentage}% used`}
              <button
                data-modal-toggle="modal_timeline-{{@index}}"
                className="ml-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          </Tooltip>
          {host.ram_warning && (
            <Tooltip content={host.humanizeDurationRamEvent} placement="bottom">
              <span class="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-pink-200 dark:text-pink-900">
                ALERT
              </span>
            </Tooltip>
          )}
          &nbsp;&nbsp;&nbsp;
          <span className="mobile:block">
            {/* {{#if host.isSwap }}
          SWAP {{ host.swap_total }} ({{ host.swap_used }}% used)
          {{else}}
          SWAP Off
          {{/if}} */}
            {host.isSwap
              ? `SWAP ${host.swap_total} ${host.swap_used}% used`
              : "SWAP Off"}
          </span>
        </div>
      </td>
      <td className="flex-1 pr-4 items-center text-base font-semibold text-gray-900 dark:text-white min-w-max">
        <p className="text-sm min-w-max">💽 Disk: {host.disk_total}</p>
        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
          <p>{host.disk_used}% used</p>
          {host.disk_warning ? (
            <>
              <Tooltip
                content={host.humanizeDurationDiskEvent}
                placement="bottom"
              >
                <span> ALERT </span>
              </Tooltip>
            </>
          ) : (
            <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
              OK
            </span>
          )}
        </p>
      </td>
      <td className="row-start-3 col-start-3 mobile:flex mobile:self-center mobile:place-content-end">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id={index}
          data-dropdown-placement="bottom-end"
          className="h-6 w-6 text-gray-700 dark:text-gray-100 cursor-pointer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          onClick={(e) => {
            setChosenHost(e.target.id);
            setDotsIsvisible(!dotsIsVisible);
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
        <div
          id={index}
          className={`z-10 ${
            dotsIsVisible ? "" : "hidden"
          } w-max  bg-white shadow text-sm font-medium text-white rounded-lg absolute translate-x-[-75%]  transition-opacity duration-300 dark:bg-gray-700`}
        >
          <button
            type="button"
            id={index}
            className="mx-3 flex text-sm my-2 text-gray-900 dark:text-white hover:underline"
            onClick={(e) => {
              getLabelId(e.target.id);
              setDotsIsvisible(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 pr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p>{!host.label ? "Add label" : "Change label"}</p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              getTimeline(e.target.id);
              setDotsIsvisible(false);
              setChosenId(host.id);
            }}
            className="mx-3 flex text-sm my-2 text-gray-900 dark:text-white hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6 pr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
              />
            </svg>
            RAM by process
          </button>
          <button
            type="button"
            id={index}
            data-modal-toggle="modal_delete-{{@index}}"
            className="mx-3 my-2 flex text-left text-red-600 hover:underline"
            onClick={(e) => {
              getDeleteId(e.target.id);
              setDotsIsvisible(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 pr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MonitoringRow;