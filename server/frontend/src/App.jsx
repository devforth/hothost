import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, Suspense } from "react";

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
  const [isAuthorize, setIsAuthorize] = useState("");
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
      
        <Routes>
          <Route path="/" element={<Navigate replace to="/home" />} />
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
      
    </div>
  );
}

export default App;
