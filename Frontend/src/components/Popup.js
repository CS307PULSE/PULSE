import React, { useEffect, useState } from "react";
import axios from "axios";

async function fetchFriends() {
  const response = await axios.get("/friends/get_friends", {
    withCredentials: true,
  });
  const data = response.data;
  console.log(response);
  return data;
}

//Popup passing through open and close functions
export default function Popup({
  isOpen,
  onClose,
  addGraph,
  graphNames,
  advancedDataAvailable = true,
}) {
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
  const [bumpData, setBumpData] = useState(false);
  const [multiDataEN, setMultiDataEN] = useState(false);
  const [axisTitlesEN, setAxisTitlesEN] = useState(false);
  const [legendEN, setLegendEN] = useState(false);
  const [disabledThemes, setDisableTheme] = useState(false);
  const [pieData, setPieData] = useState(false);
  const [barData, setBarData] = useState(false);
  const [lineData, setLineData] = useState(false);
  const [timesField, setTimesField] = useState(false);
  const [friendsAvailable, setFriendsAvailable] = useState(false);
  const [wantFriendData, setWantFriendData] = useState(false);
  const [defaultFriend, setDefaultFriend] = useState();
  // eslint-disable-next-line no-unused-vars
  const [advancedData, setAdvancedData] = useState(false);

  //Data variables
  const [friends, setFriends] = useState();
  const [dataSelected, setDataSelected] = useState();
  const [dataOptions, setDataOptions] = useState([
    { value: "bar1", label: "Sample Data1", visible: true },
    { value: "line1", label: "Sample Data1", visible: true },
    { value: "pie1", label: "Sample Data1", visible: true },
    { value: "pie2", label: "Sample Data2", visible: false },
    {
      value: "numMinutes",
      label: "Number of minutes listened to",
      visible: timesDataEN,
    },
    {
      value: "numStreams",
      label: "Number of times listened to",
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
      label: "Times skipped",
      visible: timesDataEN,
    },
    {
      value: "emotion",
      label: "Emotion of music listened to",
      visible: radarData,
    },
    {
      value: "emotion",
      label: "Emotion of all music listened to",
      visible: radarData,
    },
    { value: "followers", label: "Followers", visible: followerData },
    {
      value: "top_songs",
      label: "Top Songs",
      visible: imageGraph || bumpData,
    },
    {
      value: "top_artists",
      label: "Top Artists",
      visible: imageGraph || bumpData,
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

  //Update friends
  useEffect(() => {
    fetchFriends()
      .then((result) => {
        setDefaultFriend(result[0].spotify_id);
        setFriendsAvailable(true);
        setFriends(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  //Update Data info
  useEffect(() => {
    if (
      dataSelected === "numMinutes" ||
      dataSelected === "percentTimes" ||
      dataSelected === "numStreams"
    ) {
      setSpecTimesDataSelected(true);
      setTimesField(true);
      setAdvancedData(true);
    } else if (
      dataSelected === "percentTimePeriod" ||
      dataSelected === "numTimesSkipped"
    ) {
      setSpecTimesDataSelected(false);
      setTimesField(true);
      setAdvancedData(true);
    } else {
      setSpecTimesDataSelected(false);
      setTimesField(false);
      setAdvancedData(false);
    }
    if (imageGraph) {
      setTimesField(true);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSelected]);

  //Update data choices when state changes
  useEffect(() => {
    // Update visibility based on timesDataEN state
    setDataOptions((prevOptions) =>
      prevOptions.map((option) => {
        if (
          option.value === "numMinutes" ||
          option.value === "numStreams" ||
          option.value === "percentTimes" ||
          option.value === "percentTimePeriod" ||
          option.value === "numTimesSkipped"
        ) {
          if (advancedDataAvailable) {
            return { ...option, visible: timesDataEN };
          } else {
            return { ...option, visible: false };
          }
        } else if (option.value === "followers") {
          return { ...option, visible: followerData };
        } else if (option.value.includes("emotion")) {
          return { ...option, visible: radarData };
        } else if (option.value.includes("top_")) {
          return { ...option, visible: bumpData || imageGraph };
        } else if (
          option.value.includes("recent_") ||
          option.value.includes("saved_") ||
          option.value === "followed_artists"
        ) {
          return { ...option, visible: imageGraph };
        } else if (option.value.includes("pie")) {
          return { ...option, visible: pieData };
        } else if (option.value.includes("line")) {
          return { ...option, visible: lineData };
        } else if (option.value.includes("bar")) {
          return { ...option, visible: barData };
        } else {
          return option;
        }
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timesDataEN,
    followerData,
    radarData,
    bumpData,
    imageGraph,
    pieData,
    lineData,
    barData,
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
    setDisableTheme(false);
    setImageGraph(false);
    setTimesDataEN(false);
    setMultiDataEN(false);
    setAxisTitlesEN(false);
    setLegendEN(false);
    setRadarData(false);
    setFollowerData(false);
    setBumpData(false);
    setPieData(false);
    setBarData(false);
    setLineData(false);
    switch (e.target.value) {
      case "ImageGraph":
      case "Text":
        setImageGraph(true);
        setDisableTheme(true);
        break;
      case "VertBar":
      case "HortBar":
      case "Line":
      case "Scatter":
        if (e.target.value.includes("Bar")) {
          setBarData(true);
          setTimesDataEN(true);
        } else {
          setLineData(true);
          setMultiDataEN(true);
          setTimesDataEN(true);
          setFollowerData(true);
        }
        setAxisTitlesEN(true);
        setLegendEN(true);
        break;
      case "RadBar":
        setMultiDataEN(true);
        setLineData(true);
        setTimesDataEN(true);
        setFollowerData(true);
        setLegendEN(true);
        break;
      case "Pie":
        setLegendEN(true);
        setPieData(true);
        setTimesDataEN(true);
        break;
      case "Bump":
        setBumpData(true);
        setAxisTitlesEN(true);
        break;
      case "Radar":
        setRadarData(true);
        break;

      case "Calendar":
        setFollowerData(true);
        setDisableTheme(true);
        break;
      default:
        break;
    }
    setGraph(e.target.value);
    setDataSelected();
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
    //Converts to JSON object
    for (let [name, value] of formData) {
      //If item exists already - then add to array
      if (formJson[name]) {
        if (!Array.isArray(formJson[name])) {
          formJson[name] = [formJson[name]]; // Convert to array if it's not already
        }
        formJson[name].push(value);
      } else {
        formJson[name] = value;
      }
    }

    //Set dataVariation to song if below data
    if (formJson.data === "numTimesSkipped") {
      formJson.dataVariation = "Tracks";
    }
    if (formJson.friendID !== undefined) {
      const friendIndex = friends.findIndex((element, index) => {
        return element.spotify_id === formJson.friendID;
      });
      formJson.friendName = friends[friendIndex].name;
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

  if (friends === undefined) {
    return (
      <div className="PopupOverlay">
        <div className="PopupContent">Loading data</div>
      </div>
    );
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
              onChange={(e) => setDataSelected(e.target.value)}
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
              <option value="Tracks">Songs</option>
              <option value="Artists">Artists</option>
              <option value="Genres">Genres</option>
              <option value="Eras">Eras</option>
              <option value="all">All</option>
            </select>
          </div>
          <div>
            Time:{" "}
            <select name="timeRange" disabled={!timesField}>
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
            <select name="graphTheme" disabled={disabledThemes}>
              <option value="nivo">Default</option>
              <option value="category10">Category10</option>
              <option value="accent">Accent</option>
              <option value="dark2">Dark</option>
              <option value="paired">Paired</option>
              <option value="pastel1">Pastel #1</option>
              <option value="pastel2">Pastel #2</option>
              <option value="set1">Set #1</option>
              <option value="set2">Set #2</option>
              <option value="set3">Set #3</option>
              <option value="blues">Blues</option>
              <option value="greens">Greens</option>
              <option value="greys">Greys</option>
              <option value="oranges">Oranges</option>
              <option value="purples">Purples</option>
              <option value="reds">Reds</option>
              <option value="greys">Greys</option>
              <option value="brown_blueGreen">Brown to Blue-Green</option>
              <option value="purpleRed_green">Purple to Green</option>
              <option value="pink_yellowGreen">Pink to Green</option>
              <option value="purple_orange">Purple to Orange</option>
              <option value="red_blue">Red to Blue</option>
              <option value="red_grey">Red to Grey</option>
              <option value="red_yellow_blue">Red to Yellow to Blue</option>
              <option value="red_yellow_green">Red to Yellow to Green</option>
              <option value="spectral">Full spectrum</option>
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
            Display Friend's Data? :
            <input
              name="friendDataOn"
              type="checkbox"
              checked={wantFriendData}
              onChange={(e) => {
                setWantFriendData(e.target.checked);
              }}
              disabled={!friendsAvailable}
            />
          </div>
          <div>
            Which friend?:
            <select
              name="friendID"
              defaultValue={defaultFriend}
              disabled={!wantFriendData}
            >
              {friendsAvailable
                ? friends.map((friend) => (
                    <option key={friend.spotify_id} value={friend.spotify_id}>
                      {friend.name}
                    </option>
                  ))
                : null}
            </select>
          </div>
          <div>
            Display both own data and friend's data? :
            <input
              name="bothFriendAndOwnData"
              type="checkbox"
              disabled={!multiDataEN || !wantFriendData}
            />
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
