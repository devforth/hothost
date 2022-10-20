import React from "react";
import { useState, useEffect, useRef } from "react";
import { getData, apiFetch } from "../../../FetchApi.js";
import AgentConfigurator from "../AgentConfigurator/AgentConfigurator.jsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";

const AddHostDlg = (props) => {
  const monitoringData = props.monitoringData;
  const deleteMonitorUpdate = props.deleteMonitorUpdate;
  const removeMonitor = async function (e) {
    const data = await apiFetch({ id: e.target.id }, "remove_monitor");

    deleteMonitorUpdate(data.data);
  };

  const [chosenOption, setChosenOption] = useState({
    state: "pureDocker",
    id: "",
    alreadyChosen: false,
  });

  // function copyToCb(idOfPre) {
  //   const copyText = document.getElementById(idOfPre).textContent;
  //   const textArea = document.createElement("textarea");
  //   textArea.textContent = copyText;
  //   document.body.append(textArea);
  //   textArea.select();
  //   document.execCommand("copy");
  //   textArea.remove();
  //   // document.getElementById("toast-copied").classList.remove("hidden");
  //   // setTimeout(hideCOpyTost, 5000);
  // }

  return (
    <div>
      {monitoringData.map((e) => {
        if (e.no_data) {
          return (
            <div
              key={e.id}
              className="p-6 mt-4 bg-white rounded-lg shadow-md dark:bg-gray-800"
            >
              <h5 className="text-md mb-4 font-bold leading-none text-gray-900 dark:text-white">
                Configure your agent
              </h5>
              <ul
                className="flex flex-nowrap overflow-x-auto text-sm font-medium text-center"
                id={`myTab-${e.id}`}
                data-tabs-toggle={`#myTabContent-${e.id}`}
                role="tablist"
              >
                <li role="presentation" className="flex shrink-1">
                  <button
                    className={
                      chosenOption.state === "pureDocker" &&
                      chosenOption.id === e.id
                        ? "p-4 rounded-t-lg border-b-2 border-transparent text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500"
                        : `p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`
                    }
                    id={e.id}
                    data-tabs-target={`#profile-${e.id}`}
                    onClick={(e) => {
                      setChosenOption({
                        state: "pureDocker",
                        id: e.target.id,
                      });
                    }}
                    type="button"
                    role="tab"
                    aria-controls={`#profile-${e.id}`}
                  >
                    Pure Docker
                  </button>
                </li>
                <li role="presentation" className="flex shrink-1">
                  <button
                    className={
                      chosenOption.state === "compose" &&
                      chosenOption.id === e.id
                        ? "p-4 rounded-t-lg border-b-2 border-transparent text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500"
                        : `p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`
                    }
                    id={e.id}
                    onClick={(e) => {
                      setChosenOption({
                        state: "compose",
                        id: e.target.id,
                      });
                    }}
                    data-tabs-target={`#dashboard-${e.id}`}
                    type="button"
                    role="tab"
                    aria-controls={`dashboard-${e.id}`}
                    aria-selected="false"
                  >
                    Compose
                  </button>
                </li>
                <li role="presentation" className="flex shrink-1">
                  <button
                    className={
                      chosenOption.state === "pureBash" &&
                      chosenOption.id === e.id
                        ? "p-4 rounded-t-lg border-b-2 border-transparent text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500"
                        : `p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`
                    }
                    id={e.id}
                    onClick={(e) => {
                      setChosenOption({
                        state: "pureBash",
                        id: e.target.id,
                      });
                      
                    }}
                    data-tabs-target={`#settings-${e.id}`}
                    type="button"
                    role="tab"
                    aria-controls={`settings-${e.id}`}
                    aria-selected="false"
                  >
                    Pure Bash
                  </button>
                </li>
              </ul>
              <div id="myTabContent-${e.id}"></div>
              <AgentConfigurator
                elementData={e}
                chosenOption={chosenOption}
              ></AgentConfigurator>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                Refresh monitoringData page to see update.{" "}
              </p> */}
              {/* <form action="/api/remove_monitor?id=${e.id}" method="POST"> */}
              <button
                id={e.id}
                onClick={removeMonitor}
                className="flex mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded items-center"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove
              </button>
              {/* </form> */}
            </div>
          );
        }
      })}
    </div>
  );
};

export default AddHostDlg;
