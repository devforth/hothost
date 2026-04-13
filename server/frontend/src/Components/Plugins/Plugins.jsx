import React from "react";
import { useState, useEffect } from "react";
import { apiFetch, getData } from "../../../FetchApi";
import { useNavigate } from "react-router-dom";


const Plugins = () => {
  const navigate = useNavigate("");
  const clickAndNavigate = function (path) {
    navigate(`/${path}`);
  };

  const [pluginsArr, setPluginsArr] = useState([]);
  const [hostGroups, setHostGroups] = useState([]);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const getPlugginsArr = async function () {
    const data = await getData("plugins");
    if (data) {
      setPluginsArr(data.plugins);
      if (data.hostGroups) setHostGroups(data.hostGroups);
    }
  };

  useEffect(() => {
    getPlugginsArr();
  }, []);

  const disablePlugin = async function (e) {
    const data = await apiFetch({ id: e.target.id }, `plugin_disable`);
    if (data.status === "success") {
      getPlugginsArr();
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    await apiFetch({ name: newGroupName.trim(), slackWebhook: "" }, "host_groups");
    setNewGroupName("");
    setAddGroupOpen(false);
    getPlugginsArr();
  };

  const deleteGroup = async (id) => {
    if (!window.confirm("Delete this group? Hosts will become ungrouped.")) return;
    await apiFetch({}, `host_groups/${id}/delete`);
    getPlugginsArr();
  };

  const slackPlugin = pluginsArr.find((p) => p.id === "slack-notifications");

  return (
    <div>
      <div className="container mx-auto flex justify-center px-4">
        <div className="min-w-2/3 p-4 my-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <div>
              <a
                onClick={() => { clickAndNavigate("home"); }}
                className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
          focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5
          text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to hosts list
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h5 className="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">
              Available plugins
            </h5>
          </div>

          <div className="max-w-2/3 gap-x-10 gap-y-10 divide-gray-200 dark:divide-gray-700 flex flex-wrap">
            {pluginsArr.map((pl) => {
              return (
                <div
                  key={pl.id}
                  className="w-60 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col"
                >
                  <img
                    className="w-40 h-40 my-6 mx-auto rounded-t-lg"
                    src={pl.iconUrlOrBase64}
                    alt="product image"
                  />
                  <div className="px-6 pb-3"></div>
                  <div className="flex justify-between items-center px-6 pb-6 mt-auto">
                    {pl.pluginEnabled ? (
                      <a
                        onClick={() => { clickAndNavigate(`plugin/${pl.id}`); }}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer"
                      >
                        Settings
                      </a>
                    ) : (
                      <a
                        onClick={() => { clickAndNavigate(`plugin/${pl.id}`); }}
                        className="text-white w-full bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer"
                      >
                        Enable
                      </a>
                    )}
                    {pl.pluginEnabled ? (
                      <button
                        onClick={(e) => { disablePlugin(e); }}
                        id={pl.id}
                        className="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 cursor-pointer"
                      >
                        Disable
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* Host group cards */}
            {hostGroups.map((g) => (
              <div
                key={`group_${g.id}`}
                className="w-60 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col"
              >
                {slackPlugin && (
                  <img
                    className="w-40 h-40 my-6 mx-auto rounded-t-lg"
                    src={slackPlugin.iconUrlOrBase64}
                    alt="Slack"
                  />
                )}
                <div className="px-6 pb-3 text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{g.name}</p>
                  {g.channelName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{g.channelName}</p>
                  )}
                </div>
                <div className="flex justify-between items-center px-6 pb-6 mt-auto">
                  <a
                    onClick={() => { navigate(`/plugin/slack-notifications?groupId=${g.id}`); }}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer"
                  >
                    Settings
                  </a>
                  <button
                    onClick={() => deleteGroup(g.id)}
                    className="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Add group card */}
            <div className="w-60 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center min-h-[280px]">
              {!addGroupOpen ? (
                <button
                  onClick={() => setAddGroupOpen(true)}
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer"
                >
                  + Add Slack Group
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

      <div
        id="toast-copied"
        className="fixed right-2 bottom-2 hidden flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-green-900 dark:bg-green-100"
        role="alert"
      >
        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-100 dark:text-green-900">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
        <div className="ml-3 text-sm font-normal">Copied to clipboard!</div>
        <button
          type="button"
          className="bg-transparent ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 dark:text-green-900 dark:hover:text-black"
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Plugins;
