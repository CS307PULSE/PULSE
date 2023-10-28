import React, { useState } from "react";

//Popup passing through open and close functions
export default function Popup({ isOpen, onClose, addGraph, graphNames }) {
  //Use states for data to be read from when generating new graph container
  const [graphName, setGraphName] = useState("");
  const [data, setData] = useState(["top_songs_4week"]);
  const [graphType, setGraph] = useState("ImageGraph");
  const [theme, setTheme] = useState("dark");
  const [validName, setValidName] = useState(false);
  const [hortAxisTitle, changeHortAxisTitle] = useState("");
  const [vertAxisTitle, changeVertAxisTitle] = useState("");

  //Use states to selectively disable choices depending on data type
  const [imageGraph, setimageGraph] = useState(true);
  const [barData, setBarData] = useState(false);
  const [lineData, setLineData] = useState(false);
  const [pieData, setPieData] = useState(false);
  const [multiData, setMultiData] = useState(false);

  //Data variables
  const [dataOptions, setDataOptions] = useState([
    { value: "bar1", label: "Sample Bar1", visible: true },
    { value: "line1", label: "Sample Line1", visible: true },
    { value: "pie1", label: "Sample pie1", visible: true },
    { value: "pie2", label: "Sample pie2", visible: true },
    { value: "followers", label: "Followers", visible: true },
    {
      value: "top_songs_4week",
      label: "Top Songs of last 4 weeks",
      visible: imageGraph,
    },
    {
      value: "top_songs_6month",
      label: "Top Songs of last 6 months",
      visible: imageGraph,
    },
    {
      value: "top_songs_all",
      label: "Top Songs of all time",
      visible: imageGraph,
    },
    {
      value: "top_artists_4week",
      label: "Top Artists of last 4 weeks",
      visible: imageGraph,
    },
    {
      value: "top_artists_6month",
      label: "Top Artists of last 6 months",
      visible: imageGraph,
    },
    {
      value: "top_artists_all",
      label: "Top Artists of all time",
      visible: imageGraph,
    },
    { value: "recent_songs", label: "Recent Songs", visible: imageGraph },
    { value: "saved_songs", label: "Saved Songs", visible: imageGraph },
    { value: "saved_albums", label: "Saved Albums", visible: imageGraph },
    { value: "saved_playlists", label: "Saved Playlists", visible: imageGraph },
    {
      value: "followed_artists",
      label: "Followed Artists",
      visible: imageGraph,
    },
  ]);

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

  const changeGraph = (e) => {
    if (e.target.value === "ImageGraph") {
      setimageGraph(true);
    } else {
      setimageGraph(false);
    }
    setGraph(e.target.value);
  };

  const changeData = (e) => {
    const newData = e.target.value;
    setData(newData);
    setGraph("");
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
            Graph Type:{" "}
            <select name="graphType" value={graphType} onChange={changeGraph}>
              <option value="ImageGraph">Images</option>
              <option value="vertBar">Vertical Bar</option>
              <option value="hortBar">Horizontal Bar</option>
              <option value="radBar">Radial Bar</option>
              <option value="Line">Line</option>
              <option value="Pie">Pie</option>
              <option value="Bump">Bump</option>
              <option value="Radar">Radar</option>
              <option value="Scatter">Scatter</option>
              <option value="Text">Text</option>
            </select>
          </div>
          <div>
            Data:{" "}
            <select
              name="data"
              value={data}
              onChange={changeData}
              multiple={multiData}
            >
              {dataOptions.map((option) =>
                option.visible ? (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ) : null
              )}
            </select>
          </div>
          <div>
            Theme:{" "}
            <select
              name="graphTheme"
              value={theme}
              onChange={changeTheme}
              disabled={imageGraph}
            >
              <option value="accent">Accent</option>
              <option value="dark2">Dark2</option>
              <option value="spectral">Spectral</option>
              <option value="category10">Category10</option>
            </select>
          </div>
          <div>
            Horizontal Axis Title:
            <input
              name="hortAxisTitle"
              type="input"
              rows={1}
              cols={20}
              className="nameField"
              value={hortAxisTitle}
              onChange={changeHortAxisTitle}
              placeholder="Horizontal Axis Name"
              disabled={imageGraph}
            />
          </div>
          <div>
            Vertical Axis Title:
            <input
              name="vertAxisTitle"
              type="input"
              rows={1}
              cols={20}
              className="nameField"
              value={vertAxisTitle}
              onChange={changeVertAxisTitle}
              placeholder="Vertical Axis Name"
              disabled={imageGraph}
            />
          </div>
          <div>
            Legend Enabled:
            <input name="legendEnabled" type="checkbox" disabled={imageGraph} />
          </div>
          <div>
            Link Click Action:{" "}
            <select name="clickAction" disabled={!imageGraph}>
              <option value="playMusic">Play Music</option>
              <option value="spotifyPage">Link to Spotify Page</option>
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
