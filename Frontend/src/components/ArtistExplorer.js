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
import { searchSpotify, playItem } from "./Playback";
import { getImage } from "./ItemList";

const ArtistExplorer = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [selectedArtistIndex, setSelectedArtistIndex] = useState(-1);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setCurrentArtist(searchResults[selectedArtistIndex]);
  }, [selectedArtistIndex]);

  async function searchForArtists(searchString) {
    setSearchResults("loading");
    var data = await searchSpotify(searchString, "artist");
    setSearchResults(data);
    console.log(data);
  }
  
  function renderArtistInfo(artist) {
    if (!artist) {
      return ("");
    } else {
      console.log(artist);
      return (
        <div>
          <img style={imageStyle} src={getImage(artist)}></img>
          <p style={{...headerTextStyle, 
            fontSize: "40px", top: "20px", left: "160px", position: "absolute"
          }}>{artist.name}</p>
          <p style={textStyle}>{"Genres: " + artist.genres.join(', ')}</p>
          <p style={textStyle}>{"Followers: " + artist.followers.total}</p>
          <span style={textStyle}>{"Popularity: "}</span>
          <input type="range" min="0" max="100" value={artist.popularity}></input>
        </div>
      );
    }
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
      width: "calc(100% - 60px)",
      // height: "calc(100% - 100px)",
      padding: "20px",
      margin: "20px",
      position: "relative",
      overflow: "auto"
  }
  const imageStyle = {
    width: "100px",
    height: "100px",
    margin: "10px"
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
        <div style={{width:"400px"}}> {/* Column 1 */}
          <div style={sectionContainerStyle}>
            <p style={headerTextStyle}>Artist Search</p>
            <div style={buttonContainerStyle}>
              <input type="text" style={buttonStyle} value={searchString}
                onChange={e => {setSearchString(e.target.value)}}
                onKeyDown={(e) => {if (e.key == 'Enter') {searchForArtists(searchString)}}}></input>
              <button style={{...buttonStyle, width: "30%"}} onClick={() => {searchForArtists(searchString)}}>Search</button>
            </div>
            <ItemList
              data = {searchResults}
              selectedIndex = {selectedArtistIndex}
              onClick = {(index) => setSelectedArtistIndex(index)}
            />
          </div>
        </div>
        <div style={{width:"calc(100% - 460px)"}}> {/* Column 1 */}
          <div style={sectionContainerStyle}>
            {renderArtistInfo(currentArtist)}
          </div>
        </div>
        </div>
      </div>
      <div className="footer"><Playback /></div>
    </div>
  );
};

export default ArtistExplorer;
