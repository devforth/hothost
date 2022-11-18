import React, { useState } from "react";
import { useEffect } from "react";
import { getData } from "../../../FetchApi";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../../FetchApi";
import { Toast } from "flowbite-react";

const Plugin = () => {
  const [plugin, setPlugin] = useState("");
  const [inputsValue, setInputsValue] = useState({});
  const [toastState, setToastState] = useState({
    isVisible: false,
    content: "red",
    type: "red",
  });
  const [requiredErrors, setRequiredErrors] = useState(false);
  let params = useParams();

  const navigate = useNavigate("");
  const clickAndNavigate = function (path) {
    navigate(`/${path}`);
  };

  const enablePlugin = async function (e) {
    // check required fields

    const requiredInpts = inputsValue.filter((el) => el.required && !el.value);
    if (requiredInpts.length > 0) {
      setRequiredErrors(true);
      setToastState({
        isVisible: true,
        content: "Fill in all required fields.",
        type: "red",
      });
      setTimeout(() => {
        setToastState({
          isVisible: false,
          content: "",
          type: "",
        });
      }, 5000);
    } else {
      const arrOfProps = inputsValue.map((el) => {
        return { [el.inputName]: el.value };
      });

      let result = arrOfProps.reduce(
        (a, c) => Object.assign(a, c),
        Object.create(null)
      );

      const onlyTruthy = function (object) {
        for (var key in object) {
          if (!object[key]) {
            delete object[key];
          }
        }
        return object;
      };

      const settingsWithoutFalseValue = onlyTruthy(result);
      if (e.target.id === "save") {
        settingsWithoutFalseValue.notify = false;
      }
      if (e.target.id === "save_notify") {
        settingsWithoutFalseValue.notify = true;
      }

      const data = await apiFetch (
        settingsWithoutFalseValue,
        `plugin/${params.pluginName}`
      );
      if (data.status === "success" && e.target.id === "save") {
        clickAndNavigate("plugins");
      } else {
        if (data.status === "success") {
          setToastState({
            isVisible: true,
            content: " Message send.",
            type: "green",
          });
          setTimeout(() => {
            setToastState({
              isVisible: false,
              content: " Message send.",
              type: "green",
            });
          }, 5000);
        }
      }
    }
  };

  const changeCheckboxValue = function (e) {
    const newArr = [...inputsValue];
    newArr.forEach((element) => {
      if (element.id === e.target.id) {
        element.value = !element.value;
      }
    });
    setInputsValue(newArr);
  };

  const changeInputsValue = function (e) {
    const newArr = [...inputsValue];
    newArr.forEach((element) => {
      if (element.id === e.target.id) {
        element.value = e.target.value;
      }
    });
    setInputsValue(newArr);
  };

  const changeSelectValue = function (e) {
    const newArr = [...inputsValue];
    newArr.forEach((element) => {
      if (element.id === e.target.id) {
        element.value = e.target.value;
      }
    });
    setInputsValue(newArr);
  };

  useEffect(() => {
    const getPlugin = async function () {
      const data = await getData(`plugin/${params.pluginName}`);
      if (data) {
        setPlugin(data.data);
        setInputsValue(
          data.data.params.map((el) => {
            if (!el.hasOwnProperty("value")) {
              el.value = "";
            }
            return el;
          })
        );
      }
    };
    getPlugin();
  }, []);

  return (
    <div className="container mx-auto px-4 flex justify-center ">
      <div className="p-4 my-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700 w-max mobile:container">
        <div className="flex justify-between items-center mb-5">
          <div>
            <a
              onClick={()=>{ clickAndNavigate("plugins")}}
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
              Back to plugins
            </a>
          </div>
        </div>

        <h1 className="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">
          {plugin.plugin?.name} plugin
        </h1>

        <div className="max-w-2/3 gap-y-5 gap-y-10 divide-gray-200 dark:divide-gray-700 flex flex-wrap text-gray-800 dark:text-gray-400">
          {plugin.plugin?.description}
        </div>

        <article
          dangerouslySetInnerHTML={{ __html: plugin.descriptionFull }}
          className="prose max-w-none dark:prose-invert py-5 lg:prose-l  "
        >
          {}
        </article>
        <div>
          <h2 className="text-3xl mb-10 font-bold leading-none text-gray-900 dark:text-white">
            Configure plugin
          </h2>

          <form id="plugin_form">
            {plugin.params?.map((per) => {
              if (per.type === "text") {
                return (
                  <div className="mb-6" key={per.id}>
                    <label
                      htmlFor={per.id}
                      className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 ${
                        requiredErrors && per.required
                          ? "text-red-700"
                          : "normal"
                      }`}
                    >
                      {per.name}
                      {per.required ? "*" : null}
                    </label>
                    <textarea
                      name={`${per.inputName}`}
                      onChange={changeInputsValue}
                      id={per.id}
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required={per.required ? true : false}
                      value={
                        inputsValue.filter((el) => {
                          return el?.id === per.id;
                        })[0]?.value
                      }
                    ></textarea>
                  </div>
                );
              }
              if (per.type === "str") {
                return (
                  <div className="mb-6" key={per.id}>
                    <label
                      for={per.id}
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {per.name}
                      {per.required ? "*" : null}
                    </label>
                    <input
                      name={`${per.inputName}`}
                      onChange={changeInputsValue}
                      id={per.id}
                      value={
                        inputsValue.filter((el) => {
                          return el?.id === per.id;
                        })[0]?.value
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required={per.required ? true : false}
                      type={per.inputType ? `${per.inputType}` : "text"}
                    />
                    {per.notes ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {per.notes}{" "}
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (per.type === "bool") {
                return (
                  <div className="mb-6" key={per.id}>
                    <label
                      htmlFor={per.id}
                      className="relative inline-flex items-center mb-4 cursor-pointer"
                    >
                      <input
                        onChange={changeCheckboxValue}
                        name={`${per.inputName}`}
                        type="checkbox"
                        checked={per.value}
                        value={
                          inputsValue.filter((el) => {
                            return el?.id === per.id;
                          })[0]?.value
                        }
                        id={per.id}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {per.name}
                        {per.required ? "*" : null}
                      </span>
                    </label>
                  </div>
                );
              }
              if (per.type === "dropdown") {
                return (
                  <div className="mb-6" key={per.id}>
                    <label
                      htmlFor={`inp_ ${per.id}`}
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select an option
                      {per.required ? "*" : null}
                    </label>
                    <select
                      id={per.id}
                      value={
                        inputsValue.filter((el) => {
                          return el?.id === per.id;
                        })[0]?.value
                      }
                      onChange={changeSelectValue}
                      name={`${per.inputName}`}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {per.values.map((val) => {
                        return (
                          <option key={val.label} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              }
            })}

            <div className="flex items-center ">
              <button
                id="save"
                type="button"
                onClick={enablePlugin}
                className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
                  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center"
              >
                {plugin.pluginSettings?.enabled
                  ? "  Save settings"
                  : " Enable Plugin"}
              </button>
              <button
                id="save_notify"
                type="button"
                onClick={enablePlugin}
                className="text-white ml-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg
              text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {plugin.pluginSettings?.enabled
                  ? "Save & Send test notification"
                  : "Enable & Send test notification"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        className={`${
          toastState.isVisible ? "" : "hidden "
        }fixed right-0 bottom-0`}
      >
        <Toast>
          <div
            className={`inline-flex h-8 w-8 shrink-0 shadow-lg items-center justify-center rounded-lg bg-${toastState.type}-100 text-${toastState.type}-500 dark:bg-${toastState.type}-800 dark:text-${toastState.type}-200`}
          >
            {toastState.type === "red" ? (
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
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
            )}
          </div>
          {toastState.content}
          <div className="ml-3 text-sm font-normal"></div>
          <Toast.Toggle />
        </Toast>
      </div>
    </div>
  );
};



export default Plugin;
