import React, { Children } from "react";
import { useState, useEffect, useRef } from "react";

const HostDlgList = (props) => {
  const monitoringData = props.monitoringData;
  return (
    <div
      key={e.id}
      className="p-6 mt-4 bg-white rounded-lg shadow-md dark:bg-gray-800"
    >
      <h5 className="text-md mb-4 font-bold leading-none text-gray-900 dark:text-white">
        Configure your agent
      </h5>
      {Children.map((child) => React.cloneElement(child, { disabled }))}
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
    </div>
  );
};

export default HostDlgList;
