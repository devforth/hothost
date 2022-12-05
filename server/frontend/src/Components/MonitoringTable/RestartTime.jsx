import React from "react";
import { Tooltip } from "flowbite-react";
import { useState, useEffect } from "react";

const RestartTime = (props) => {
  const position = props.position.left;
  const restartTime = props.restartTime;
  const restartTextIsLeft = props.restartTextIsLeft;
  const [restartIsHovered, setrestartIsHovered] = useState(false);

  let styleObj = {};

  useEffect(() => {
    if (restartTextIsLeft) {
      styleObj.right = 0;
    }
    if (restartIsHovered) {
      styleObj.zIndex = 1000;
    }
  }, [position, restartIsHovered]);
  return (
    // <div className={restartTimeIsVisible ? "" : ""}>
    <div className="cursor-pointer">
      <span
        id="restartLine"
        style={{ left: `${position}px` }}
        className={`absolute bg-red-500 h-12 w-[1px] `}
        onMouseEnter={() => {
          setrestartIsHovered(true);
        }}
        onMouseLeave={() => {
          setrestartIsHovered(false);
        }}
      >
        <p
          class={`w-max absolute text-red-500 translate-y-[48px] bg-white dark:bg-gray-800 p-1 rounded-lg ${
            restartIsHovered ? "z-50" : ""
          }`}
          style={restartTextIsLeft ? { right: 0 } : {}}
        >
          <span className="mobile:hidden">Restart time</span> {restartTime}
        </p>
      </span>
    </div>
  );
};

export default RestartTime;
