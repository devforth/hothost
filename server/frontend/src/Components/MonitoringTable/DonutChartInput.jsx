import React, { useState, useEffect } from "react";
import useDebounce from "../Utils/Hooks/useDebounce";

const DonutChartInput = (props) => {
  const giveSelectedTime = props.setSelectedTime;

  const [timeRangeValue, setTimeRangeValue] = useState(2880);

  useEffect(() => {
    giveSelectedTime(timeRangeValue);
  }, []);

  return (
    <div>
      <div className="relative m-auto mt-14 w-[95%]">
        <div>
          <input
            type="range"
            min="1"
            max="2880"
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
