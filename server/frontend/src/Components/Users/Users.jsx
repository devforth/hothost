import React from "react";
import { useState, useEffect } from "react";
import { getData, apiFetch } from "../../../FetchApi";
import { Spinner } from "flowbite-react";

const Users = () => {
  const [status, setStatus] = useState("fullfield");
  const [addUserDlgVisible, setAddUserDlgVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [addUserError, setaddUserError] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confrimPassword, setConfrimPassword] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      setStatus("pending");
      const data = await getData("getUsers");
      if (!data.error) {
        data && setUsers(data.data);
      } else {
        setIsAuthorize(false);
        navigate("/login");
      }
      setStatus("fullfield");
    };
    fetchData();
  }, []);

  return (
    <>
      <div class="container px-4 mx-auto relative justify-center">
        <div class="text-xs text-gray-700 border-b-2 rounded-t-lg border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <button
            id="triggerCollapse"
            type="button"
            onClick={() => {
              setAddUserDlgVisible(!addUserDlgVisible);
            }}
            class="py-2.5 px-5 mx-4 my-4 text-sm font-medium text-white focus:outline-none bg-green-700 rounded-lg border border-gray-200 hover:bg-green-800 dark:focus:ring-gray-700 dark:bg-green-400 dark:text-gray-800 dark:border-gray-600 dark:hover:bg-green-500"
          >
            + User
          </button>
          <div id="targetCollapse" class={addUserDlgVisible ? "" : "hidden"}>
            <div class="space-y-6 max-w-sm">
              <div class="flex justify-between mx-4">
                <label
                  for="login"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Login
                </label>
                <input
                  type="text"
                  name="username"
                  id="login"
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                  }}
                  class="w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="login"
                  required
                />
              </div>
              <div class="flex justify-between mx-4">
                <label
                  for="password"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  id="password"
                  placeholder="••••••••"
                  class="w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div class="flex justify-between mx-4">
                <label
                  for="confirm_password"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confrimPassword}
                  onChange={(e) => {
                    setConfrimPassword(e.target.value);
                  }}
                  name="confirm_password"
                  id="confirm_password"
                  placeholder="••••••••"
                  class="w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div class="flex justify-end mx-4">
                <button
                  type="button"
                  id="submit"
                  onClick={async () => {
                    const data = await apiFetch(
                      { user: { username: login, password } },
                      "add_user"
                    );
                    if (!data.error) {
                      setUsers(data.data);
                    } else {
                      setaddUserError(data.error);
                    }
                    setLogin("");
                    setPassword("");
                    setConfrimPassword("");
                  }}
                  class="text-white mb-4 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:hover:bg-gray-500 disabled:hover:dark:bg-gray-500 disabled:dark:bg-gray-500 disabled:bg-gray-500"
                  disabled={!login || !password || password !== confrimPassword}
                >
                  Create user
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="relative overflow-x-auto shadow-md rounded-b-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">
                  User
                </th>
                <th scope="col" class="px-6 py-3">
                  Role
                </th>
                <th scope="col" class="px-6 py-3">
                  Created
                </th>
                <th scope="col" class="px-6 py-3">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {status === "fullfield" &&
                users &&
                users.map((user, i) => {
                  return (
                    <tr
                      class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      id={`table-${i}`}
                    >
                      <td
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        {user.username}
                      </td>
                      <td class="px-6 py-4">
                        {user.isNotAdmin ? "admin" : "superadmin"}
                      </td>
                      <td class="px-6 py-4">{user.createdAt}</td>
                      <td class="px-6 py-4 text-right">
                        {user.isNotAdmin && (
                          <button
                            id={user.id}
                            class="font-medium text-red-600 dark:text-red-500 hover:underline"
                            onClick={async (e) => {
                              const data = await apiFetch(
                                { id: e.currentTarget.id },
                                "remove_user"
                              );
                              if (data.data) {
                                setUsers(data.data);
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>{" "}
        {status === "pending" && (
          <div className="flex justify-center  p-7">
            <Spinner size="xl"></Spinner>
          </div>
        )}
      </div>
    </>

    // <script>
    //   const targetEl = document.getElementById("targetCollapse");
    //   const triggerEl = document.getElementById("triggerCollapse");
    //   const password = document.getElementById("password");
    //   const confirm_password = document.getElementById("confirm_password");
    //   const submit = document.getElementById("submit");

    //   const options = {
    //     triggerEl: triggerEl,
    //     onCollapse: () => {},
    //     onExpand: () => {},
    //     onToggle: () => {},
    //   };
    //   const collapse = new Collapse(targetEl, options);

    //   const checkPassword = () => {
    //     if (password.value !== confirm_password.value) {
    //       submit.disabled = true;
    //     } else {
    //       submit.disabled = false;
    //     }
    //   };
    // </script>
  );
};

export default Users;
