import React from "react";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../FetchApi";

const ModalDelete = (props) => {
  const hostUrl = (props.monitor && props.monitor.url) || "";
  const id = (props.monitor && props.monitor.id) || "";
  const isOpen = props.isOpen;
  const refreshHosts = props.setMonitoringHttpData;
  const setDeleteModalIsVisible = props.setDeleteModalIsVisible;

  const deleteHost = async () => {
    const data = await apiFetch({ id }, "remove_http_monitor");
    if (data.data) {
      refreshHosts(data.data);
      setDeleteModalIsVisible(false);
    }
  };
  useEffect(() => {}, [props.isOpen]);

  return (
    <div
      id="modal_delete-{{@index}}"
      tabindex="-1"
      class={`${
        props.isOpen ? "" : "hidden"
      }  overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full`}
    >
      <div class="  absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] p-4 w-full max-w-md h-full md:h-auto">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <button
            type="button"
            onClick={() => {
              setDeleteModalIsVisible(false);
            }}
            class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
            data-modal-toggle="modal_delete-{{@index}}"
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
          <div class="  first-letter:p-6 text-center">
            <svg
              class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
              Are you sure you want to delete this host? <br />
              <b>{hostUrl}</b>
            </h3>
            <div class="justify-center">
              <form
                action="/api/remove_http_monitor?id={{ this.id }}"
                method="post"
              >
                <div>
                  <button
                    id="deleteHostBtn-{{@index}}"
                    data-modal-toggle="modal_delete-{{@index}}"
                    onClick={deleteHost}
                    type="button"
                    class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
                  >
                    Yes, I'm sure
                  </button>
                  <button
                    data-modal-toggle="modal_delete-{{@index}}"
                    onClick={() => {
                      setDeleteModalIsVisible(false);
                    }}
                    type="button"
                    class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ModalDelete;
