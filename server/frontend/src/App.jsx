import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, Suspense } from "react";
import { getData } from "../FetchApi.js";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createContext } from "react";
import ReactDOM from "react-dom/client";


import Header from "./Components/Header/Header.jsx";
import Home from "./Components/Home/Home.jsx";
import Login from "./Components/Login/Login";
import Settings from "./Components/Settings/Settings";
import Users from "./Components/Users/Users.jsx";
import HttpMonitor from "./Components/HttpMonitor/HttpMonitor";
import Plugins from "./Components/Plugins/Plugins";
import Plugin from "./Components/Plugin/Plugin";

import "./App.css";

function App() {
  //get data from server
  const [isAuthorize, setIsAuthorize] = useState(true);
  const [monitoringData, setMonitoringData] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add(theme);
      document.documentElement.style.background = "rgb(107 114 128)";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.background = "#ffff";
    }
  }, [theme]);

  return (
    <div className="App">
      <Header setTheme={setTheme} theme={theme} />
      <Suspense fallback={<div>Download</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />}>
            <Route path="http-monitor" element={<HttpMonitor />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/plugin" element={<Plugin />}>
            <Route path=":pluginName" element={<Plugin />}></Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
