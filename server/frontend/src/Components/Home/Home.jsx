import React from "react";
import { useState, useEffect } from "react";
import { getData } from "../../../FetchApi.js";

const Home = ({ authorized }) => {
  const [monitoringData, setMonitoringData] = useState([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const data = getData();
    if (data) {
      setMonitoringData(data);
    }
  }, []);

  return (
    <div>
      <div className="mx-auto pt-4 px-4 flex justify-center max-w-min mobile:max-w-max">
        <div className="container mb-4">
          <div className="flex mb-1">
            <div className="flex-1 mr-1 text-center border-b-4 border-gray-700 font-semibold text-gray-800 dark:text-white">
              Host monitoring
            </div>
            <a
              href="/http-monitor"
              className="flex-1 ml-1 text-center border-b-2 border-gray-700 text-gray-800 dark:text-white hover:cursor-pointer"
            >
              Http/Https monitoring
            </a>
          </div>

          <div className="p-4  bg-gray-100 rounded-lg shadow-md  dark:bg-gray-600 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h5 className="w-max text-xl font-bold leading-none text-gray-900 dark:text-white">
                Hosts under monitoring
              </h5>
              {/* {{#if authorized}} */}
              <form action="/api/add_monitor" method="POST">
                <button
                  className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none mobile:w-max
            focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex mobile:inline items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add new host
                </button>
              </form>
              {/* {{/if}} */}
            </div>
            {/* {{#each monitoringData}}
    {{#if this.no_data}} */}
            <div className="p-6 mt-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h5 className="text-md mb-4 font-bold leading-none text-gray-900 dark:text-white">
                Configure your agent
              </h5>
              <ul
                className="flex flex-nowrap overflow-x-auto text-sm font-medium text-center"
                id="myTab-{{ this.id }}"
                data-tabs-toggle="#myTabContent-{{ this.id }}"
                role="tablist"
              >
                <li role="presentation" className="flex shrink-1">
                  <button
                    className="p-4 rounded-t-lg border-b-2"
                    id="profile-tab-{{ this.id }}"
                    data-tabs-target="#profile-{{ this.id }}"
                    type="button"
                    role="tab"
                    aria-controls="profile-{{ this.id }}"
                    aria-selected="false"
                  >
                    Pure Docker
                  </button>
                </li>
                <li role="presentation" className="flex shrink-1">
                  <button
                    className=" p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    id="dashboard-tab-{{ this.id }}"
                    data-tabs-target="#dashboard-{{ this.id }}"
                    type="button"
                    role="tab"
                    aria-controls="dashboard-{{ this.id }}"
                    aria-selected="false"
                  >
                    Compose
                  </button>
                </li>
                <li role="presentation" className="flex shrink-1">
                  <button
                    className="p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    id="settings-tab-{{ this.id }}"
                    data-tabs-target="#settings-{{ this.id }}"
                    type="button"
                    role="tab"
                    aria-controls="settings-{{ this.id }}"
                    aria-selected="false"
                  >
                    Pure Bash
                  </button>
                </li>
              </ul>
              <div id="myTabContent-{{ this.id }}">
                <div
                  className="hidden py-2 rounded-lg "
                  id="profile-{{ this.id }}"
                  role="tabpanel"
                  aria-labelledby="profile-tab-{{ this.id }}"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 relative">
                    Make sure you have{" "}
                    <a
                      className="text-blue-600 hover:underline dark:text-blue-500"
                      href="https://docs.docker.com/engine/install/"
                    >
                      Docker engine installed
                    </a>{" "}
                    and run this:
                    <button
                      className="hidden sm:flex  absolute right-2 top-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded  items-center"
                      // onclick="copyToCb('puredocpre')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy
                    </button>
                  </p>
                  <pre
                    id="puredocpre"
                    data-pre-id="{{ this.id }}"
                    className="p-4 mb-4 overflow-x-scroll text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
                  >
                    docker run -d \ --env HOTHOST_SERVER_BASE=___CURRENT_URL___
                    \{/* --env HOTHOST_AGENT_SECRET={{ this.secret }} \ */}
                    --env HOTHOST_MONITOR_INTERVAL=60 \ --name hothost-agent \
                    -v /proc:/host/proc:ro \ -v /sys:/host/sys:ro \ -v
                    /etc/os-release:/host/etc/os-release:ro \ -v
                    /etc/hostname:/host/etc/hostname:ro \ --restart
                    unless-stopped \ --cap-add SYS_PTRACE \ --security-opt
                    apparmor=unconfined \{/* {{#if ../local }} */}
                    --network=host \{/* {{/if}} */}
                    devforth/hothost-agent
                  </pre>
                </div>
                <div
                  className="hidden py-4 rounded-lg dark:bg-gray-800"
                  id="dashboard-{{ this.id }}"
                  role="tabpanel"
                  aria-labelledby="dashboard-tab-{{ this.id }}"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 relative">
                    If you have a Docker Compose stack you can just add this
                    snippet:
                    <button
                      className="hidden sm:flex  absolute right-2 top-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded items-center"
                      // onclick="copyToCb('composepre')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy
                    </button>
                  </p>
                  <pre
                    id="composepre"
                    data-pre-id="{{ this.id }}"
                    className="p-4 mb-4 overflow-x-scroll text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
                  >
                    version: '3' services: hothost-agent: image:
                    devforth/hothost-agent environment: -
                    HOTHOST_SERVER_BASE=___CURRENT_URL___
                    {/* - HOTHOST_AGENT_SECRET={{ this.secret }} */}-
                    HOTHOST_MONITOR_INTERVAL=60 container_name: hothost-agent
                    restart: unless-stopped cap_add: - SYS_PTRACE security_opt:
                    - apparmor:unconfined - seccomp:unconfine volumes: -
                    /proc:/host/proc:ro - /sys:/host/sys:ro -
                    /etc/os-release:/host/etc/os-release:ro -
                    /etc/hostname:/host/etc/hostname:ro
                  </pre>
                </div>
                <div
                  className="hidden py-4 rounded-lg dark:bg-gray-800"
                  id="settings-{{ this.id }}"
                  role="tabpanel"
                  aria-labelledby="settings-tab-{{ this.id }}"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    If you want to run agent locally without Docker you can add
                    cron job which starts on boot.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 relative">
                    First make sure you have{" "}
                    <code className="rounded bg-pink-100 text-red-900 p-1">
                      bash
                    </code>{" "}
                    and{" "}
                    <code className="rounded bg-pink-100 text-red-900 p-1">
                      curl
                    </code>{" "}
                    installed then use{" "}
                    <code className="rounded bg-pink-100 text-red-900 p-1">
                      crontab -e
                    </code>{" "}
                    and add next
                    <button
                      className="hidden sm:flex  absolute right-2 top-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded items-center"
                      // onclick="copyToCb('bashpre')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy
                    </button>
                  </p>
                  <pre
                    id="bashpre"
                    data-pre-id="{{ this.id }}"
                    className="whitespace-pre-wrap overflow-x-scroll py-4 pl-4 pr-20  mb-4 text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
                  >
                    {/* @reboot curl https://raw.githubusercontent.com/devforth/hothost/main/hothost-agent/getinfo.sh | HOTHOST_SERVER_BASE=___CURRENT_URL___ HOTHOST_MONITOR_INTERVAL=60 HOTHOST_AGENT_SECRET={{ this.secret }} bash</pre> */}
                  </pre>
                  {/* <script>
            document.querySelectorAll('[data-pre-id="{{ this.id }}"]').forEach(function (el) {
              el.innerHTML = el.innerHTML.replace('___CURRENT_URL___', document.location.protocol + '//' +
                document.location.host);
            });
          </script> */}
                  <p></p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Refresh this page to see update.{" "}
              </p>
              <form action="/api/remove_monitor?id={{ this.id }}" method="POST">
                <button className="flex mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </button>
              </form>
            </div>
            {/* {{/if}}
    {{/each}} */}
            <div className="flow-root overflow-auto mobile:truncate">
              {/* {{> monitoring_table}} */}
            </div>
          </div>
        </div>
      </div>
      <div
        id="toast-copied"
        className=" fixed right-2 bottom-2 hidden flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-green-900 dark:bg-green-100"
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
          className="bg-transparent ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 dark:text-green-900 dark:hover:text-black "
          // onclick="hideCOpyTost()"
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

      {/* <script>

  function hideCOpyTost() {
    document.getElementById('toast-copied').classNameList.add('hidden');
  }

  function copyToCb(idOfPre) {
    const copyText = document.getElementById(idOfPre).textContent;
    const textArea = document.createElement('textarea');
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    document.getElementById('toast-copied').classNameList.remove('hidden');
    setTimeout(hideCOpyTost, 5000);

  }

  function checkHost(hostName, index) {
    const confirmHost = document.getElementById('confirmHost-'+index);
    const deleteHostBtn = document.getElementById('deleteHostBtn-'+index);
    if (hostName === confirmHost.value) {
      deleteHostBtn.disabled = false;
    } else {
      deleteHostBtn.disabled = true;
    }
  }

  function onCloseModal() {
    window.location = "/"
  }

  const monitoringTable = document.getElementById('monitoring');
  setInterval(async () => {
    const response = await fetch('/update');
    const data = await response.text();
    if (monitoringTable) {
      monitoringTable.innerHTML = data;

      window.document.dispatchEvent(new Event("DOMContentLoaded"));
    }
  }, 10000);
            </script> */}
    </div>
  );
};
export default Home;
