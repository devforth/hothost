import { useState, useEffect } from "react";
import { apiFetch, getData } from "../../../FetchApi";
import { Link } from "react-router-dom";


const Plugins = () => {

  const [pluginsArr, setPluginsArr] = useState([]);

  const load = async () => {
    const data = await getData("plugins");
    if (data) {
      setPluginsArr(data.plugins);
    }
  };

  useEffect(() => { load(); }, []);

  const disablePlugin = async (id) => {
    const data = await apiFetch({ id }, `plugin_disable`);
    if (data.status === "success") load();
  };

  return (
    <div>
      <div className="container mx-auto flex justify-center px-4">
        <div className="min-w-2/3 p-4 my-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
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
                    <Link
                      to={`/plugin/${pl.id}`}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Settings
                    </Link>
                  ) : (
                    <Link
                      to={`/plugin/${pl.id}`}
                      className="text-white w-full bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      Enable
                    </Link>
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

        </div>
      </div>
    </div>
  );
};

export default Plugins;
