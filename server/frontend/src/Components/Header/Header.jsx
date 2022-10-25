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

  const navigate = useNavigate("");
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
              navigate
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
                <div
                  onClick={() => {
                    setSettingsIsVisible(!setingsIsVisible);
                  }}
                >
                  <svg
                    className="my-1 w-6 h-6 text-gray-700 dark:text-gray-300 h-8 w-8 cursor-pointer hover:text-gray-600"
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
                <OutsideHider
                  state={setingsIsVisible}
                  setstate={setSettingsIsVisible}
                >
                  {setingsIsVisible ? (
                    <Settings
                      clickAndNavigate={clickAndNavigate}
                      setingsIsVisible={setingsIsVisible}
                    ></Settings>
                  ) : null}
                </OutsideHider>

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
                <OutsideHider
                  state={usertManageIsVisible}
                  setstate={setUsertManageIsVisible}
                >
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

            {/* <button data-collapse-toggle="mobile-menu-4" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-4" aria-expanded="false">
          <span className="sr-only">Open main menu</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
          <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>  */}
          </div>
        </div>
      </nav>

      {/* <script>
    var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon.classNameList.remove('hidden');
    } else {
        themeToggleDarkIcon.classNameList.remove('hidden');
    }

    var themeToggleBtn = document.getElementById('theme-toggle');

    themeToggleBtn.addEventListener('click', function() {

    // toggle icons inside button
    themeToggleDarkIcon.classNameList.toggle('hidden');
    themeToggleLightIcon.classNameList.toggle('hidden');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classNameList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classNameList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classNameList.contains('dark')) {
            document.documentElement.classNameList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classNameList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
    
    });
  </script> */}
    </div>
  );
};
export default Header;
