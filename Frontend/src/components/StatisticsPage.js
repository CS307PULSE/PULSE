import React from "react";
import GraphGrid from "./GraphGrid";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";

import "./Stats.css";

export default function StatisticsPage() {
  return (
    <div className="App">
      <Navbar />
      <div style={{ padding: "20px" }} />
      <GraphGrid />
      <SongPlayer />
    </div>
  );
}
