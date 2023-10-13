import React, { useState } from "react";

//Popup passing through open and close functions
export default function Popup({ isOpen, onClose, addGraph, graphNames }) {
  //Use states for data to be read from when generating new graph container
  const [graphName, setGraphName] = useState("");
  const [data, setData] = useState("bar1");
  const [graphType, setGraph] = useState("bar");
  const [theme, setTheme] = useState("dark");
  const [validName, setValidName] = useState(false);

  //Use states to selectively disable choices depending on data type
  const [noneData, setNoneData] = useState(false);
  const [barData, setBarData] = useState(false);
  const [lineData, setLineData] = useState(false);
  const [pieData, setPieData] = useState(false);

  if (!isOpen) return null; //Don't do anything when not open

  //Functions to change data vars from input fields
  const changeGraphName = (e) => {
    //Replace special characters w/ null
    const regexName = e.target.value.replace(/[^\w\s]/gi, "");
    if (
      graphNames.some((element) => {
        return element === regexName;
      })
    ) {
      setValidName(false);
    } else {
      setValidName(true);
    }
    setGraphName(regexName);
  };

  const changeData = (e) => {
    const newData = e.target.value;
    setData(newData);
    if (
      newData.includes("top_songs") ||
      newData.includes("top_artists") ||
      newData === "recent_songs" ||
      newData === "saved_songs" ||
      newData === "saved_albums" ||
      newData === "followed_artists" ||
      newData === "saved_playlists"
    ) {
      setNoneData(true);
      setBarData(false);
      setLineData(false);
      setPieData(false);
    } else if (newData === "bar1") {
      setNoneData(false);
      setBarData(true);
      setLineData(false);
      setPieData(false);
    } else if (newData === "line1") {
      setNoneData(false);
      setBarData(false);
      setLineData(true);
      setPieData(false);
    } else if (newData === "pie1" || newData === "pie2") {
      setNoneData(false);
      setBarData(false);
      setLineData(false);
      setPieData(true);
    } else if (newData === "followers") {
      setNoneData(false);
      setBarData(false);
      setLineData(true);
      setPieData(false);
    } else {
      setNoneData(false);
      setBarData(false);
      setLineData(false);
      setPieData(false);
    }
    setGraph("");
  };

  const changeGraph = (e) => {
    setGraph("TopGraph");
  };

  const changeTheme = (e) => {
    if (data.includes("top_songs") || data.includes("top_artists")) {
      setTheme("None");
    } else {
      setTheme(e.target.value);
    }
  };

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    //Reset name to avoid issues
    setGraphName("");

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    let formJson = Object.fromEntries(formData.entries());

    if (validName) {
      onClose();
      console.log("This is graph:");
      console.log(formJson);
      addGraph(formJson);
    } else {
      alert("Invalid graph name! Enter a better name!");
    }
  }

  return (
    <div className="PopupOverlay">
      <div className="PopupContent">
        Add Graph
        <button className="PopupCloseButton" onClick={onClose}>
          X
        </button>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              name="graphName"
              rows={1}
              cols={20}
              className="nameField"
              value={graphName}
              onChange={changeGraphName}
              placeholder="Graph Name"
              required={true}
            />
          </div>
          <div>
            Data:{" "}
            <select name="data" value={data} onChange={changeData}>
              <option value="bar1">Bar1</option>
              <option value="line1">Line1</option>
              <option value="pie1">Pie1</option>
              <option value="pie2">Pie2</option>
              <option value="top_songs_4week">Top Songs of last 4 weeks</option>
              <option value="top_songs_6month">
                Top Songs of last 6 months
              </option>
              <option value="top_songs_all">Top Songs of all time</option>
              <option value="top_artists_4week">
                Top Artists of last 4 weeks
              </option>
              <option value="top_artists_6month">
                Top Artists of last 6 months
              </option>
              <option value="top_artists_all">Top Artists of all time</option>
              <option value="followers">Followers</option>
              <option value="recent_songs">Recent Songs</option>
              <option value="saved_songs">Saved Songs</option>
              <option value="saved_albums">Saved Albums</option>
              <option value="saved_playlists">Saved Playlists</option>
              <option value="followed_artists">Followed Artists</option>
            </select>
          </div>
          <div>
            Graph Type:{" "}
            <select name="graphType" value={graphType} onChange={changeGraph}>
              <option value="TopGraph" disabled={!noneData}></option>
              <option value="Bar" disabled={!barData}>
                Bar
              </option>
              <option value="Line" disabled={!lineData}>
                Line
              </option>
              <option value="Pie" disabled={!pieData}>
                Pie
              </option>
            </select>
          </div>
          <div>
            Theme:{" "}
            <select
              name="graphTheme"
              value={theme}
              onChange={changeTheme}
              disabled={noneData}
            >
              <option value="accent">Accent</option>
              <option value="dark2">Dark2</option>
              <option value="spectral">Spectral</option>
              <option value="category10">Category10</option>
            </select>
          </div>
          <div>
            <button className="TypButton" type="submit">
              Generate Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
