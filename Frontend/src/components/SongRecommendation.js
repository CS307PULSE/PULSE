import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Playback from "./Playback";
import axios from "axios";
import { ImageGraph } from "./Graphs/ImageGraph";
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";
import ItemList from "./ItemList";
import { playItem, queueItem } from "./Playback";

// eslint-disable-next-line no-unused-vars

async function getRecommendationsFromSong(track) {
  if (track) { return; }
  try {
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/api/explorer/songrec", { track: track.id });
    const data = response.data;
    return data;
  } catch (e) {
    console.log(e);
  }
}

async function sendSearchAndReturn(sendSerach) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "/api/search_bar",
    { query: sendSerach }
  );
  const data = response.data;
  // console.log(response);
  return data;
}

const SongRecommendation = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [receivedSearchData, setReceivedSearchData] = useState(null);
  const [receivedRecData, setReceivedRecData] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [recString, setRecString] = useState("");
  const [selectedSongIndex, setSelectedSongIndex] = useState(-1);
  const [selectedSongName, setSelectedSongName] = useState();

  useEffect(() => {
    document.title = "PULSE - Song Recommendations";
  }, []);

  const getSearch = async () => {
    setReceivedSearchData("loading");
    setSelectedSongIndex(-1);
    // console.log("searching for " + searchString);
    sendSearchAndReturn(searchString).then((data) => {
      if (data !== null && data !== undefined) {
        // console.log(data);
        setReceivedSearchData(data);
      }
    });
  };

  async function updateRecommendations() {
    try {
      if (recString) {
        setReceivedRecData("loading");
        const response = await getRecommendationsFromSong(receivedSearchData[selectedSongIndex]);
        const data = response.data;
        if (data) {
          setReceivedRecData(data);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    try {
      setSelectedSongName(receivedSearchData[selectedSongIndex].name);
    } catch (e) { 
      setSelectedSongName("");
    }
    updateRecommendations();
  }, [selectedSongIndex]);

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };
  const textStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
    margin: "5px"
  };
  const headerTextStyle = {
    color: state.colorText,
    fontFamily: "'Poppins', sans-serif",
    fontSize: textSizes.header3,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal"
  };
  const buttonContainerStyle = {
    display: 'flex',
    alignItems: 'center', // Center buttons horizontally
    marginTop: '5px', // Space between cards and buttons
    width: "100%"
  };
  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: state.colorBorder,
    borderRadius: '10px',
    cursor: 'pointer',
    margin: '5px', // Small space between buttons
    padding: '0px 10px 0px 10px',
    width: '100%',
    height: "50px",
    fontSize: textSizes.body
  };
  
  const sectionContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    width: "600px",
    padding: "20px",
    margin: "20px",
    position: "relative",
    overflow: "auto"
  }
  
  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
          <div style={sectionContainerStyle}>
            <p style={headerTextStyle}>Search Songs</p>
            <div style={buttonContainerStyle}>
              <input type="text" style={buttonStyle} value={searchString}
                onChange={e => {setSearchString(e.target.value)}}
                onKeyDown={(e) => {if (e.key == 'Enter') {getSearch()}}}></input>
              <button style={{...buttonStyle, width: "30%"}} onClick={() => {getSearch()}}>Search</button>
            </div>
            <ItemList
              data={receivedSearchData}
              selectedIndex={selectedSongIndex}
              onClick={setSelectedSongIndex}
            />
          </div>
          <div style={sectionContainerStyle}>
            <p style={headerTextStyle}>Recommendations {selectedSongName ? "based on: " + selectedSongName : ""}</p>
            <ItemList
              data={receivedRecData}
              onClick={(index) => playItem(receivedRecData[index])}
            />
          </div>
        </div>
      </div>
      <div className="footer"><Playback /></div>
    </div>
  );
};

export default SongRecommendation;
