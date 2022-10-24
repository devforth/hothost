import React, { useRef, useEffect } from "react";
import { Tooltip, Dropdown } from "flowbite-react";
import { useState } from "react";
import { addLabel, deleteHost } from "../../../FetchApi";
import MonitoringRow from "./MonitoringRow";
import DonutChart from "react-donut-chart";
import DonutChartModal from "./DonutChartModal";

const MonitoringTable = (props) => {
  const monitoringData = props.monitoringData;

  const [labelModalIsOpen, setLabelModalIsOpen] = useState(false);

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const [chosenHost, setChosenHost] = useState("0");
  const [labelName, setLabelName] = useState("");
  const [confrimName, seConfrimName] = useState("");
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [donutModalIsVisible, setDonutModalIsVisible] = useState(false);
  const [chosenId, setChosenId] = useState("");

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
    if (data[0].label) {
      setLabelModalIsOpen(false);
      setLabelName("");
    }
  };

  const deleteHostAction = async () => {
    const body = {
      id: monitoringData && monitoringData[chosenHost].id,
    };
    const data = await deleteHost(body, "remove_host");
    if (data.status === "successful") {
      setDeleteModalIsVisible(false);
    }
  };

  return (
    <>
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
              <MonitoringRow
                host={host}
                index={index}
                getDeleteId={(e) => {
                  setDeleteModalIsVisible(true);
                }}
                getLabelId={(e) => {
                  setLabelModalIsOpen(true);
                }}
                getTimeline={(e) => {
                  setDonutModalIsVisible(true);
                }}
                key={`hst_tbl_row_${index}`}
                setChosenId={(id) => {
                  setChosenId(id);
                }}
              />
            ))}

        {/* {{/if}} */}
        <div
          id="modal_delete-{{@index}}"
          tabIndex="-1"
          className={`${
            !deleteModalIsVisible && "hidden"
          } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full`}
        >
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 w-full max-w-md h-full md:h-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                data-modal-toggle="modal_delete-{{@index}}"
                onClick={() => {
                  setDeleteModalIsVisible(false);
                }}
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
                  Are you sure you want to delete{" "}
                  {monitoringData.length > 0 &&
                    monitoringData[+chosenHost].hostname}{" "}
                  host? Type <b>"Yes, I'm sure"</b>{" "}
                </h3>
                <div className="justify-center">
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
                      onClick={() => {
                        setDeleteModalIsVisible(false);
                      }}
                      type="button"
                      className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
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
          id="modal_label-0"
          tabIndex="-1"
          className={`overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full justify-center items-center flex" ${
            labelModalIsOpen ? "" : "hidden"
          }`}
        >
          <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] p-4 w-full max-w-md h-full md:h-auto">
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
                      data-modal-toggle="modal_label-${chosenHost}"
                      onClick={saveLabel}
                      className="w-20 mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Ok
                    </button>
                    <button
                      data-modal-toggle="modal_label-${chosenHost}"
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
      </table>
      {donutModalIsVisible && (
        <DonutChartModal
          setDonutModalIsVisible={setDonutModalIsVisible}
          hostId={chosenId}
        ></DonutChartModal>
      )}
    </>
  );
};
export default MonitoringTable;
/* {/* <script>
  
</script></div> } */
