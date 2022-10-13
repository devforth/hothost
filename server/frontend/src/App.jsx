import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getData } from "../FetchApi.js";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createContext } from "react";
import ReactDOM from "react-dom/client";

import Header from "./Components/Header/Header.jsx";
import Home from "./Components/Home/Home.jsx";
import Login from "./Components/Login/Login";
import Settings from "./Components/Settings/Settings";
import Users from "./Components/Users/Users.jsx";

import "./App.css";

function App() {
  //get data from server
  const [isAuthorize, setIsAuthorize] = useState(true);
  const [monitoringData, setMonitoringData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData("getMonitoringData");
      if (!data.error) {
        data && setMonitoringData(data);
      } else {
        setIsAuthorize(false);
        navigate("/login");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      <Header isAuthorize={isAuthorize} />

      <Routes>
        <Route
          path="/"
          element={isAuthorize ? <Home /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/home"
          element={isAuthorize ? <Home /> : <Navigate replace to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </div>
  );
}

export default App;
