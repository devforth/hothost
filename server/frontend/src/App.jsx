import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./Components/Header/Header.jsx";
import Home from "./Components/Home/Home.jsx";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <Home />
    </div>
  );
}

export default App;
