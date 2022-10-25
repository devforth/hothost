import React, { useState, useEffect } from "react";
import { useRef } from "react";
import useDebounce from "../Utils/Hooks/useDebounce";
import RestartTime from "./RestartTime";

const DonutChartInput = (props) => {
  const giveSelectedTime = props.setSelectedTime;
  const restartTime = props.restartTime;
  const [timeRangeValue, setTimeRangeValue] = useState(2880);
  const [restartTimeIsVisible, setRestartTimeIsVisible] = useState(false);
  const [restartPosition, setRestartPosition] = useState(0);
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

  console.log(restartTime);
  return (
    <div className="relative">
      <div className=" m-auto mt-14 w-[95%]" ref={refRange}>
        {minutes >= max ? (
          ""
        ) : (
          <RestartTime
            position={{ left: position * (refRange.current.offsetWidth + 22) }}
            restartTime={calculateSelectedTime(minutes)}
            restartTextIsLeft={max - minutes > max / 2}
          ></RestartTime>
        )}
        {/* <div className={restartTimeIsVisible ? "" : ""}>
          <span
            id="restartLine-{{@index}}"
            className={`absolute bg-red-500 h-12 w-[1px] ${
              restartPosition ? `left-[${restartPosition}]` : ""
            }`}
          >
            <p
              class={`w-max absolute text-red-500 translate-y-[48px] ${
                max - minutes > max / 2 ? "right-0" : ""
              }`}
            >
              Restart time
            </p>
          </span>
        </div> */}
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
            }}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
export default DonutChartInput;
