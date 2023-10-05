import "./App.css";
import { useState, useEffect } from "react";
import Login from "./components/Login";

import { Navigate,  BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Mainpage"

import axios from "axios";

async function fetchData() {
  const response = await axios.get("http://localhost:5000/");
  const data = await response.json();
  return data;
}

function App() {
  const [isLoginClicked, setLoginClicked] = useState(false);
  //check for the cache value and if it already exsists 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  //check using backend if the cache has a user value stored in it 
  useEffect(() => {
    fetchData().then(data => {
      console.log("unicorn")
      if (data === "T") {
        setIsLoggedIn(true);
        console.log(data)
      }
    });
  }, []);

  const handleLoginClick = () => {
    // Perform any login logic here if needed
    // For now, just set the state to true to indicate the button is clicked
    setLoginClicked(true);
  };
  return (
    <Router>
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login onLoginClick={handleLoginClick} />
          )
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </Router>
  );
}

export default App;
