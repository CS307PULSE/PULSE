import React, { useState } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import { Link } from "react-router-dom";
import axios from "axios";
import { TopGraph } from "./Graphs.js";

import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";

var textSizeSetting, themeSetting;
try {
  var textSizeResponse = await axios.get(
    "http://127.0.0.1:5000/get_text_size",
    { withCredentials: true }
  );
  textSizeSetting = textSizeResponse.data;
  var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {
    withCredentials: true,
  });
  themeSetting = themeResponse.data;
} catch (e) {
  console.log("Formatting settings fetch failed: " + e);
  textSizeSetting = 1;
  themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const friendContainerStyle = {
  position: "fixed",
  top: 100,
  right: 0,
  width: "20%",
  height: "900",
  backgroundColor: themeColors.background,
};

const buttonStyle = {
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: "20px 40px", // Increase the padding for taller buttons
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: themeColors.text,
  borderRadius: "10px",
  cursor: "pointer",
  margin: "5px",
  width: "100%", // Adjust the width to take up the entire space available
  textAlign: "center", // Center the text horizontally
};

const searchContainerStyle = {
  display: "flex",
  marginLeft: "30px",
  // justifyContent: 'center',
  marginBottom: "20px",
};

const searchInputStyle = {
  padding: "8px",
  width: "75%",
  display: "flex-grow",
};

async function sendAndFetchSongReqs(sentTrack) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/djmixer/songrec",
    { track: sentTrack }
  );
  const data = response.data;
  console.log(response);
  return data;
}

async function sendSearchAndReturn(sendSerach) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/search_bar",
    { query: sendSerach }
  );
  const data = response.data;
  console.log("Got");
  console.log(response);
  return data;
}

const SongRecommendation = () => {
  const [recievedSearchData, setRecievedSearchData] = useState();
  const [recievedRecData, setRecievedRecData] = useState();
  const [searchValue, setSearchValue] = useState();
  const [searchRecVal, setSearchRecVal] = useState();

  function songRecs(recievedSongs) {
    console.log(recievedSongs);
    if (recievedSongs !== undefined) {
      return <TopGraph data={recievedSongs} dataName={"top_song"} />;
    } else {
      return <p>Send me search query</p>;
    }
  }

  const getSearch = async () => {
    if (searchValue !== null && searchValue !== undefined) {
      console.log("searching for " + searchValue);
      sendSearchAndReturn(searchValue).then((data) => {
        if (data !== null && data !== undefined) {
          setRecievedSearchData(data);
        }
      });
    } else {
      alert("Please enter value in search bar before getting recommendations!");
    }
  };

  const getRecommendations = async () => {
    if (searchRecVal !== null && searchRecVal !== undefined) {
      console.log("searching for " + searchRecVal);
      sendAndFetchSongReqs(searchRecVal).then((data) => {
        if (data !== null && data !== undefined) {
          setRecievedRecData(data);
        }
      });
    } else {
      alert("Please enter value in search bar before getting recommendations!");
    }
  };

  const changeSearchValue = (e) => {
    setSearchValue(e.target.value);
  };

  const changeRecVal = (e) => {
    setSearchRecVal(e.target.value);
  };

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search..."
          style={searchInputStyle}
          value={searchRecVal}
          onChange={changeRecVal}
        />
        <button
          style={{ ...buttonStyle, textDecoration: "none" }}
          onClick={() => getRecommendations()}
        >
          Get Recommendations
        </button>
      </div>
      {songRecs(recievedRecData)}

      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search..."
          style={searchInputStyle}
          value={searchValue}
          onChange={changeSearchValue}
        />
        <button
          style={{ ...buttonStyle, textDecoration: "none" }}
          onClick={() => getSearch()}
        >
          Search
        </button>
      </div>
      {songRecs(recievedSearchData)}

    </div>
  );
};

export default SongRecommendation;
