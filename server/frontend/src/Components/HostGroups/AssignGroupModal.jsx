import { useEffect, useMemo, useRef, useState } from "react";
import { getData, apiFetch } from "../../../FetchApi";

const AssignGroupModal = ({
  setModalIsVisible,
  hostId,
  hostType,
  hostName,
  currentGroupId,
  onAssigned,
}) => {
  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState(currentGroupId || "");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await getData("host_groups");
      if (data && data.data) setGroups(data.data);
    })();
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, query]);

  const exactMatch = useMemo(
    () =>
      groups.some(
        (g) => g.name.trim().toLowerCase() === query.trim().toLowerCase()
      ),
    [groups, query]
  );

  const createGroup = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    const res = await apiFetch({ name }, "host_groups");
    setCreating(false);
    if (!res.error) {
      setGroups((prev) => [...prev, res.data]);
      setSelectedId(res.data.id);
      setQuery("");
    }
  };

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

  const options = [{ id: "", name: "— No group —" }, ...filtered];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => setModalIsVisible(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Assign to group
            </h3>
            {hostName && (
              <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500 truncate">
                {hostName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setModalIsVisible(false)}
            className="ml-3 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="relative mb-3">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim() && !exactMatch) createGroup();
            }}
            placeholder="Search or create a group…"
            className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="scrollbar-visible mb-5 max-h-64 space-y-1 overflow-y-auto pr-1">
          {options.map((g) => {
            const active = selectedId === g.id;
            return (
              <button
                key={g.id || "none"}
                type="button"
                onClick={() => setSelectedId(g.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors
                  ${active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60"
                  }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors
                    ${active
                      ? "border-green-600 dark:border-green-400"
                      : "border-gray-300 dark:border-gray-500"
                    }`}
                >
                  {active && (
                    <span className="h-2.5 w-2.5 rounded-full bg-green-600 dark:bg-green-400" />
                  )}
                </span>
                <span className={`truncate ${g.id === "" ? "italic" : ""}`}>
                  {g.name}
                </span>
              </button>
            );
          })}

          {query.trim() && !exactMatch && (
            <button
              type="button"
              disabled={creating}
              onClick={createGroup}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-green-700 hover:bg-green-100 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/30"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="truncate">
                Create “<span className="font-medium">{query.trim()}</span>”
              </span>
            </button>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setModalIsVisible(false)}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignGroupModal;
