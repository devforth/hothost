import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, getData } from "../../../FetchApi";

const Groups = () => {
  const navigate = useNavigate();
  const [pluginsArr, setPluginsArr] = useState([]);
  const [hostGroups, setHostGroups] = useState([]);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [addPluginGroupId, setAddPluginGroupId] = useState(null);
  const [selectedPluginId, setSelectedPluginId] = useState("");

  const load = async () => {
    const data = await getData("plugins");
    if (data) {
      if (data.plugins) setPluginsArr(data.plugins);
      if (data.hostGroups) setHostGroups(data.hostGroups);
    }
  };

  useEffect(() => { load(); }, []);

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

  return (
    <div>
      <div className="container mx-auto flex justify-center px-4">
        <div className="w-full p-4 my-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700">
          <div className="flex justify-between items-center gap-4 mb-5">
            <Link
              to="/home"
              className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
        focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5
        text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to hosts list
            </Link>
          </div>

          <h5 className="mb-3 text-3xl font-bold leading-none text-gray-900 dark:text-white">
            Groups
          </h5>
          <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-5 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              A group inherits the default plugin settings. Until you set a
              group's own Slack webhook, its notifications go to the default
              plugin's webhook. If no default webhook is configured either, Slack
              notifications are silently skipped.
            </span>
          </p>
          <div className="w-full gap-10 grid grid-cols-4 mb-10">
            {hostGroups.map((g) => (
              <div
                key={g.id}
                className="w-full bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col"
              >
                <div className="px-6 pt-5 pb-2">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{g.name}</p>
                </div>

                {g.installedPlugins && g.installedPlugins.length > 0 && (
                  <div className="px-6 pb-2 flex flex-col gap-2">
                    {g.installedPlugins.map((pluginId) => {
                      const pl = pluginsArr.find((p) => p.id === pluginId);
                      return (
                        <div key={pluginId} className="flex justify-between items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="flex items-center gap-2">
                            {pl && <img className="w-6 h-6 rounded" src={pl.iconUrlOrBase64} alt={pluginId} />}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{pluginId}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/plugin/${pluginId}?groupId=${g.id}`}
                              className="text-sm hover:underline dark:text-white"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              title="Remove plugin"
                              onClick={() => removePluginFromGroup(g.id, pluginId)}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(!g.installedPlugins || g.installedPlugins.length === 0) && (
                  <div className="px-6 pb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      No plugin configured
                    </p>
                  </div>
                )}

                <div className="px-6 pb-4 mt-auto pt-3">
                  {addPluginGroupId === g.id ? (
                    <div className="flex flex-col gap-2">
                      <select
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={selectedPluginId}
                        onChange={(e) => setSelectedPluginId(e.target.value)}
                      >
                        <option value="" disabled>Select plugin…</option>
                        {pluginsArr
                          .filter((p) => !g.installedPlugins?.includes(p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>{p.id}</option>
                          ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAddPluginGroupId(null); setSelectedPluginId(""); }}
                          className="w-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!selectedPluginId}
                          onClick={() => navigate(`/plugin/${selectedPluginId}?groupId=${g.id}`)}
                          className="w-full text-white bg-green-700 hover:bg-green-800 disabled:opacity-40 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => { setAddPluginGroupId(g.id); setSelectedPluginId(""); }}
                        disabled={pluginsArr.filter((p) => !g.installedPlugins?.includes(p.id)).length === 0}
                        className="text-white w-full bg-green-700 hover:bg-green-800 disabled:opacity-40 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700"
                      >
                        + Add Plugin
                      </button>
                      <button
                        onClick={() => deleteGroup(g.id)}
                        className="w-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-500"
                      >
                        Delete Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="w-full bg-white rounded-lg shadow-md dark:bg-gray-800 flex flex-col items-center justify-center min-h-[160px]">
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

export default Groups;
