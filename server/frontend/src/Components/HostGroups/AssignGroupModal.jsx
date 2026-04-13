import React, { useEffect, useState } from "react";
import { getData, apiFetch } from "../../../FetchApi";

const AssignGroupModal = ({ setModalIsVisible, hostId, hostType, currentGroupId, onAssigned }) => {
  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState(currentGroupId || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getData("host_groups");
      if (data && data.data) setGroups(data.data);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await apiFetch(
      { id: hostId, type: hostType, groupId: selectedId || null },
      "assign_host_group"
    );
    setSaving(false);
    if (!res.error) {
      setModalIsVisible(false);
      if (onAssigned) onAssigned();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => setModalIsVisible(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Assign host to group
        </h3>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white mb-4"
        >
          <option value="">— Ungrouped —</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setModalIsVisible(false)}
            className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:text-white dark:border-gray-500 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="text-white bg-green-700 hover:bg-green-800 rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignGroupModal;
