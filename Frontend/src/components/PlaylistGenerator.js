import React, { useEffect } from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import FriendsCard from "./FriendsCard";
import { Link } from "react-router-dom";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";

const PlaylistGenerator = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const bodyStyle = {
    backgroundColor: state.colorBackground
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
    justifyContent: "flex-start",
    height: "auto", // Take up the full height
    width: "70%", // Adjust the width of the button container
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
    width: "70%", // Adjust the width to take up the entire space available
    textAlign: "center", // Center the text horizontally
  };

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        
      </div>
      <div className="footer"><SongPlayer /></div>
    </div>
  );
};

export default PlaylistGenerator;
