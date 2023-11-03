import React, { useEffect } from "react";
import "./Stats.css";
import GraphGrid from "./GraphGrid";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";

// Access the CSS variable
const root = document.documentElement;

const themeSetting = 0;
const textSizes = TextSize(1);

document.documentElement.style.setProperty("--graph-text-size", textSizes.body);
document.documentElement.style.setProperty(
  "--title-text-size",
  textSizes.header3
);

// Modify the CSS variable
if (themeSetting === 1) {
  root.style.setProperty("--container-background", "#f5f5f5");
  root.style.setProperty("--graph-text-fill", "#333333");
  root.style.setProperty("--tooltip-container-background", "#ffffff");
  root.style.setProperty("--light-dark-scheme", "auto");
} else {
  root.style.setProperty("--container-background", "#888888");
  root.style.setProperty("--graph-text-fill", "#ffffff");
  root.style.setProperty("--tooltip-container-background", "#000000");
  root.style.setProperty("--light-dark-scheme", "dark");
}

export default function StatisticsPage() {
  const { state, dispatch } = useAppContext();
  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
    textAlign: "center",
  };

  useEffect(() => {
    document.title = "PULSE - Statistics Page";
  }, []);

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={{ padding: "20px" }} />
      <GraphGrid />
      <div style={{ padding: "30px" }} />
      <SongPlayer />
    </div>
  );
}
