import React, { useEffect } from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import FriendsCard from "./FriendsCard";
import { Link } from "react-router-dom";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";

const PlaylistGenerator = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

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
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif",
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
  const sectionContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    width: "600px",
    padding: "20px",
    margin: "20px",
    position: "relative",
    overflow: "auto"
  }
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
        <div style={sectionContainerStyle}>
          <div style={buttonContainerStyle}></div>
        </div>
      </div>
      <div className="footer"><SongPlayer /></div>
    </div>
  );
};

export default PlaylistGenerator;
