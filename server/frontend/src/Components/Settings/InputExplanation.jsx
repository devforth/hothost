import React from "react";

const InputExplanation = ({ text }) => {
  return text.map((t) => {
    return <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">{t}</p>;
  });
};

export default InputExplanation;
