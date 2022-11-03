import React from "react";

const RestartTime = (props) => {
  const position = props.position.left;
  const restartTime = props.restartTime;
  const restartTextIsLeft = props.restartTextIsLeft;

  return (
    // <div className={restartTimeIsVisible ? "" : ""}>
    <div>
      <span
        id="restartLine"
        style={{ left: `${position}px` }}
        className={`absolute bg-red-500 h-12 w-[1px] `}
      >
        <p
          class={`w-max absolute text-red-500 translate-y-[48px] `}
          style={restartTextIsLeft ? { right: 0 } : {}}
        >
          <span className="mobile:hidden">Restart time</span> {restartTime}
        </p>
      </span>
    </div>
  );
};

export default RestartTime;
