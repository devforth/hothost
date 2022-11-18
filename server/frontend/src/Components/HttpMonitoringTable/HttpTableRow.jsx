import React from "react";
import { useState } from "react";
import OutsideHider from "../OutsideAlert/OutsideAlert";
import { Tooltip, Dropdown } from "flowbite-react";

const HttpTableRow = (props) => {
  const [chosenHost, setChosenHost] = useState("");

  const [dotsIsVisible, setDotsIsvisible] = useState(false);
  const monitor = props.monitor;
  const getDeleteId = props.getDeleteId;
  const getLabelId = props.getLabelId;

  const checkSslWarn = props.checkSslWarn

  

  return (
    <tr class="py-4 mobile:grid mobile:gap-4 mobile:grid-cols-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 ">
      <td class="pr-4 flex-1 items-center text-base font-semibold text-gray-900 dark:text-white">
        {monitor.status ? (
          <span>🟢OK</span>
        ) : (
          <Tooltip content={`Host error: ${monitor.sslError || monitor.errno}`} placement="bottom">
            <span
            data-tooltip-placement="bottom"
            data-tooltip-target="tooltip_online_alert-{{@index}}"
            >
            🔴 Error
            </span>
          </Tooltip>
          
        )}
      </td>
      <td class="pr-4 row-start-2 col-start-1   flex-1 text-gray-900 dark:text-white">
        <p>
          <span class="whitespace-normal">{monitor.url}</span>
          {monitor.label && monitor.label !== "" && (
            <span class="bg-gray-200 text-gray-800 text-sm dark:text-white dark:bg-gray-700 rounded-lg font-semibold px-2.5 py-0.5 ml-1">
              {monitor.label}
            </span>
          )}
        </p>
        { monitor.sslWarning 
        ?  <div className="flex items-center">
              <Tooltip content={`SSL certificate will expire soon. Certificate is valid until: ${new Date(monitor.certificateExpireDate)}`} placement="bottom">
                <span class="bg-yellow-200 text-yellow-500 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-500">
                    Warning
                </span>
              </Tooltip>
              <button onClick={()=>{checkSslWarn(monitor.id)}}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" viewBox="0 0 24 24" 
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 ml-1">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                        strokeWidth="2" />
                  </svg>
                </button>      
           </div>
           

        : null
        }
      </td>
      {/* <td>
        { !monitor.status ?
         <p>{`reason ${null}`}</p> :
         null
        }
      </td> */}
      <td class="pr-4 flex-1 text-gray-900 dark:text-white min-w-max">
        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
          Up\down time
        </p>
        <p>{monitor.monitorLastEventsTs}</p>
      </td>
      <td class="mobile:flex mobile:self-center mobile:place-content-end">
        <OutsideHider state={dotsIsVisible} setstate={setDotsIsvisible}>
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
              onClick={(e) => {
                getLabelId(e.target.id);
                setDotsIsvisible(false);
              }}
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
        </OutsideHider>
      </td>
    </tr>
  );
};

export default HttpTableRow;
