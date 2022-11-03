import React from "react";

const PresintationButton = ({ name, active, setState, id }) => {
  return (
    <button
      className={`p-4 rounded-t-lg border-b-2 border-transparent  dark:text-gray-400  ${
        active === name
          ? " text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500"
          : ` hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`
      }`}
      id={id}
      onClick={() => {
        setState(name);
      }}
      type="button"
    >
      {name}
    </button>
  );
};

export default PresintationButton;
