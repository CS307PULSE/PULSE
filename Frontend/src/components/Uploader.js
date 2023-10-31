import React, { useEffect } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";

const themeColors = Colors(0); //Obtain color values
const textSizes = TextSize(1); //Obtain text size values

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

const Uploader = () => {
  useEffect(() => {
    document.title = "PULSE - Uploader";
  }, []);
  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>
      <div>Not implemented yet! Sorry.</div>
    </div>
  );
};

export default Uploader;
