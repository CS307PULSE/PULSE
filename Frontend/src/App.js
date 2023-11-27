import "./App.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { AppContextProvider } from "./components/Context";

import Login from "./components/Login";
import Profile from "./components/Profile";
import GuessTheSong from "./components/GuessTheSong";
import GuessTheArtist from "./components/GuessTheArtist";
import GuessTheLyric from "./components/GuessTheLyric";
import GuessWhoListens from "./components/GuessWhoListens";
import Games from "./components/Games";
import Mainpage from "./components/Mainpage";
import StatisticsPage from "./components/StatisticsPage";
import Friends from "./components/Friends";
import AddFriends from "./components/AddFriends";
import FriendRequests from "./components/FriendRequests";
import SongRecommendation from "./components/SongRecommendation";
import DJMixer from "./components/DJMixer";
import PlaylistManager from "./components/PlaylistManager";
import PlaylistGenerator from "./components/PlaylistGenerator";
import PlaylistRecommendation from "./components/PlaylistRecommendation";
import SongRecommendations from "./components/SongRecommendation";
import ParameterRecommendations from "./components/ParameterRecommendation";
import HeadsUp from "./components/HeadsUp";
import MatchIt from "./components/MatchIt";
import {
  Navigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import ChatBot from "./components/ChatBot";

axios.defaults.baseURL = process.env.REACT_APP_BE_URL;

// for the cache and DB call for fetch
async function fetchDataCache() {
  const response = await axios.get("/boot", {
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
    <AppContextProvider>
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
          <Route path="/profile" element={<Profile />} />
          <Route path="game/guess-the-song" element={<GuessTheSong />} />
          <Route path="game/guess-the-artist" element={<GuessTheArtist />} />
          <Route path="game/guess-the-lyric" element={<GuessTheLyric />} />
          <Route path="game/guess-who-listens" element={<GuessWhoListens />} />
          <Route path="/game/heads-up" element={<HeadsUp />} />
          <Route path="/Statistics" element={<StatisticsPage />} />
          <Route path="/PulseBot" element={<ChatBot />} />
          <Route path="/games" element={<Games />} />
          <Route path="/DJmixer" element={<DJMixer />} />
          <Route
            path="/DJmixer/SongRecommendation"
            element={<SongRecommendations />}
          />
          <Route
            path="/DJmixer/ParameterRecommendation"
            element={<ParameterRecommendations />}
          />
          <Route
            path="/DJmixer/PlaylistRecommendation"
            element={<PlaylistRecommendation />}
          />
          <Route
            path="/DJmixer/PlaylistManager"
            element={<PlaylistManager />}
          />
          <Route path="/friends/addFriends" element={<AddFriends />} />
          <Route path="/friends/friendRequests" element={<FriendRequests />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/match" element={<MatchIt />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
