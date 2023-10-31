import React, { useEffect } from "react";
import Navbar from "./NavBar";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";
import { useAppContext } from "./Context";

const Friends = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const bodyStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    margin: 0,
    padding: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };


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
