import React from "react";
import { useState, useEffect, useRef } from "react";
import { Toast } from "flowbite-react";

const AgentConfigurator = (props) => {
  const e = props.monitoringData;
  const active = props.active;
  const [toastState, setToastState] = useState({
    isVisible: false,
    content: "red",
    type: "red",
  });

  const copyText = function (ref, cb) {
    const text = ref;
    let textToCopy = text.innerText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        cb();
      });
    } else {
      console.log("Browser Not compatible");
    }
  };
  const showToast = function () {
    setToastState({ isVisible: true });
  };

  const textContent = {
    "Pure Docker": {
      header: (
        <p className="text-sm text-gray-500 dark:text-gray-400 relative">
          Make sure you have
          <a
            className="text-blue-600 hover:underline dark:text-blue-500"
            href="https://docs.docker.com/engine/install/"
            target={"_blank"}
          >
            {" "}
            Docker engine installed
          </a>{" "}
          and run this:{" "}
        </p>
      ),

      text: (
        <pre
          id="puredocpre"
          className="p-4 mb-4   overflow-x-scroll text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
        >
          {`docker run -d \\
 --env HOTHOST_SERVER_BASE=${`${document.location.protocol}//${
   e.isLocal ? "localhost:8007" : document.location.host
 }`} \\
 --env HOTHOST_AGENT_SECRET=${e.secret} \\
 --env HOTHOST_MONITOR_INTERVAL=60 \\
 --name hothost-agent \\
 -v /proc:/host/proc:ro \\
 -v /sys:/host/sys:ro \\
 -v /etc/os-release:/host/etc/os-release:ro \\
 -v /etc/hostname:/host/etc/hostname:ro \\
 --restart unless-stopped \\
 --cap-add SYS_PTRACE \\
 --security-opt apparmor=unconfined \\
 --security-opt seccomp=unconfined \\
 ${e.isLocal ? `--network=host` : ""}  devforth/hothost-agent`}
        </pre>
      ),
    },
    Compose: {
      header: (
        <p className="text-sm text-gray-500 dark:text-gray-400 relative">
          If you have a Docker Compose stack you can just add this snippet:
        </p>
      ),

      text: (
        <pre
          id="composepre"
          className="p-4 mb-4 overflow-x-scroll text-gray-500 dark:text-white text-xs bg-white border dark:border-gray-600 dark:bg-gray-700 block rounded shadow-md mt-5 whitespace-pre overflow-x-none "
        >
          {`version: '3'
services:
  hothost-agent:
    image: devforth/hothost-agent
    environment:
    - HOTHOST_SERVER_BASE=${`${document.location.protocol}//${
      e.isLocal ? "localhost:8007" : document.location.host
    }`}
    - HOTHOST_AGENT_SECRET=${e.secret}
    - HOTHOST_MONITOR_INTERVAL=60
    container_name: hothost-agent
    restart: unless-stopped
    cap_add:
      - SYS_PTRACE
    security_opt:
      - apparmor:unconfined
      - seccomp:unconfined
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /etc/os-release:/host/etc/os-release:ro
      - /etc/hostname:/host/etc/hostname:ro`}
        </pre>
      ),
    },

    "Pure Bash": {
      header: (
        <div>
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
          </p>
        </div>
      ),

      text: (
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
      ),
    },
  };

  return (
    <div>
      {
        <div className=" py-4  relative rounded-lg dark:bg-gray-800 ">
          {textContent[active].header}
          {textContent[active].text}
          <button
            className={`sm:flex  mobile:hidden absolute right-2 top-14 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded  items-center ${
              active === "Pure Bash" ? "top-[76px]" : ""
            }`}
            onClick={() => {
              copyText(document.querySelector("pre"), showToast);
              setTimeout(() => {
                setToastState({ isVisible: false });
              }, 3000);
            }}
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
        </div>
      }
      {toastState.isVisible ? (
        <div className="fixed bottom-0 right-0 z-50">
          <Toast
            className={
              " bg-green-100 text--500 dark:bg-green-800 dark:text-green-200"
            }
          >
            <div
              className={`inline-flex h-8 w-8 shrink-0 shadow-lg items-center justify-center rounded-lg bg-green-100 text--500 dark:bg-green-800 dark:text-green-200 z-50`}
            >
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
            Copied to clickboard!
            <div className="ml-3 text-sm font-normal"></div>
            <Toast.Toggle />
          </Toast>
        </div>
      ) : null}
    </div>
  );
};

export default AgentConfigurator;
