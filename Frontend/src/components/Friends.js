import React, { useEffect } from "react";
import Navbar from "./NavBar";
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

const Friends = () => {
  useEffect(() => {
    document.title = "PULSE - Friends";
  }, []);

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div>Not implemented yet! Sorry.</div>
    </div>
  );
};

export default Friends;