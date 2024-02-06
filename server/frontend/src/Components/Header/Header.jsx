import React from "react";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HHlogo from "../../assets/logo.svg";
// import { Dropdown } from "flowbite-react";
import { apiFetch } from "../../../FetchApi.js";
import ThemeButton from "./ThemeButton";
import { useLocation } from "react-router-dom";
import OutsideHider from "../OutsideAlert/OutsideAlert";
import Settings from "./Settings";

const Header = ({ theme, setTheme }) => {
  const userMenuBtn = useRef(null);
  const logoutMenuBtn = useRef(null);
  const location = useLocation();

  const [setingsIsVisible, setSettingsIsVisible] = useState(false);
  const [usertManageIsVisible, setUsertManageIsVisible] = useState(false);

  const navigate = useNavigate();
  const clickAndNavigate = function (path) {
    navigate(`/${path}`);
    setSettingsIsVisible(false);
    setUsertManageIsVisible(false);
  };

  const logout = async () => {
    const data = await apiFetch({}, "logout");
    if (data && data.status === "successful") {
      clickAndNavigate("login");
      // code ..//
    }
  };

  return (
    <div className="bg-white dark:bg-gray-500">
      <nav className="bg-white sticky top-0 mb-4 w-full shadow-md z-50 min-w-full border-gray-200 px-2 sm:px-4 py-2.5 dark:bg-gray-800">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <a className="flex items-center">
            {/* <img src="/static/logo.svg" className="mr-3 h-6 sm:h-9" alt="HotHost Logo" />  */}
            <div
              className="flex text-xl font-semibold whitespace-nowrap dark:text-white cursor-pointer"
              onClick={() => {
                clickAndNavigate("home");
              }}
            >
              <img className="h-9" src={HHlogo} alt="logo" />
              <span className="my-auto pl-2">HotHost</span>
            </div>
          </a>

          <ThemeButton theme={theme} setTheme={setTheme}></ThemeButton>

          <div className="flex md:order-2">
            {location.pathname === "/login" ? (
              <a
                onClick={() => {
                  clickAndNavigate("login");
                }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Login
              </a>
            ) : (
              <>
                {" "}
                <OutsideHider
                  state={setingsIsVisible}
                  setstate={setSettingsIsVisible}
                >
                  <div
                    onClick={() => {
                      setSettingsIsVisible(!setingsIsVisible);
                    }}
                  >
                    <svg
                      className=" text-gray-700 dark:text-gray-300 h-10 w-10 cursor-pointer hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      data-dropdown-toggle="settingsDropdown"
                      data-dropdown-placement="bottom-end"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                  </div>

                  {setingsIsVisible ? (
                    <Settings
                      clickAndNavigate={clickAndNavigate}
                      setingsIsVisible={setingsIsVisible}
                    ></Settings>
                  ) : null}
                </OutsideHider>
                <OutsideHider
                  state={usertManageIsVisible}
                  setstate={setUsertManageIsVisible}
                >
                  <div
                    ref={logoutMenuBtn}
                    className="px-2"
                    onClick={() => {
                      setUsertManageIsVisible(!usertManageIsVisible);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      id="userManage"
                      className="text-gray-700 dark:text-gray-300 h-10 w-10 cursor-pointer hover:text-gray-600 "
                      data-dropdown-toggle="userManageDropdown"
                      data-dropdown-placement="bottom-end"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {usertManageIsVisible ? (
                    <div
                      id="userManageDropdown"
                      className="absolute inset: 0px 0px auto auto bottom-[-64px]  translate-x-[-50%]  bg-white divide-y divide-gray-100 rounded shadow w-32 dark:bg-gray-700 dark:divide-gray-600  block`"
                    >
                      <div className="py-3">
                        <button
                          onClick={logout}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </OutsideHider>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};
export default Header;
