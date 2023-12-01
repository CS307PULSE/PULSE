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

  const themeSetting = 0;
  const textSizes = TextSize(1);

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

  // Modify the CSS variable
  if (themeSetting === 1) {
    root.style.setProperty("--graph-text-fill", state.colorText);
    root.style.setProperty("--tooltip-container-background", "#ffffff");
    root.style.setProperty("--light-dark-scheme", "auto");
  } else {
    root.style.setProperty("--graph-text-fill", state.colorText);
    root.style.setProperty("--tooltip-container-background", "#000000");
    root.style.setProperty("--light-dark-scheme", "dark");
  }

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
