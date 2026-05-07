import React from "react";
import { useState, useEffect } from "react";
import { apiFetch, getData } from "../../../FetchApi";
import { useNavigate } from "react-router-dom";


const Plugins = () => {
  const navigate = useNavigate("");

  const [pluginsArr, setPluginsArr] = useState([]);
  const [hostGroups, setHostGroups] = useState([]);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [addPluginGroupId, setAddPluginGroupId] = useState(null);

  const load = async () => {
    const data = await getData("plugins");
    if (data) {
      setPluginsArr(data.plugins);
      if (data.hostGroups) setHostGroups(data.hostGroups);
    }
  };

  useEffect(() => { load(); }, []);

  const disablePlugin = async (id) => {
    const data = await apiFetch({ id }, `plugin_disable`);
    if (data.status === "success") load();
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    await apiFetch({ name: newGroupName.trim() }, "host_groups");
    setNewGroupName("");
    setAddGroupOpen(false);
    load();
  };

  const deleteGroup = async (id) => {
    if (!window.confirm("Delete this group? Hosts will become ungrouped.")) return;
    await apiFetch({}, `host_groups/${id}/delete`);
    load();
  };

  const removePluginFromGroup = async (groupId, pluginId) => {
    await apiFetch({}, `host_groups/${groupId}/plugin/${pluginId}/remove`);
    load();
  };

  const availablePlugins = pluginsArr;

  return (
    <div>
      <div className="container mx-auto flex justify-center px-4">
        <div className="min-w-2/3 p-4 my-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <a
              onClick={() => navigate("/home")}
              className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
        focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5
        text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to hosts list
            </a>
          </div>

          {/* Plugins section */}
          <h5 className="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">
            Available plugins
          </h5>

          <div className="max-w-2/3 gap-x-10 gap-y-10 divide-gray-200 dark:divide-gray-700 flex flex-wrap mb-10">
            {pluginsArr.map((pl) => (
              <div
                key={pl.id}
                className="w-60 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col"
              >
                <img className="w-40 h-40 my-6 mx-auto rounded-t-lg" src={pl.iconUrlOrBase64} alt={pl.id} />
                <div className="flex justify-between items-center px-6 pb-6 mt-auto">
                  {pl.pluginEnabled ? (
                    <a
                      onClick={() => navigate(`/plugin/${pl.id}`)}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer"
                    >
                      Settings
                    </a>
                  ) : (
                    <a
                      onClick={() => navigate(`/plugin/${pl.id}`)}
                      className="text-white w-full bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer"
                    >
                      Enable
                    </a>
                  )}
                  {pl.pluginEnabled && (
                    <button
                      onClick={() => disablePlugin(pl.id)}
                      className="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 cursor-pointer"
                    >
                      Disable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Groups section */}
          <h5 className="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">
            Groups
          </h5>

          <div className="max-w-2/3 gap-x-10 gap-y-10 flex flex-wrap">
            {hostGroups.map((g) => (
              <div
                key={g.id}
                className="w-60 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col"
              >
                <div className="px-6 pt-5 pb-2">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{g.name}</p>
                </div>

                {/* Installed plugins */}
                {g.installedPlugins && g.installedPlugins.length > 0 && (
                  <div className="px-6 pb-2 flex flex-col gap-2">
                    {g.installedPlugins.map((pluginId) => {
                      const pl = pluginsArr.find((p) => p.id === pluginId);
                      return (
                        <div key={pluginId} className="flex flex-col justify-center gap-2">
                          <div className="flex gap-2">
                            {pl && <img className="w-6 h-6 rounded" src={pl.iconUrlOrBase64} alt={pluginId} />}
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{pluginId}</span>
                          </div>
                          <div className="flex gap-2">
                            <a
                              onClick={() => navigate(`/plugin/${pluginId}?groupId=${g.id}`)}
                              className="text-xs text-center w-full text-white bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 cursor-pointer"
                            >
                              Settings
                            </a>
                            <button
                              onClick={() => removePluginFromGroup(g.id, pluginId)}
                              className="text-xs text-center w-full text-white bg-red-600 hover:bg-red-700 rounded px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add plugin button */}
                <div className="px-6 pb-4 my-auto pt-3">
                  {addPluginGroupId === g.id ? (
                    <div className="flex flex-col gap-2">
                      <select
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            navigate(`/plugin/${e.target.value}?groupId=${g.id}`);
                          }
                        }}
                      >
                        <option value="" disabled>Select plugin…</option>
                        {availablePlugins
                          .filter((p) => !g.installedPlugins?.includes(p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>{p.id}</option>
                          ))}
                      </select>
                      <button
                        onClick={() => setAddPluginGroupId(null)}
                        className="text-xs text-gray-600 dark:text-gray-300 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => setAddPluginGroupId(g.id)}
                        disabled={availablePlugins.filter((p) => !g.installedPlugins?.includes(p.id)).length === 0}
                        className="text-white w-full bg-green-700 hover:bg-green-800 disabled:opacity-40 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700"
                      >
                        + Add Plugin
                      </button>
                      <button
                        onClick={() => deleteGroup(g.id)}
                        className="text-white w-full bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-4 py-2 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Delete Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add group card */}
            <div className="w-60 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center min-h-[160px]">
              {!addGroupOpen ? (
                <button
                  onClick={() => setAddGroupOpen(true)}
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  + Add Group
                </button>
              ) : (
                <div className="p-4 w-full">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Group name"
                    onKeyDown={(e) => e.key === "Enter" && createGroup()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createGroup}
                      className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setAddGroupOpen(false); setNewGroupName(""); }}
                      className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plugins;
