import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Playback from "./Playback";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import axios from "axios";
import { Link } from "react-router-dom";
import { genreList } from "../theme/Emotions";
import ItemList from "./ItemList";

const ArtistExplorer = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [artists, setArtists] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(-1);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  async function searchForSongs(searchString) {
    setSearchResults("loading");
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/player/search_bar", {query: searchString, criteria: "track"});
    console.log(response.data);
    setSearchResults(response.data);
  }

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
    margin: '5px',
    padding: '0px 10px 0px 10px',
    width: '100%',
    height: "50px",
    fontSize: textSizes.body
  };
  const textFieldContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "10px",
    height: "40px"
  }
  const textFieldStyle = {
      backgroundColor: state.colorBackground,
      border: "1px " + state.colorBorder + " solid",
      borderRadius: "10px",
      height: "20px",
      width: "300px",
      color: state.colorText,
      padding: "10px",
      position: "absolute",
      right: "20px"
  };
  
  const sectionContainerStyle = {
      backgroundColor: hexToRGBA(state.colorBackground, 0.5),
      width: "600px",
      padding: "20px",
      margin: "20px",
      position: "relative",
      overflow: "auto"
  }
  const selectionDisplayStyle = {
    backgroundColor: state.colorBackground,
    width: "100% - 20px",
    margin: "10px",
    display: "flex",
    alignItems: "center",
    overflow: "auto",
    border: "1px solid " + state.colorBorder,
    borderRadius: "5px"
  }
  const imageStyle = {
    width: "40px",
    height: "40px",
    margin: "10px"
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
        <div>
          <div style={sectionContainerStyle}>
            <p style={headerTextStyle}>Add Songs</p>
            {/* <div style={buttonContainerStyle}>
              <input type="text" style={buttonStyle} value={searchString}
                onChange={e => {setSearchString(e.target.value)}}
                onKeyDown={(e) => {if (e.key == 'Enter') {searchForSongs(searchString)}}}></input>
              <button style={{...buttonStyle, width: "30%"}} onClick={() => {searchForSongs(searchString)}}>Search</button>
            </div>
            <ItemList
              data={searchResults}
              buttons={[
                {width: "40px", value: "+", size: "30px",
                  onClick: (item) => {playlistPost("add_track", {song: item.uri, playlist: playlists[selectedPlaylistIndex].id},
                    () => {getPlaylistSongs(playlists[selectedPlaylistIndex].id)})}
                }
              ]}
            /> */}
          </div>
        </div>
        </div>
      </div>
      <div className="footer"><Playback /></div>
    </div>
  );
};

export default ArtistExplorer;
