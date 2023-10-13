import React from "react";
import "./Stats.css";
import GraphGrid from "./GraphGrid";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors";

const textSizes = TextSize(1); //Obtain text size values
const themeColors = Colors(0); //Obtain color values

// Access the CSS variable
const root = document.documentElement;

document.documentElement.style.setProperty("--graph-text-size", "10px");
document.documentElement.style.setProperty("--title-text-size", "10px");

// Modify the CSS variable
if (true) {
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
  return (
    <div className="App">
      <Navbar />
      <div style={{ padding: "20px" }} />
      <GraphGrid />
      <div style={{ padding: "30px" }} />
      <SongPlayer />
    </div>
  );
}
