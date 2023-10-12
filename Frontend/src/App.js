import "./App.css";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import GuessTheSong from "./components/GuessTheSong";
import GuessTheArtist from "./components/GuessTheArtist";
import GuessTheLyric from "./components/GuessTheLyric";
import Games from "./components/Games";
import Mainpage from "./components/Mainpage";
import StatisticsPage from "./components/StatisticsPage";

import {
  Navigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import axios from "axios";
import DJMixer from "./components/DJMixer";

// for the cache and DB call for fetch
async function fetchDataCache() {
  const response = await axios.get("http://127.0.0.1:5000/", {
    withCredentials: true,
  });
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
        <Route path="game/guess-the-artist" element={<GuessTheArtist />} />
        <Route path="game/guess-the-lyric" element={<GuessTheLyric />} />
        <Route path="/Statistics" element={<StatisticsPage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/DJmixer" element={<DJMixer />} />
        <Route path="friends" />
      </Routes>
    </Router>
  );
}

export default App;
