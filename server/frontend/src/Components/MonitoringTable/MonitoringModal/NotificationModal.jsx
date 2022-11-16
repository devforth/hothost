import { useEffect, useState } from "react";
import { getData, apiFetch } from "../../../../FetchApi";

const NotificationModal = ({ chosenHost, hostname, setModalIsVisible }) => {
  async function getHostSettings(id) {
    const data = await apiFetch(id, "get_host_settings");
    if (data.data) {
      setModalInputs(data.data);
    }
  }
  async function saveHostSettings(id) {
    const data = await apiFetch(
      { settings: modalInputs, id },
      "save_host_settings"
    );

    if (data.status === "success") {
      setModalIsVisible(false);
    }
  }

  useEffect(() => {
    getHostSettings({ id: chosenHost });
  }, []);

  const [modalInputs, setModalInputs] = useState({
    disk_is_almost_full: { value: true },
    host_is_offline: { value: true },
    ram_is_almost_full: { value: true },
  });

  return (
    <div className="p-4">
      <h2 className="mb-6 mt-4 text-lg flex justify-center font-bold text-gray-500 dark:text-gray-400 whitespace-normal">
        Notify settings of {hostname} host{" "}
      </h2>
      {Object.keys(modalInputs).map((notifName, i) => {
        return (
          <div className="mb-6" key={`notName-${i}`}>
            <label
              htmlFor={notifName}
              className="relative inline-flex items-center mb-4 cursor-pointer"
            >
              <input
                name={notifName}
                id={notifName}
                type="checkbox"
                checked={modalInputs[notifName].value}
                class="sr-only peer"
              />
              <div
                onClick={() => {
                  const togledValue = !modalInputs[notifName].value;

                  setModalInputs({
                    ...modalInputs,
                    [notifName]: { value: togledValue },
                  });
                }}
                className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {notifName}
              </span>
            </label>
          </div>
        );
      })}
      <p className="mb-6 mt-4 text-base flex justify-center font-normal text-gray-500 dark:text-gray-400 whitespace-normal">
        Do you want to save host notification?
      </p>
      <div className="flex justify-between">
        <button
          onClick={() => {
            saveHostSettings(chosenHost);
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
  );
};

export default NotificationModal;
