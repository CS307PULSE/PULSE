import React, { useEffect } from "react";
import "./Stats.css";
import GraphGrid from "./GraphGrid";
import Navbar from "./NavBar";
import Playback from "./Playback";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";

export default function StatisticsPage() {
  //eslint-disable-next-line no-unused-vars
  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
    textAlign: "center",
    height: "100%",
  };
  // Access the CSS variable
  const root = document.documentElement;

  document.documentElement.style.setProperty(
    "--graph-text-size",
    textSizes.body
  );
  document.documentElement.style.setProperty(
    "--title-text-size",
    textSizes.header3
  );
  root.style.setProperty(
    "--overlay-background-color",
    hexToRGBA(state.colorBackground, 0.7)
  );
  root.style.setProperty(
    "--container-background",
    hexToRGBA(state.colorBackground, 0.8)
  );
  

  root.style.setProperty("--graph-text-fill", state.colorText);
  root.style.setProperty("--tooltip-container-background", state.backgroundColor);
  root.style.setProperty("--light-dark-scheme", "auto");

  useEffect(() => {
    document.title = "PULSE - Statistics Page";
  }, []);

  return (
    <div className="wrapper">
      <div className="header">
        <Navbar />
      </div>
      <div className="content" style={bodyStyle}>
        <div style={{ padding: "20px" }} />
        <GraphGrid />
      </div>
      <Playback />
    </div>
  );
}
