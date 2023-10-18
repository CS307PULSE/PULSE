import React, { useEffect } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";
import axios from "axios";

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
