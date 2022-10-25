import React from "react";
import { useState, useEffect, useRef } from "react";
import { getData, apiFetch } from "../../../FetchApi.js";
import MonitoringTable from "../MonitoringTable/MonitoringTable.jsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";
import AddHostDlg from "../AddHostDlg/AddHostDlg.jsx";
import HttpMonitor from "../HttpMonitor/HttpMonitor.jsx";

const Home = () => {
  const [monitoringData, setMonitoringData] = useState([]);
  const [noData, setNoData] = useState(false);
  const [status, setStatus] = useState("fullfield");
  const pathName = useLocation().pathname;

  const navigate = useNavigate("");
  const clickAndNavigate = function (path) {
    navigate(`/${path}`);
  };

  useEffect(() => {
    const fetchData = async (withLoader) => {
      withLoader && setStatus("pending");
      const data = await getData("getMonitoringData");
      if (data) {
        setMonitoringData(data);
      }
      withLoader && setStatus("fullfield");
    };
    fetchData({ withLoader: true });
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);
    console.log(intervalId, "addedInt");
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const addHost = async function () {
    const data = await apiFetch({}, "add_monitor");
    if (data) {
      setMonitoringData(data);
    }
  };

  return (
    <div className="mx-auto pt-4 px-4 flex justify-center  mobile:max-w-max">
      <div className="container mb-4">
        <div className="flex mb-1">
          <div
            onClick={() => {
              clickAndNavigate("home");
            }}
            className={`flex-1 mr-1 text-center cursor-pointer  text-gray-800  dark:text-white ${
              pathName === "/home"
                ? `font-semibold dark:text-white border-b-4 border-gray-700`
                : ""
            }`}
          >
            Host monitoring
          </div>
          <div
            onClick={() => {
              clickAndNavigate("home/http-monitor");
            }}
            className={`flex-1 mr-1 text-center cursor-pointer   text-gray-800 dark:text-white ${
              pathName === "/home/http-monitor"
                ? `font-semibold dark:text-white border-b-4 border-gray-700`
                : ""
            }`}
          >
            Http/Https monitoring
          </div>
        </div>

        <div className="p-4  bg-gray-100 rounded-lg shadow-md  dark:bg-gray-600 dark:border-gray-700">
          {pathName === "/home" ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h5 className="w-max text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Hosts under monitoring
                </h5>

                <button
                  onClick={addHost}
                  className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none mobile:w-max
            focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex mobile:inline items-center"
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
              {monitoringData.length > 0 && status === "fullfield" && (
                <AddHostDlg
                  monitoringData={monitoringData}
                  deleteMonitorUpdate={setMonitoringData}
                ></AddHostDlg>
              )}

              {/* {{/if}}
    {{/each}} */}
              <div className="flow-root overflow-auto mobile:truncate">
                {monitoringData && status === "fullfield" && (
                  <MonitoringTable
                    monitoringData={monitoringData}
                  ></MonitoringTable>
                )}
                {status === "pending" && <Spinner></Spinner>}
              </div>
            </div>
          ) : (
            <HttpMonitor></HttpMonitor>
          )}
        </div>
      </div>

      <div
        id="toast-copied"
        className=" fixed right-2 bottom-2 hidden flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-green-900 dark:bg-green-100"
        role="alert"
      >
        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-100 dark:text-green-900">
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
        <div className="ml-3 text-sm font-normal">Copied to clipboard!</div>
        <button
          type="button"
          className="bg-transparent ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 dark:text-green-900 dark:hover:text-black "
          // onclick="hideCOpyTost()"
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
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
      </div>

      {/* <script>

  function hideCOpyTost() {
    document.getElementById('toast-copied').classNameList.add('hidden');
  }

  function copyToCb(idOfPre) {
    const copyText = document.getElementById(idOfPre).textContent;
    const textArea = document.createElement('textarea');
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    document.getElementById('toast-copied').classNameList.remove('hidden');
    setTimeout(hideCOpyTost, 5000);

  }

  function checkHost(hostName, index) {
    const confirmHost = document.getElementById('confirmHost-'+index);
    const deleteHostBtn = document.getElementById('deleteHostBtn-'+index);
    if (hostName === confirmHost.value) {
      deleteHostBtn.disabled = false;
    } else {
      deleteHostBtn.disabled = true;
    }
  }

  function onCloseModal() {
    window.location = "/"
  }

  const monitoringTable = document.getElementById('monitoring');
  setInterval(async () => {
    const response = await fetch('/update');
    const data = await response.text();
    if (monitoringTable) {
      monitoringTable.innerHTML = data;

      window.document.dispatchEvent(new Event("DOMContentLoaded"));
    }
  }, 10000);
            </script> */}
    </div>
  );
};
export default Home;
