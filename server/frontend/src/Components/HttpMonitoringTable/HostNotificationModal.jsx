import { useEffect, useState } from "react";
import { apiFetch } from "../../../FetchApi";

const HostNotificationModal = ({ monitor, setModalIsVisible }) => {
  async function getHostSettings(id) {
    const data = await apiFetch(id, "get_plugins_for_http-monitor");
    if (data.data) {
      setModalInputs(data.data);
    }
  }
  async function saveHostSettings(id) {
    const data = await apiFetch(
      { plugins: modalInputs, id },
      "set_plugins_for_http-monitor"
    );
    if (data.status === "success") {
      setModalIsVisible(false);
    }
  }

  useEffect(() => {
    getHostSettings({ id: monitor.id });
  }, []);

  const [modalInputs, setModalInputs] = useState({
    ALL_PLUGINS: {
      value: true,
    },
    TELEGRAM: {
      value: true,
    },
    SLACK: {
      value: true,
    },
    EMAIL: {
      value: true,
    },
  });

  return (
    <>
      <div class=" absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 w-full max-w-md  z-10">
        <div class=" p-4 w-full max-w-md h-full md:h-auto  bg-white rounded-lg shadow dark:bg-gray-700">
          <h2 className="mb-6 mt-4 text-lg flex justify-center font-bold text-gray-500 dark:text-gray-400 whitespace-normal">
            <span className="truncate"> Notify settings of {monitor.url} </span>
          </h2>
          {Object.keys(modalInputs).map((plugin, i) => {
            return (
              <div
                className={`mb-6 ${
                  plugin !== "ALL_PLUGINS" && modalInputs.ALL_PLUGINS.value
                    ? "opacity-[0.2] cursor-default "
                    : null
                }`}
                key={`plugin-${i}`}
              >
                <label
                  htmlFor={plugin}
                  className={`relative inline-flex items-center mb-4  ${
                    plugin !== "ALL_PLUGINS" && modalInputs.ALL_PLUGINS.value
                      ? "cursor-default "
                      : "cursor-pointer"
                  }`}
                >
                  <input
                    name={plugin}
                    id={plugin}
                    type="checkbox"
                    checked={modalInputs[plugin].value}
                    class="sr-only peer "
                  />
                  <div
                    onClick={() => {
                      const togledValue = !modalInputs[plugin].value;
                      if (
                        plugin === "ALL_PLUGINS" ||
                        !modalInputs.ALL_PLUGINS.value
                      ) {
                        setModalInputs({
                          ...modalInputs,
                          [plugin]: {
                            ...modalInputs[plugin],
                            value: togledValue,
                          },
                        });
                      }
                    }}
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {plugin}
                  </span>
                </label>
              </div>
            );
          })}
          <p className="mb-6 mt-4 text-base flex justify-center font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
            Do you want to save settings?
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => {
                saveHostSettings(monitor.id);
              }}
              type="button"
              class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
            >
              Yes, I'm sure
            </button>
            <button
              onClick={() => {
                setModalIsVisible(false);
              }}
              type="button"
              class="w-20  text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 flex justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div className="overlay h-[100vh] w-[100vw] overflow-hidden z-[0] fixed top-0 left-0 bg-gray-900 opacity-50"></div>
    </>
  );
};

export default HostNotificationModal;
