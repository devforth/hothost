import React, { useState, useEffect } from "react";
import DonutChartInput from "./DonutChartInput";
import MyDonutChart from "./DonutChart";
import { getData } from "../../../FetchApi";
import useDebounce from "../Utils/Hooks/useDebounce";
import { Spinner } from "flowbite-react";

const DonutChartModal = (props) => {
  const setDonutModalIsVisible = props.setDonutModalIsVisible;
  const hostId = props.hostId;
  const hostTotalRam = props.hostTotalRam;

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
  const debouncedValue = useDebounce(selectedTimeFromInput, 200);
  const [donutData, setDonutData] = useState({
    process: [],
    restartTime: "",
    totalRamUsage: "",
  });
  const [isPending, setIsPending] = useState(false);

  const getDataForChart = async (id) => {
    const data = await getData(
      `getProcess/${hostId}/${2881 - selectedTimeFromInput}`
    );
    if (data) {
      setDonutData(data);
      setIsPending(false);
    }
  };

  useEffect(() => {
    getDataForChart();
  }, [debouncedValue]);

  return (
    <div
      id="modal_timeline-1"
      tabIndex="-1"
      className="overflow-x-hidden  fixed top-[50%] left-[50%]  z-50 md:inset-0 mobile:top-0 mobile:absolute  mobile:left-0 mobile:right-0"
    >
      <div className="relative p-4 w-full max-w-5xl   mx-auto mobile:max-w-sm  mobile:h-[100vh] ">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 h-[80vh] overflow-y-auto overflow-hidden">
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
              <h4 className=" dark:text-gray-200  flex justify-center font-bold text-lg">
                Selected time:{" "}
                {calculateSelectedTime(2880 - selectedTimeFromInput)}
              </h4>
              <DonutChartInput
                setSelectedTime={setSelectedTime}
                restartTime={donutData.restartTime}
                getDataForChart={donutData}
                setIsPending={setIsPending}
              ></DonutChartInput>
              <div className="flex justify-between font-normal text-gray-500 dark:text-gray-400 whitespace-normal mt-7">
                <span>48 hours ago</span>
                <span>Now</span>
              </div>

              {isPending ? (
                <div className="w-[52px] mx-auto ">
                  {" "}
                  <Spinner size="3xl"></Spinner>
                </div>
              ) : donutData.process.length > 0 ? (
                <MyDonutChart
                  chartData={donutData}
                  hostTotalRam={hostTotalRam}
                ></MyDonutChart>
              ) : (
                <h2 className="text-2xl font-bold align-middle flex justify-center mt-5   text-gray-500 dark:text-gray-400">
                  No data for now
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overlay h-[100vh] w-[100vw] overflow-hidden z-[-1] fixed top-0 left-0 bg-gray-900 opacity-50"></div>
    </div>
  );
};

export default DonutChartModal;
