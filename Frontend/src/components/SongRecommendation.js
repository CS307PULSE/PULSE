import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import axios from "axios";
import { ImageGraph } from "./Graphs/ImageGraph";
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";

// eslint-disable-next-line no-unused-vars

async function sendAndFetchSongReqs(sentTrack) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "/djmixer/songrec",
    { track: sentTrack }
  );
  const data = response.data;
  return data;
}

async function sendSearchAndReturn(sendSerach) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "/search_bar",
    { query: sendSerach }
  );
  const data = response.data;
  console.log(response);
  return data;
}

const SongRecommendation = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [recievedSearchData, setRecievedSearchData] = useState();
  const [recievedRecData, setRecievedRecData] = useState();
  const [searchValue, setSearchValue] = useState();
  const [searchRecVal, setSearchRecVal] = useState();

  useEffect(() => {
    document.title = "PULSE - Song Recommendations";
  }, []);

  function songRecs(recievedSongs) {
    if (recievedSongs !== undefined) {
      return <ImageGraph data={recievedSongs} dataName={"top_song"} />;
    } else {
      return <p></p>;
    }
  }

  const getSearch = async () => {
    if (searchValue !== null && searchValue !== undefined) {
      console.log("searching for " + searchValue);
      sendSearchAndReturn(searchValue).then((data) => {
        if (data !== null && data !== undefined) {
          console.log(data);
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

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };
  
  /*const friendContainerStyle = {
    position: "fixed",
    top: 100,
    right: 0,
    width: "20%",
    height: "900",
    backgroundColor: themeColors.background,
  };*/
  
  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    padding: "20px 40px", // Increase the padding for taller buttons
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.colorBorder,
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

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={searchContainerStyle}>
          <input type="text" placeholder="Search..." style={searchInputStyle} value={searchRecVal} onChange={changeRecVal}/>
          <button style={{ ...buttonStyle, textDecoration: "none" }} onClick={() => getRecommendations()}> Get Recommendations </button>
        </div>
        {songRecs(recievedRecData)}
        <div style={searchContainerStyle}>
          <input type="text" placeholder="Search..." style={searchInputStyle} value={searchValue} onChange={changeSearchValue}/>
          <button style={{ ...buttonStyle, textDecoration: "none" }} onClick={() => getSearch()}>Search</button>
        </div>
        {songRecs(recievedSearchData)}
      </div>
      <div className="footer"><SongPlayer /></div>
    </div>
  );
};

export default SongRecommendation;
