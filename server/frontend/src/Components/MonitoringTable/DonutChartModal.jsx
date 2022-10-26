import React, { useState, useEffect } from "react";
import DonutChartInput from "./DonutChartInput";
import MyDonutChart from "./DonutChart";
import { getData } from "../../../FetchApi";
import useDebounce from "../Utils/Hooks/useDebounce";

const DonutChartModal = (props) => {
  const setDonutModalIsVisible = props.setDonutModalIsVisible;
  const hostId = props.hostId;

  const calculateSelectedTime = (timeStep) => {
    const minutesLeft = timeStep * 1000 * 60;
    const now = new Date().getTime();
    const msDate = new Date(now - minutesLeft);
    return `${msDate.toLocaleString("default", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    })}`;
  };

  const [selectedTimeFromInput, setSelectedTime] = useState("");
  const debouncedValue = useDebounce(selectedTimeFromInput, 500);
  const [donutData, setDonutData] = useState({ process: [], restartTime: "" });

  const getDataForChart = async (id) => {
    const data = await getData(
      `getProcess/${hostId}/${2881 - selectedTimeFromInput}`
    );
    if (data) {
      setDonutData(data);
    }
  };

  useEffect(() => {
    getDataForChart();
  }, [debouncedValue]);

  return (
    <div
      id="modal_timeline-1"
      tabIndex="-1"
      className={`${
        true ? "" : "hidden"
      } overflow-x-hidden fixed top-[50%] left-[50%]  z-50 md:inset-0 h-modal md:h-full`}
    >
      <div className="relative p-4 w-full max-w-5xl h-full md:h-auto mx-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 ">
          <button
            type="button"
            onClick={() => {
              setDonutModalIsVisible(false);
            }}
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

              <DonutChartInput
                setSelectedTime={setSelectedTime}
                restartTime={donutData.restartTime}
              ></DonutChartInput>
              <div className="flex justify-between font-normal text-gray-500 dark:text-gray-400 whitespace-normal mt-2">
                <span>48 hours ago</span>
                <span>Now</span>
              </div>
              <h4 className="mt-10 dark:text-gray-200">
                Selected time:{" "}
                <span>
                  {calculateSelectedTime(2880 - selectedTimeFromInput)}
                </span>
              </h4>
              {donutData.process.length > 0 ? (
                <MyDonutChart chartData={donutData}></MyDonutChart>
              ) : (
                <h2 className="text-2xl font-bold align-middle flex justify-center mt-5">
                  No data for now
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChartModal;
