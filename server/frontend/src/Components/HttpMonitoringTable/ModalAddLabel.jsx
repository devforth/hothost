import React from "react";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../FetchApi";

const ModalAddLabel = (props) => {
  const hostUrl = (props.monitor && props.monitor.url) || "";
  const id = (props.monitor && props.monitor.id) || "";
  const refreshHosts = props.setMonitoringHttpData;
  const setAddLabelModalIsVisible = props.setLabelModalIsVisible;
  const [labelInputValue, setLabelInputValue] = useState("");

  const addlabelHttpHost = async () => {
    if (labelInputValue) {
      const data = await apiFetch(
        { id, label: labelInputValue },
        "add_http_label"
      );

      if (data[0].id) {
        setAddLabelModalIsVisible(false);
      }
    }
  };
  return (
    <>
      <div
        id={id}
        tabindex="-1"
        class=" absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 w-full max-w-md h-full md:h-auto z-10"
      >
        <div class=" p-4 w-full max-w-md h-full md:h-auto">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 mobile:absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <button
              type="button"
              onClick={() => {
                setAddLabelModalIsVisible(false);
              }}
              class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-toggle="modal_label-{{@index}}"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <div class="p-6 text-center  ">
              <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal truncate">
                Enter label name for <br />
                <b>{hostUrl}</b> host
              </h3>
              <div class="justify-center">
                <input
                  name="label"
                  value={labelInputValue}
                  onChange={(e) => {
                    setLabelInputValue(e.target.value);
                  }}
                  class="w-max mx-auto mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
                <div>
                  <button
                    data-modal-toggle="modal_label-{{@index}}"
                    type="button"
                    onClick={addlabelHttpHost}
                    class=" mr-2 w-20 mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Ok
                  </button>
                  <button
                    data-modal-toggle="modal_label-{{@index}}"
                    onClick={() => {
                      setAddLabelModalIsVisible(false);
                    }}
                    type="button"
                    class="w-20 mb-4 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overlay h-[100vh] w-[100vw] overflow-hidden z-[0] fixed top-0 left-0 bg-gray-900 opacity-50"></div>
    </>
  );
};
export default ModalAddLabel;
