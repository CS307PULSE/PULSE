import React, { useEffect, useState } from "react";

//Popup passing through open and close functions
export default function Popup({ isOpen, onClose, addGraph, graphNames }) {
  //Use states for data to be controlled
  const [graphName, setGraphName] = useState("");
  const [hortAxisTitle, setHortAxisTitle] = useState("");
  const [vertAxisTitle, setVertAxisTitle] = useState("");
  const [graphType, setGraph] = useState("ImageGraph");
  const [validName, setValidName] = useState(false);

  //Use states to selectively disable choices depending on data type
  const [imageGraph, setImageGraph] = useState(true);
  const [timesDataEN, setTimesDataEN] = useState(false);
  const [specTimesDataEN, setSpecTimesDataSelected] = useState(false);
  const [radarData, setRadarData] = useState(false);
  const [followerData, setFollowerData] = useState(false);
  const [multiDataEN, setMultiDataEN] = useState(false);
  const [axisTitlesEN, setAxisTitlesEN] = useState(false);
  const [legendEN, setLegendEN] = useState(false);

  //Data variables
  const [dataSelected, setDataSelected] = useState();
  const [dataOptions, setDataOptions] = useState([
    { value: "bar1", label: "Sample Bar1", visible: true },
    { value: "line1", label: "Sample Line1", visible: true },
    { value: "pie1", label: "Sample pie1", visible: true },
    { value: "pie2", label: "Sample pie2", visible: false },
    {
      value: "numMinutes",
      label: "Number of minutes listened to",
      visible: timesDataEN,
    },
    {
      value: "percentTimes",
      label: "% of music listened to",
      visible: timesDataEN,
    },
    {
      value: "percentTimePeriod",
      label: "Times listened to per time period",
      visible: timesDataEN,
    },
    {
      value: "numTimesSkipped",
      label: "Times listened to or skipped or repeated",
      visible: timesDataEN,
    },
    {
      value: "emotion",
      label: "Emotion of music listened to",
      visible: radarData,
    },
    { value: "followers", label: "Followers", visible: followerData },
    {
      value: "top_songs",
      label: "Top Songs",
      visible: imageGraph,
    },
    {
      value: "top_artists",
      label: "Top Artists",
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

  //Update Data info
  useEffect(() => {
    if (dataSelected === "numMinutes" || dataSelected === "percentTimes") {
      setSpecTimesDataSelected(true);
    } else {
      setSpecTimesDataSelected(false);
    }
  }, [dataSelected]);

  //Update data choices when state changes
  useEffect(() => {
    // Update visibility based on timesDataEN state
    setDataOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value === "numMinutes" ||
        option.value === "percentTimes" ||
        option.value === "percentTimePeriod" ||
        option.value === "numTimesSkipped"
          ? { ...option, visible: timesDataEN }
          : option
      )
    );
  }, [timesDataEN]);

  useEffect(() => {
    // Update visibility based on followerData state
    setDataOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value === "followers"
          ? { ...option, visible: followerData }
          : option
      )
    );
  }, [followerData]);

  useEffect(() => {
    // Update visibility based on radarData state
    setDataOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value === "emotion" ? { ...option, visible: radarData } : option
      )
    );
  }, [radarData]);

  useEffect(() => {
    // Update visibility based on imageGraph state
    setDataOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value.includes("top_") ||
        option.value.includes("recent_") ||
        option.value.includes("saved_") ||
        option.value === "followed_artists"
          ? { ...option, visible: imageGraph }
          : option
      )
    );
  }, [imageGraph]);

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

  const changeHortAxisTitle = (e) => {
    //Replace special characters w/ null
    const regexName = e.target.value.replace(/[^\w\s]/gi, "");
    setHortAxisTitle(regexName);
  };

  const changeVertAxisTitle = (e) => {
    //Replace special characters w/ null
    const regexName = e.target.value.replace(/[^\w\s]/gi, "");
    setVertAxisTitle(regexName);
  };

  const changeGraph = (e) => {
    setImageGraph(false);
    setTimesDataEN(false);
    setMultiDataEN(false);
    setAxisTitlesEN(false);
    setLegendEN(false);
    setRadarData(false);
    setFollowerData(false);
    switch (e.target.value) {
      case "ImageGraph":
        setImageGraph(true);
        break;
      case "VertBar":
      case "HortBar":
      case "Line":
      case "Scatter":
        setMultiDataEN(true);
        setAxisTitlesEN(true);
        setLegendEN(true);
        setTimesDataEN(true);
        setFollowerData(true);
        break;
      case "RadBar":
        setMultiDataEN(true);
        setLegendEN(true);
        break;
      case "Pie":
        setLegendEN(true);
        break;
      case "Bump":
        setAxisTitlesEN(true);
        break;
      case "Radar":
        setRadarData(true);
        break;
      case "Text":
        break;
      default:
    }
    setGraph(e.target.value);
  };

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    //Reset name to avoid issues
    setGraphName("");

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const formJson = {};
    for (let [name, value] of formData) {
      if (formJson[name]) {
        if (!Array.isArray(formJson[name])) {
          formJson[name] = [formJson[name]]; // Convert to array if it's not already
        }
        formJson[name].push(value);
      } else {
        formJson[name] = value;
      }
    }

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
              <option value="VertBar">Vertical Bar</option>
              <option value="HortBar">Horizontal Bar</option>
              <option value="RadBar">Radial Bar</option>
              <option value="Line">Line</option>
              <option value="Pie">Pie</option>
              <option value="Bump">Bump</option>
              <option value="Radar">Radar</option>
              <option value="Scatter">Scatter</option>
              <option value="Calendar">Calendar</option>
              <option value="Text">Text</option>
            </select>
          </div>
          <div>
            Data:{" "}
            <select
              name="data"
              value={dataSelected}
              onChange={(dataName) => setDataSelected(dataName)}
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
            Type of Data:{" "}
            <select name="dataVariation" disabled={!specTimesDataEN}>
              <option value="songs">Songs</option>
              <option value="artists">Artists</option>
              <option value="genres">Genres</option>
              <option value="eras">Eras</option>
            </select>
          </div>
          <div>
            Time:{" "}
            <select name="timeRange" disabled={!timesDataEN && !imageGraph}>
              <option value="all">All Time</option>
              <option value="year" disabled={!timesDataEN}>
                Yearly
              </option>
              <option value="month" disabled={!timesDataEN}>
                Monthly
              </option>
              <option value="6month" disabled={!imageGraph}>
                6 Months
              </option>
              <option value="4week" disabled={!imageGraph}>
                4 Weeks
              </option>
            </select>
          </div>
          <div>
            Theme:{" "}
            <select name="graphTheme" disabled={imageGraph}>
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
              disabled={!axisTitlesEN}
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
              disabled={!axisTitlesEN}
            />
          </div>
          <div>
            Legend Enabled:
            <input name="legendEnabled" type="checkbox" disabled={!legendEN} />
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
