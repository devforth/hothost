import React from "react";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../FetchApi";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inputsError, setInputsError] = useState(false);
  let navigate = useNavigate();
  function goToHome() {
    navigate("/home");
  }

  const loginAction = async () => {
    const data = await apiFetch({ username, password }, "login");
    if (data && data.status !== "successful") {
      setInputsError(true);
    } else {
      goToHome();
    }
  };

  return (
    <div class="relative min-h-screen flex flex-col justify-center overflow-hidden sm:py-12">
      <div class="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10 dark:bg-gray-800 dark:border-gray-700">
        <div class="mb-6">
          <label
            for="username"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Username
          </label>
          <input
            name="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setInputsError(false);
            }}
            type="text"
            id="username"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setInputsError(false);
            }}
            id="password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        {inputsError && (
          <div class="flex justify-center">
            <div class="block mb-2 text-base font-medium text-red-700 dark:text-red-500"></div>
          </div>
        )}

        <div class="flex items-center justify-center">
          <button
            type="Button"
            onClick={loginAction}
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
