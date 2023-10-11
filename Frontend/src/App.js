import "./App.css";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import GuessTheSong from "./components/GuessTheSong";
import {
  Navigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Mainpage from "./components/Mainpage";
import StatisticsPage from "./components/StatisticsPage";

import axios from "axios";

//--------------------------------Pending: cookies check and reture userID to backend
// for the cache and DB call for fetch
async function fetchDataCache() {
  const response = await axios.get("http://127.0.0.1:5000/");
  const data = response.data;
  console.log(data);
  return data;
}

function App() {
  const [isLoginClicked, setLoginClicked] = useState(false);
  //check for the cache value and if it already exsists : From backend
  const [isCacheDB, setIsCacheDB] = useState(false);

  //check using backend if the cache has a user value stored in it
  useEffect(() => {
    fetchDataCache().then((data) => {
      if (data === "T") {
        setIsCacheDB(true);
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
            isCacheDB ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginClick={handleLoginClick} />
            )
          }
        />
        <Route path="/dashboard" element={<Mainpage />} />
        <Route path="game/guess-the-song" element={<GuessTheSong />} />
        <Route path="/Statistics" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
