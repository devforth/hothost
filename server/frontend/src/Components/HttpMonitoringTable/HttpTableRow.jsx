import React from "react";
import { useState } from "react";

const HttpTableRow = (props) => {
  const [chosenHost, setChosenHost] = useState("");

  const [dotsIsVisible, setDotsIsvisible] = useState(false);
  const monitor = props.monitor;
  const getDeleteId = props.getDeleteId;

  return (
    <tr class="py-4 mobile:grid mobile:gap-4 mobile:grid-cols-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 max-w-max">
      <td class="pr-4 flex-1 items-center text-base font-semibold text-gray-900 dark:text-white">
        {monitor.status ? (
          <span>🟢OK</span>
        ) : (
          <span
            data-tooltip-placement="bottom"
            data-tooltip-target="tooltip_online_alert-{{@index}}"
          >
            🔴 Error
          </span>
        )}
      </td>
      <td class="pr-4 row-start-2 col-start-1 flex-1 text-gray-900 dark:text-white">
        <p>
          <span class="whitespace-normal">{monitor.url}</span>
          {monitor.label && monitor.label !== "" && (
            <span class="bg-gray-200 text-gray-800 text-sm dark:text-white dark:bg-gray-700 rounded-lg font-semibold px-2.5 py-0.5">
              {monitor.label}
            </span>
          )}
        </p>
      </td>
      <td class="pr-4 flex-1 text-gray-900 dark:text-white min-w-max">
        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
          Up\down time
        </p>
        <p>{monitor.monitorLastEventsTs}</p>
      </td>
      <td class="mobile:flex mobile:self-center mobile:place-content-end">
        <button
          id={monitor.id}
          onClick={(e) => {
            setChosenHost(e.target.id);
            setDotsIsvisible(!dotsIsVisible);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            id="dropdownDots-{{@index}}"
            data-dropdown-toggle="dropdownDotsInfo-{{@index}}"
            data-dropdown-placement="bottom-end"
            class="h-6 w-6 text-gray-700 dark:text-gray-100 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
        <div
          id="dropdownDotsInfo-{{@index}}"
          class={`z-10 ${
            dotsIsVisible ? "absolute translate-x-[-75%]" : "hidden "
          }  w-max bg-white shadow text-sm font-medium text-white rounded-lg transition-opacity duration-300 dark:bg-gray-700`}
        >
          <button
            type="button"
            id={monitor.id}
            onClick={() => {}}
            data-modal-toggle="modal_label-{{@index}}"
            class="mx-3 flex text-sm my-2 text-gray-900 dark:text-white hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 pr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Add label
          </button>
          <button
            type="button"
            id={monitor.id}
            onClick={(e) => {
              getDeleteId(e.target.id);
              setDotsIsvisible(false);
            }}
            data-modal-toggle="modal_delete-{{@index}}"
            class="mx-3 my-2 flex text-left text-red-600 hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 pr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </td>

      <div
        id={monitor.id}
        tabindex="-1"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full"
      >
        <div class=" p-4 w-full max-w-md h-full md:h-auto">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              onclick="onCloseModal()"
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
            <div class="p-6 text-center">
              <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
                Enter label name for <br />
                <b>{monitor.url}</b> host
              </h3>
              <div class="justify-center">
                <form
                  action="/api/add_http_label?id={{ this.id }}"
                  method="post"
                >
                  <input
                    name="label"
                    class="w-max mx-auto mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  />
                  <div>
                    <button
                      data-modal-toggle="modal_label-{{@index}}"
                      type="submit"
                      class="w-20 mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Ok
                    </button>
                    <button
                      data-modal-toggle="modal_label-{{@index}}"
                      onclick="onCloseModal()"
                      type="button"
                      class="w-20 mb-4 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
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
    </tr>
  );
};

export default HttpTableRow;
