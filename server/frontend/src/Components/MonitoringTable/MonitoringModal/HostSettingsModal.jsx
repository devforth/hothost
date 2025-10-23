import { useEffect, useState } from "react";
import { apiFetch } from "../../../../FetchApi";

const HostSettingsModal = ({ chosenHost, hostname, setModalIsVisible }) => {
  const [inputs, setInputs] = useState({
    disk_threshold: "",
    disk_stabilization_lvl: "",
    ram_threshold: "",
    ram_stabilization_lvl: "",
    host_is_down_confirmations: "",
    hours_for_next_alert: "",
  });
  const [placeholders, setPlaceholders] = useState({
    disk_threshold: "",
    disk_stabilization_lvl: "",
    ram_threshold: "",
    ram_stabilization_lvl: "",
    host_is_down_confirmations: "",
    hours_for_next_alert: "",
  });

  const setField = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeNumber = (v, { min = 0, max = 100 } = {}) => {
    if (v === "" || v === null || typeof v === "undefined") return "";
    const n = Number(v);
    if (Number.isNaN(n)) return "";
    if (n < min) return String(min);
    if (n > max) return String(max);
    return String(Math.trunc(n));
  };

  async function loadOverrides(id) {
    const data = await apiFetch({ id }, "get_host_overrides");
    if (data?.data) {
      const { global, host } = data.data;
      // set placeholders from effective (global when no override)
      setPlaceholders({
        disk_threshold: String(global.disk_threshold ?? ""),
        disk_stabilization_lvl: String(global.disk_stabilization_lvl ?? ""),
        ram_threshold: String(global.ram_threshold ?? ""),
        ram_stabilization_lvl: String(global.ram_stabilization_lvl ?? ""),
        host_is_down_confirmations: String(
          global.host_is_down_confirmations ?? ""
        ),
        hours_for_next_alert: String(global.hours_for_next_alert ?? ""),
      });
      // show only overrides as input values (empty means use global)
      setInputs({
        disk_threshold: host.disk_threshold === undefined
          ? ""
          : String(host.disk_threshold ?? ""),
        disk_stabilization_lvl:
          host.disk_stabilization_lvl === undefined
            ? ""
            : String(host.disk_stabilization_lvl ?? ""),
        ram_threshold:
          host.ram_threshold === undefined
            ? ""
            : String(host.ram_threshold ?? ""),
        ram_stabilization_lvl:
          host.ram_stabilization_lvl === undefined
            ? ""
            : String(host.ram_stabilization_lvl ?? ""),
        host_is_down_confirmations:
          host.host_is_down_confirmations === undefined
            ? ""
            : String(host.host_is_down_confirmations ?? ""),
        hours_for_next_alert:
          host.hours_for_next_alert === undefined
            ? ""
            : String(host.hours_for_next_alert ?? ""),
      });
    }
  }

  async function saveOverrides(id) {
    const payload = {
      id,
      settings: {
        disk_threshold: normalizeNumber(inputs.disk_threshold, { min: 0, max: 100 }),
        disk_stabilization_lvl: normalizeNumber(
          inputs.disk_stabilization_lvl,
          { min: 0, max: 100 }
        ),
        ram_threshold: normalizeNumber(inputs.ram_threshold, { min: 0, max: 100 }),
        ram_stabilization_lvl: normalizeNumber(inputs.ram_stabilization_lvl, { min: 0, max: 100 }),
        host_is_down_confirmations: normalizeNumber(
          inputs.host_is_down_confirmations,
          { min: 0 }
        ),
        hours_for_next_alert: normalizeNumber(inputs.hours_for_next_alert, {
          min: 0,
        }),
      },
    };

    const data = await apiFetch(payload, "save_host_overrides");
    if (data?.status === "success") {
      setModalIsVisible(false);
    }
  }

  useEffect(() => {
    loadOverrides(chosenHost);
  }, [chosenHost]);

  return (
    <div className="p-4">
      <h2 className="mb-6 mt-4 text-lg flex justify-center font-bold text-gray-500 dark:text-gray-400 whitespace-normal">
        Settings overrides for {hostname}
      </h2>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
          Disk usage threshold (%)
        </label>
        <input
          name="disk_threshold"
          value={inputs.disk_threshold}
          min={0}
          max={100}
          placeholder={placeholders.disk_threshold}
          type="number"
          onChange={(e) => setField("disk_threshold", e.currentTarget.value)}
          className="placeholder-gray-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
          Disk stabilization level (%)
        </label>
        <input
          name="disk_stabilization_lvl"
          value={inputs.disk_stabilization_lvl}
          min={0}
          max={100}
          placeholder={placeholders.disk_stabilization_lvl}
          type="number"
          onChange={(e) =>
            setField("disk_stabilization_lvl", e.currentTarget.value)
          }
          className="placeholder-gray-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
          RAM usage threshold (%)
        </label>
        <input
          name="ram_threshold"
          value={inputs.ram_threshold}
          min={0}
          max={100}
          placeholder={placeholders.ram_threshold}
          type="number"
          onChange={(e) => setField("ram_threshold", e.currentTarget.value)}
          className="placeholder-gray-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
          RAM stabilization level (%)
        </label>
        <input
          name="ram_stabilization_lvl"
          value={inputs.ram_stabilization_lvl}
          min={0}
          max={100}
          placeholder={placeholders.ram_stabilization_lvl}
          type="number"
          onChange={(e) =>
            setField("ram_stabilization_lvl", e.currentTarget.value)
          }
          className="placeholder-gray-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
          Host is down confirmations
        </label>
        <input
          name="host_is_down_confirmations"
          value={inputs.host_is_down_confirmations}
          min={0}
          type="number"
          placeholder={placeholders.host_is_down_confirmations}
          onChange={(e) =>
            setField("host_is_down_confirmations", e.currentTarget.value)
          }
          className="placeholder-gray-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
          Hours for next disk notification (0 disables repeats)
        </label>
        <input
          name="hours_for_next_alert"
          value={inputs.hours_for_next_alert}
          min={0}
          type="number"
          placeholder={placeholders.hours_for_next_alert}
          onChange={(e) => setField("hours_for_next_alert", e.currentTarget.value)}
          className="placeholder-gray-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => saveOverrides(chosenHost)}
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
        >
          Save
        </button>
        <button
          onClick={() => setModalIsVisible(false)}
          type="button"
          className="w-20  text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 flex justify-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default HostSettingsModal;


