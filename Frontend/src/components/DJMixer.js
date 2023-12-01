import React, { useEffect } from "react";
import Navbar from "./NavBar";
import Playback from "./Playback";
import FriendsCard from "./FriendsCard";
import { Link } from "react-router-dom";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";

const DJMixer = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };
  
  const friendContainerStyle = {
    position: "fixed",
    top: 100,
    right: 0,
    width: "20%",
    height: "900",
    backgroundColor: state.colorBackground,
  };
  
  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    height: "auto", // Take up the full height
    width: "70%", // Adjust the width of the button container
    padding: "20px",
    margin: "20px",
    overflow: "auto",
    alignContent: "center"
  };
  
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
    width: "calc(100% - 100px)", // Adjust the width to take up the entire space available
    textAlign: "center", // Center the text horizontally
  };

  useEffect(() => {
    document.title = "PULSE - DJ Mixer";
  }, []);

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={friendContainerStyle}>
          <FriendsCard />
        </div>
        <div style={buttonContainerStyle}>
          <Link
            to="/explorer/ParameterRecommendation"
            style={{ ...buttonStyle, textDecoration: "none" }}
          >
            Parameter Wizard
          </Link>
          <Link
            to="/explorer/SongRecommendation"
            style={{ ...buttonStyle, textDecoration: "none" }}
          >
            Song Recommender
          </Link>
          <Link
            to="/explorer/PlaylistRecommendation"
            style={{ ...buttonStyle, textDecoration: "none" }}
          >
            Recommendations for Playlists
          </Link>
          <Link
            to="/explorer/PlaylistManager"
            style={{ ...buttonStyle, textDecoration: "none" }}
          >
            Playlist Manager
          </Link>
          <Link
            to="/explorer/ArtistExplorer"
            style={{ ...buttonStyle, textDecoration: "none" }}
          >
            Artist Explorer
          </Link>
        </div>
      </div>
      <div className="footer"><Playback /></div>
    </div>
  );
};

export default DJMixer;
