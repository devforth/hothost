import React from "react";
import { useState, useEffect, useRef } from "react";

const AgentConfigurator = (props) => {
  const chosenOption = props.chosenOption;
  const e = props.elementData;

  return (
    <div>
      {(chosenOption.state === "pureDocker" && chosenOption.id === e.id) ||
      chosenOption.id === "initial" ? (
        <div className=" py-4 rounded-lg dark:bg-gray-800">
          {" "}
          <p className="text-sm text-gray-500 dark:text-gray-400 relative">
            Make sure you have{" "}
            <a
              className="text-blue-600 hover:underline dark:text-blue-500"
              href="https://docs.docker.com/engine/install/"
              target={"_blank"}
            >
              Docker engine installed
            </a>{" "}
            and run monitoringData:
            <button
              className=" sm:flex  absolute right-2 top-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded  items-center"
              // onClick={copyToCb("puredocpre")}
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
          <div
            className=" py-2 rounded-lg "
            id={`#profile-${e.id}`}
            role="tabpanel"
            aria-labelledby={`profile-tab-${e.id}`}
          >
            <pre
              id="puredocpre"
              data-pre-id="${e.id}"
              className="p-4 mb-4 overflow-x-scroll text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
            >
              {`docker run -d --env HOTHOST_SERVER_BASE=${`${
                document.location.protocol
              }//${e.isLocal ? "localhost:8007" : document.location.host}`} \\
                    --env HOTHOST_AGENT_SECRET=${e.secret} \\
                    --env HOTHOST_MONITOR_INTERVAL=60 \ --name hothost-agent \\
                    -v /proc:/host/proc:ro \\
                    -v /sys:/host/sys:ro \\
                    -v /etc/os-release:/host/etc/os-release:ro \\
                    -v  /etc/hostname:/host/etc/hostname:ro \\
                    --restart unless-stopped \\
                    --cap-add SYS_PTRACE \\
                    --security-opt apparmor=unconfined \\
                    ${
                      e.isLocal ? `--network=host` : ""
                    }  devforth/hothost-agent`}
            </pre>
          </div>
          <div
            className=" py-4 rounded-lg dark:bg-gray-800"
            id="dashboard-${e.id}"
            role="tabpanel"
            aria-labelledby="dashboard-tab-${e.id}"
          ></div>
        </div>
      ) : chosenOption.state === "compose" && chosenOption.id === e.id ? (
        <div className=" py-4 rounded-lg dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 relative">
            If you have a Docker Compose stack you can just add monitoringData
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
            data-pre-id="${e.id}"
            className="p-4 mb-4 overflow-x-scroll text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
          >
            {`version: '3' services: hothost-agent: image:
                    devforth/hothost-agent environment: -
                    HOTHOST_SERVER_BASE=${`${document.location.protocol}//${
                      e.isLocal ? "localhost:8007" : document.location.host
                    }`}
                    - HOTHOST_AGENT_SECRET=${e.secret}-
                    HOTHOST_MONITOR_INTERVAL=60 container_name: hothost-agent
                    restart: unless-stopped cap_add: - SYS_PTRACE security_opt:
                    - apparmor:unconfined - seccomp:unconfine volumes: -
                    /proc:/host/proc:ro - /sys:/host/sys:ro -
                    /etc/os-release:/host/etc/os-release:ro -
                    /etc/hostname:/host/etc/hostname:ro`}
          </pre>
        </div>
      ) : (
        <div
          className=" py-4 rounded-lg dark:bg-gray-800"
          id="settings-${e.id}"
          role="tabpanel"
          aria-labelledby="settings-tab-${e.id}"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you want to run agent locally without Docker you can add cron job
            which starts on boot.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 relative">
            First make sure you have{" "}
            <code className="rounded bg-pink-100 text-red-900 p-1">bash</code>{" "}
            and{" "}
            <code className="rounded bg-pink-100 text-red-900 p-1">curl</code>{" "}
            installed then use{" "}
            <code className="rounded bg-pink-100 text-red-900 p-1">
              crontab -e
            </code>{" "}
            and add next
            <button
              className=" sm:flex  absolute right-2 top-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded items-center"
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
            data-pre-id="${e.id}"
            className="whitespace-pre-wrap overflow-x-scroll py-4 pl-4 pr-20  mb-4 text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
          >
            {` @reboot curl https://raw.githubusercontent.com/devforth/hothost/main/hothost-agent/getinfo.sh |  HOTHOST_SERVER_BASE=${`${
              document.location.protocol
            }//${
              e.isLocal ? "localhost:8007" : document.location.host
            }`} HOTHOST_MONITOR_INTERVAL=60 HOTHOST_AGENT_SECRET=${
              e.secret
            } bash`}
          </pre>
          {/* <script>
            document.querySelectorAll('[data-pre-id="${e.id}"]').forEach(function (el) {
              el.innerHTML = el.innerHTML.replace('___CURRENT_URL___', document.location.protocol + '//' +
                document.location.host);
            });
          </script> */}
        </div>
      )}
    </div>
  );
};

export default AgentConfigurator;
