import React from "react";
import { Tooltip, Dropdown } from "flowbite-react";
import { useState } from "react";
import { addLabel, deleteHost } from "../../../FetchApi";

const MonitoringTable = (props) => {
  const monitoringData = props.monitoringData;
  const toastsManager = props.myDataSetterFunction;
  const [labelModalIsOpen, setLabelModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [chosenHost, setChosenHost] = useState("0");
  const [labelName, setLabelName] = useState("");
  const [confrimName, seConfrimName] = useState("");

  const labelModalToggle = function (e) {
    setLabelModalIsOpen(!labelModalIsOpen);
    setChosenHost(+e.target.id);
  };
  const getLabel = (evt) => {
    setLabelName(evt.currentTarget.value);
  };
  const saveLabel = async () => {
    const body = {
      label: labelName,
      id: monitoringData && monitoringData[chosenHost].id,
    };
    const data = await addLabel(body, "add_label");
  };

  const deleteHostAction = async () => {
    const body = {
      id: monitoringData && monitoringData[chosenHost].id,
    };
    const data = await deleteHost(body, "remove_host");
  };

  const deleteModalToggle = function (e) {
    setDeleteModalIsOpen(!deleteModalIsOpen);
  };

  const deleteHost = async () => {};
  return (
    <table
      id="monitoring"
      role="list"
      className="divide-y divide-gray-200 dark:divide-gray-700 w-full"
    >
      {monitoringData &&
        monitoringData
          .filter((el) => {
            return !el.no_data;
          })
          .map((host, index) => (
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
                <Tooltip
                  content={host.humanizeDurationOnlineEvent}
                  placement="bottom"
                >
                  <span>
                    {host.online ? <span>🟢 On</span> : <span>🔴 Off</span>}
                  </span>
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
                  <Tooltip
                    content={` Used RAM: ${host.ram_used}`}
                    placement="bottom"
                  >
                    <span className="inline-flex ml-2">
                      RAM:{" "}
                      {`${host.ram_total} 
                  ${host.ram_used_percentage}% used`}
                      <button
                        // onclick="drawTimeSlider('{{host.id}}', '{{@index}}')"
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
                    <Tooltip
                      content={host.humanizeDurationRamEvent}
                      placement="bottom"
                    >
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
                  id={index + 1}
                  data-dropdown-placement="bottom-end"
                  className="h-6 w-6 text-gray-700 dark:text-gray-100 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  onClick={(e) => {
                    if (
                      document.querySelector(`#dropdownDotsInfo-${e.target.id}`)
                    ) {
                      document
                        .querySelector(`#dropdownDotsInfo-${e.target.id}`)
                        .classList.toggle("hidden");
                    }
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
                <div
                  id={`dropdownDotsInfo-${index + 1}`}
                  className="z-10  w-max hidden bg-white shadow text-sm font-medium text-white rounded-lg transition-opacity duration-300 dark:bg-gray-700"
                >
                  <button
                    type="button"
                    id={index}
                    className="mx-3 flex text-sm my-2 text-gray-900 dark:text-white hover:underline"
                    onClick={labelModalToggle}
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
                    data-modal-toggle="modal_timeline-{{@index}}"
                    // onclick="drawTimeSlider('{{host.id}}', '{{@index}}')"
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
                    data-modal-toggle="modal_delete-{{@index}}"
                    className="mx-3 my-2 flex text-left text-red-600 hover:underline"
                    onClick={deleteModalToggle}
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
          ))}

      {/* {{/if}} */}
      <div
        id="modal_delete-{{@index}}"
        tabIndex="-1"
        className={`${
          !deleteModalIsOpen && "hidden"
        } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full`}
      >
        <div className="relative p-4 w-full max-w-md h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-toggle="modal_delete-{{@index}}"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            <div className="p-6 text-center">
              <svg
                className="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
                Are you sure you want to delete host host? Type{" "}
                <b>
                  {monitoringData.length > 0 &&
                    monitoringData[+chosenHost].hostname}
                </b>{" "}
              </h3>
              <div className="justify-center">
                <form action="/api/remove_host?id={{ host.id }}" method="post">
                  <input
                    id="confirmHost-{{@index}}"
                    onChange={(e) => {
                      seConfrimName(e.currentTarget.value);
                    }}
                    value={confrimName}
                    className="w-max mx-auto mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                  <div>
                    <button
                      id="deleteHostBtn-{{@index}}"
                      data-modal-toggle="modal_delete-{{@index}}"
                      type="button"
                      onClick={deleteHostAction}
                      disabled={confrimName !== "Yes, I'm sure"}
                      className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 disabled:hover:bg-gray-500  disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
                    >
                      Yes, I'm sure
                    </button>
                    <button
                      data-modal-toggle="modal_delete-{{@index}}"
                      //onclick="onCloseModal()"
                      type="button"
                      className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="modal_label-0"
        tabIndex="-1"
        className={`overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full justify-center items-center flex" ${
          labelModalIsOpen ? "" : "hidden"
        }`}
      >
        <div className="relative p-4 w-full max-w-md h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={labelModalToggle}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            <div className="p-6 text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
                Enter label name for <br />{" "}
                <b>
                  {monitoringData.length > 0 &&
                    monitoringData[+chosenHost].hostname}
                </b>{" "}
                host
              </h3>
              <div className="justify-center">
                <input
                  name="label"
                  onChange={getLabel}
                  value={labelName}
                  className="w-max mx-auto mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
                <div>
                  <button
                    data-modal-toggle="modal_label-{{@index}}"
                    onClick={saveLabel}
                    className="w-20 mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Ok
                  </button>
                  <button
                    data-modal-toggle="modal_label-{{@index}}"
                    onClick={labelModalToggle}
                    type="button"
                    className="w-20 mb-4 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="modal_timeline-1"
        tabIndex="-1"
        className="hidden overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full"
      >
        <div className="relative p-4 w-full max-w-5xl h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 ">
            <button
              type="button"
              //onclick="onCloseModal()"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-toggle="modal_timeline-1"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            <div id="proc" className="p-9">
              <div className="w-full h-fit">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
                  Top 10 processes by memory at time
                </h3>
                <div className="relative m-auto mt-14 w-[95%]">
                  <div className="w-full">
                    <div
                      className="absolute bg-gray-600 h-12 w-[1px] translate-x-[9px]"
                      id="rangeV-{{@index}}"
                    ></div>
                    <span
                      id="restartLine-{{@index}}"
                      className="absolute bg-red-500 h-12 w-[1px]"
                    >
                      <p className="w-max absolute text-red-500 translate-y-[48px]">
                        Restart time
                      </p>
                    </span>
                    <div id="range-{{@index}}">
                      <input
                        type="range"
                        min="1"
                        max="2880"
                        step="1"
                        value="2880"
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between font-normal text-gray-500 dark:text-gray-400 whitespace-normal mt-2">
                  <span>48 hours ago</span>
                  <span>Now</span>
                </div>
                <h4 className="mt-10 dark:text-gray-200">
                  Selected time: <span id="selectedTime-{{@index}}"></span>
                </h4>
                <div className="flex justify-between h-96 max-h-96">
                  <div
                    id="processArea-{{@index}}"
                    className="flex flex-col w-9/12 overflow-y-scroll scrollbar dark:text-gray-200"
                  >
                    <div role="status" className="mt-10">
                      <svg
                        className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                  <div className="w-[200px] h-[200px] ">
                    <canvas
                      id="processChart-{{@index}}"
                      width="200px"
                      height="200px"
                      className="rounded-full"
                    ></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </table>
  );
};
export default MonitoringTable;
/* {/* <script>
  function drawPieSlice(
    ctx,
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle,
    holeSize,
    color,
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.arc(centerX, centerY, radius * holeSize, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();
  }

  className DonutChart {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.options = options;
      this.ctx = null;

      if (this.canvas.getContext) {
        this.ctx = this.canvas.getContext('2d');
        this.sortData();
        this.draw();
      } else {
        // canvas-unsupported code here
      }
    }

    sortData() {
      const { data } = this.options;

      data.sort((a, b) => {
        return b.value - a.value;
      });
    }

    draw() {
      const { data, holeSize, animationSpeed } = this.options;

      let totalValue = 0;
      data.forEach(({ value }) => {
        totalValue += value;
      });

      let startAngle = Math.PI * 1.5;
      data.forEach(({ value, color }) => {
        const sliceAngle = (2 * Math.PI * value) / totalValue;
        this.animateDraw(
          startAngle,
          sliceAngle,
          holeSize || 0,
          color,
          0,
          1 * (animationSpeed || 1),
        );

        startAngle += sliceAngle;
      });
    }

    animateDraw(startAngle, sliceAngle, holeSize, color, pct, pctMax) {
      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.min(this.canvas.width / 2, this.canvas.height / 2),
        startAngle,
        startAngle + (sliceAngle * pct) / pctMax,
        holeSize,
        color,
      );

      if (pct < pctMax)
        requestAnimationFrame(() =>
          this.animateDraw(
            startAngle,
            sliceAngle,
            holeSize,
            color,
            pct + 1,
            pctMax,
          ),
        );
    }
  }

  let processData = [];
  let elementIndex;
  let chart
  let range;
  let rangeV;
  let processArea;
  let restartTimeId;
  let selectedTime;
  let min;
  let max;
  let modalId;
  let restartTime;

  const drawTimeSlider = (id, elIndex) => {
    modalId = id;
    elementIndex = elIndex;
    chart = document.getElementById("processChart-" + elementIndex);
    range = document.getElementById("range-" + elementIndex).children[0];
    rangeV = document.getElementById("rangeV-" + elementIndex);
    processArea = document.getElementById("processArea-" + elementIndex);
    restartTimeId = document.getElementById("restartLine-" + elementIndex);
    selectedTime = document.getElementById("selectedTime-" + elementIndex);
    min = range.getAttribute("min");
    max = range.getAttribute("max");
    min = range.getAttribute("min");
    max = range.getAttribute("max");

    window.addEventListener("resize", (event) => {
      sliderValues();
    });

    range.addEventListener("input", () => {
      sliderValues();
    });
    // TODO slider value pointer don`t rendered at time (input clientWidth == 0)
    setTimeout(() => {
    sliderValues();
    }, 100);

    drawChart(generateChartData(processData), 20);
  }

  const loadingSpinner = `
    <div role="status" className="mt-10">
      <svg className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
    `;
  const colors = ['#D1D2D4', '#C1C2C4', '#B3B5B8', '#AFB1B4', '#9FA1A4', '#939598', '#818285', '#757679', '#6D6E71', '#58585A']; // shades of grey

  const generateChartData = (data) => {
    return data.map((el, index) => {
      return {
        label: el.id.toString(),
        value: +el.total_usage,
        color: el.color
      }
    })
  }

  const drawChart = (data, animationSpeed) => {
    new DonutChart(chart, {
      data: data,
      holeSize: 0,
      animationSpeed: animationSpeed,
    });
  }

  const highlightChart = (id) => {
    const currentElement = processData.find(el => el.id == id);

    const values = processData.map((el, index) => {
      const id = el.id;
      if (id !== currentElement.id) {
        document.getElementById(id).classNameList.add('opacity-50');
        return {
          label: el.id.toString(),
          value: +el.total_usage,
          color: colors[index]
        }
      } else {
        return {
          label: el.id.toString(),
          value: +el.total_usage,
          color: el.color
        }
      }
    });
    drawChart(values);
  }

  // returns values of chart and process to initial state (when mouse out)
  const dropStyles = () => {
    processData.map((el, index) => {
      const id = el.id;
      document.getElementById(id).classNameList.remove('opacity-50');
      drawChart(generateChartData(processData), 1);
    })
  }

  const restartTimeHandler = (restartEventCreated) => {
    const now = new Date().getTime();
    const minutes = Math.floor((now - restartEventCreated) / 1000 / 60);
    if (minutes >= max) {
      restartTimeId.style.display = "none";
      return;
    }
    const position = ((max) - minutes) / (max);
    restartTimeId.style.left = (position * (range.offsetWidth - 10)) + "px";
    restartPositionTextHandler(minutes);
  }

  const sliderValues = () => {
    const val = range.value;
    const position = (val - min) / (max - min);
    rangeV.style.left = (position * (range.clientWidth - 20)) + "px";
    selectedTime.innerHTML = calculateSelectedTime((max + min) - range.value);
    getProcess(val);
  }

  const fetchProcess = async (id) => {
    const url = "/getProcess";
    const timeStep = (+max + +min) - range.value;
    return await fetch(`${url}/${id}/${timeStep}`).then(
      res => res.json()).catch(e => console.log(e));
  }

  const getProcess = (value) => {
    processArea.innerHTML = loadingSpinner;
    // full gray chart
    drawChart([{
      label: 1,
      value: 1,
      color: '#c7c7c7'
    }]);
    clearTimeout(window.runTimeout);
    window.runTimeout = setTimeout(() => {
      fetchProcess(modalId).then(
        res => {
          if (res.process.length !== 0) {
            processArea.classNameList.remove('opacity-50');
            processArea.innerHTML = drawProcessArea(res.process);
            drawChart(generateChartData(res.process), 10);
          } else {
            processArea.innerHTML = 'No data for now';
            processArea.classNameList.add('opacity-50');
          }
          restartTimeHandler(+res.restartTime - 1000 * 60);
          processData = res.process;
          restartTime = res.restartTime;
        }
      );
    }, 200);
  }

  const drawProcessArea = (data) => {
    let text = '';
    for (let element = 0; element < data.length; element++) {
      const el = data[element];
      text +=
        `<div
        id="${el.id}"
        onmouseenter="highlightChart(${el.id})"
        onmouseleave="dropStyles()"
        className="gap-4 py-4 inline-flex items-center cursor-default text-sm dark:text-gray-200"
      >
        <div>
          <div
            className="h-4 w-4 rounded-full"
            style="background-color: ${el.color}"
          ></div>
        </div>
        <div className="grow-1 w-20 font-bold">${el.ram_usage}</div>
        <div className="flex-1 break-all">${el.data}</div>
      </div>`;
    }
    return text;
  }

  const calculateSelectedTime = (timeStep) => {
    const minutesLeft = timeStep * 1000 * 60;
    const now = new Date().getTime();
    const msDate = new Date(now - minutesLeft);

    return `${msDate.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric'
    })}`;
  }

  const restartPositionTextHandler = (minutes) => {
    restartTimeId.children[0].innerHTML = `Restart time: ${calculateSelectedTime(minutes)}`; // restart time text
    if (max - minutes > max / 2) {
      restartTimeId.children[0].style.right = 0;
    }
  }
</script></div> } */