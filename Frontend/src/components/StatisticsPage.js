import React from "react";
import "./Stats.css";
import GraphGrid from "./GraphGrid";
import Navbar from "./NavBar";

export default function StatisticsPage() {
  return (
    <div className="App">
      <Navbar />
      <div style={{ padding: "20px" }} />
      <GraphGrid />
    </div>
  );
}
