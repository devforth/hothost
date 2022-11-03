import React, { useState, useEffect } from "react";
import { useRef } from "react";
import useDebounce from "../Utils/Hooks/useDebounce";
import RestartTime from "./RestartTime";

const DonutChartInput = (props) => {
  const giveSelectedTime = props.setSelectedTime;
  const restartTime = props.restartTime;
  const getDataForChart = props.getDataForChart;
  const setIsPending = props.setIsPending;
  const [timeRangeValue, setTimeRangeValue] = useState(2880);
  const [checkStatus, setCheckStatus] = useState({
    status: "fullfield",
    isStarting: false,
  });
  const refRange = useRef(null);
  const max = 2880;
  const min = 1;
  const now = new Date().getTime();
  const minutes = Math.floor((now - restartTime) / 1000 / 60);
  const position = (max - minutes) / max;

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

  useEffect(() => {
    giveSelectedTime(timeRangeValue);
  }, []);

  useEffect(() => {
    setCheckStatus({ isStarting: false, status: "fullfield" });
  }, [getDataForChart]);

  return (
    <div className="relative">
      <div className=" m-auto mt-14 w-[100%]" ref={refRange}>
        {minutes >= max ? (
          ""
        ) : (
          <RestartTime
            position={{ left: position * refRange.current.offsetWidth }}
            restartTime={calculateSelectedTime(minutes)}
            restartTextIsLeft={max - minutes > max / 2}
          ></RestartTime>
        )}
        <div
          className={`absolute bg-gray-600 h-12 w-[1px] left-[`}
          style={{
            left: `${
              refRange.current &&
              (refRange.current.offsetWidth / max) * timeRangeValue
            }px`,
          }}
        ></div>
        <div>
          <input
            type="range"
            min={min}
            max={max}
            step="1"
            value={timeRangeValue}
            onChange={(e) => {
              setTimeRangeValue(e.target.value);
              giveSelectedTime(timeRangeValue);
              if (
                checkStatus.status === "fullfield" &&
                !checkStatus.isStarting
              ) {
                setCheckStatus({ isStarting: true, status: "pending" });
                setIsPending(true);
              }
            }}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
export default DonutChartInput;
