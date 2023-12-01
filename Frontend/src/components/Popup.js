import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  line1,
  bar1,
  pie1,
  calendar1,
  bump1,
  radar1Data,
  radar1Keys,
} from "./Graphs/Graphs.js";
import BarGraph from "./Graphs/BarGraph";
import LineGraph from "./Graphs/LineGraph";
import PieGraph from "./Graphs/PieGraph";
import BumpGraph from "./Graphs/BumpGraph";
import ImageGraph from "./Graphs/ImageGraph";
import CalendarGraph from "./Graphs/CalendarGraph";
import ScatterGraph from "./Graphs/ScatterGraph";
import RadialBarGraph from "./Graphs/RadialBarGraph";
import RadarGraph from "./Graphs/RadarGraph.js";
import TextGraph from "./Graphs/TextGraph.js";
import { tempBasicData } from "./TempData/BasicStats.js";

async function fetchFriends() {
  const response = await axios.get("/api/friends/get_friends", {
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
  const [previewData, setPreviewData] = useState(undefined);
  const [dataVariation, setDataVariation] = useState("Track");

  //Use states to selectively disable choices depending on data type
  const [imageGraph, setImageGraph] = useState(true);
  const [timeRangeImageGraph, setTimeRangeImageGraph] = useState(true);
  const [timesDataEN, setTimesDataEN] = useState(false);
  const [specTimesDataEN, setSpecTimesDataSelected] = useState(false);
  const [radarData, setRadarData] = useState(false);
  const [followerData, setFollowerData] = useState(false);
  const [bumpData, setBumpData] = useState(false);
  const [multiDataEN, setMultiDataEN] = useState(false);
  const [axisTitlesEN, setAxisTitlesEN] = useState(false);
  const [legendEN, setLegendEN] = useState(false);
  const [disabledThemes, setDisableTheme] = useState(true);
  const [pieData, setPieData] = useState(false);
  const [barData, setBarData] = useState(false);
  const [lineData, setLineData] = useState(false);
  const [timesField, setTimesField] = useState(false);
  const [validFriendData, setValidFriendData] = useState(true);
  const [friendsAvailable, setFriendsAvailable] = useState(false);
  const [wantFriendData, setWantFriendData] = useState(false);
  const [defaultFriend, setDefaultFriend] = useState();
  const [changedData, setChangedData] = useState(false);
  const [timeRangeData, setTimeRangeData] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [advancedData, setAdvancedData] = useState(false);

  //Data variables
  const [friends, setFriends] = useState();
  const [dataSelected, setDataSelected] = useState();
  const [dataOptions, setDataOptions] = useState([
    //{ value: "bar1", label: "Sample Data1", visible: true },
    //{ value: "line1", label: "Sample Data1", visible: true },
    //{ value: "pie1", label: "Sample Data1", visible: true },
    //{ value: "pie2", label: "Sample Data2", visible: false },
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
      label: "% of item listened to on average",
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
      label: "Emotion of chosen music",
      visible: radarData,
    },
    {
      value: "emotionData",
      label: "Emotion of selected music listened to",
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
        if (result.length === 0) {
          setFriendsAvailable(false);
          setFriends(result);
          return;
        }
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
    if (dataSelected === undefined) {
      return;
    }
    if (
      dataSelected === "numMinutes" ||
      dataSelected === "percentTimes" ||
      dataSelected === "numStreams"
    ) {
      setSpecTimesDataSelected(true);
      setTimesField(true);
      setAdvancedData(true);
      setTimeRangeData(true);
    } else if (
      dataSelected === "percentTimePeriod" ||
      dataSelected === "numTimesSkipped"
    ) {
      setSpecTimesDataSelected(false);
      setTimesField(true);
      setAdvancedData(true);
      setTimeRangeData(true);
    } else if (dataSelected === "followers") {
      setTimeRangeData(true);
    } else {
      setSpecTimesDataSelected(false);
      setTimesField(false);
      setAdvancedData(false);
    }
    if (imageGraph) {
      if (
        dataSelected === "saved_songs" ||
        dataSelected === "saved_albums" ||
        dataSelected === "saved_playlists" ||
        dataSelected === "followed_artists"
      ) {
        setTimeRangeImageGraph(false);
      } else {
        setTimeRangeImageGraph(true);
      }
    } else {
      setTimeRangeImageGraph(false);
    }
    if (
      dataSelected.includes("1") ||
      dataSelected.includes("2") ||
      dataSelected.includes("emotion")
    ) {
      setValidFriendData(false);
      setWantFriendData(false);
    } else {
      setValidFriendData(true);
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
    setChangedData(true);
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

  const displayPreview = () => {
    if (previewData !== undefined) {
      return (
        <div className="PopupContent column previewContainer">
          <p className="previewHeader">Preview Graph (sample data used)</p>
          {previewData.graphType === "VertBar" ||
          previewData.graphType === "HortBar" ? (
            <BarGraph
              graphName={previewData.graphName}
              data={bar1}
              dataName={"bar1"}
              graphKeys={["degrees"]}
              graphIndexBy={"day"}
              graphTheme={previewData.graphTheme}
              hortAxisTitle={previewData.hortAxisTitle}
              vertAxisTitle={previewData.vertAxisTitle}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "Line" ? (
            <LineGraph
              graphName={previewData.graphName}
              data={line1}
              dataName={"line1"}
              graphTheme={previewData.graphTheme}
              hortAxisTitle={previewData.hortAxisTitle}
              vertAxisTitle={previewData.vertAxisTitle}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "Pie" ? (
            <PieGraph
              graphName={previewData.graphName}
              data={pie1}
              dataName={"pie1"}
              graphTheme={previewData.graphTheme}
              hortAxisTitle={previewData.hortAxisTitle}
              vertAxisTitle={previewData.vertAxisTitle}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "ImageGraph" ? (
            <ImageGraph
              graphName={previewData.graphName}
              data={tempBasicData.top_songs[2]}
              dataName={"top_song"}
              dataVariation={previewData.dataVariation}
              clickAction={previewData.clickAction}
            />
          ) : previewData.graphType === "Bump" ? (
            <BumpGraph
              graphName={previewData.graphName}
              data={bump1}
              dataName={"bump1"}
              graphTheme={previewData.graphTheme}
              hortAxisTitle={previewData.hortAxisTitle}
              vertAxisTitle={previewData.vertAxisTitle}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "Calendar" ? (
            <CalendarGraph
              graphName={previewData.graphName}
              data={calendar1}
              dataName={"calendar1"}
              graphTheme={previewData.graphTheme}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "Scatter" ? (
            <ScatterGraph
              graphName={previewData.graphName}
              data={line1}
              dataName={"line1"}
              graphTheme={previewData.graphTheme}
              hortAxisTitle={previewData.hortAxisTitle}
              vertAxisTitle={previewData.vertAxisTitle}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "RadBar" ? (
            <RadialBarGraph
              graphName={previewData.graphName}
              data={line1}
              dataName={"line1"}
              graphTheme={previewData.graphTheme}
              hortAxisTitle={previewData.hortAxisTitle}
              vertAxisTitle={previewData.vertAxisTitle}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "Radar" ? (
            <RadarGraph
              graphName={previewData.graphName}
              data={radar1Data}
              keys={radar1Keys}
              dataName={"radar1"}
              graphTheme={previewData.graphTheme}
              legendEnabled={previewData.legendEnabled}
              graphType={previewData.graphType}
            />
          ) : previewData.graphType === "Text" ? (
            <TextGraph
              graphName={previewData.graphName}
              data={tempBasicData.top_songs[2]}
              dataName={"top_song"}
              dataVariation={previewData.dataVariation}
              clickAction={previewData.clickAction}
            />
          ) : (
            <p> Invalid Graph Type</p>
          )}
        </div>
      );
    } else {
      return <></>;
    }
  };

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
    if (formJson.timeFrom !== undefined && formJson.timeTo !== undefined) {
      if (new Date(formJson.timeTo) < new Date(formJson.timeFrom)) {
        alert("Invalid time range - time to cannot be later than time from!");
        return;
      }
    }

    if (formJson.preview) {
      console.log("This is graph preview:");
      console.log(formJson);
      setPreviewData(formJson);
      return; //End early
    }

    //Reset name to avoid issues
    setGraphName("");

    //Set dataVariation to song if below data
    if (
      formJson.data === "numTimesSkipped" ||
      formJson.data.includes("emotion")
    ) {
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
      setPreviewData(undefined);
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
        <button
          className="PopupCloseButton"
          onClick={() => {
            onClose();
            setPreviewData(undefined);
          }}
        >
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
              <option value="VertBar" disabled={!advancedDataAvailable}>
                Vertical Bar
              </option>
              <option value="HortBar" disabled={!advancedDataAvailable}>
                Horizontal Bar
              </option>
              <option value="RadBar">Radial Bar</option>
              <option value="Line">Line</option>
              <option value="Pie" disabled={!advancedDataAvailable}>
                Pie
              </option>
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
              {dataOptions
                .filter((option) => option.visible)
                .map((item, index) => {
                  if (changedData) {
                    setDataSelected(item.value);
                    setChangedData(false);
                  }
                  return (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  );
                })}
            </select>
          </div>
          {specTimesDataEN ? (
            <div>
              Type of Data:{" "}
              <select
                name="dataVariation"
                value={dataVariation}
                onChange={(e) => {
                  setDataVariation(e.target.value);
                }}
                disabled={!specTimesDataEN}
              >
                <option value="Tracks">Songs</option>
                <option value="Artists">Artists</option>
                <option value="Genres">Genres</option>
                <option value="Eras">Eras</option>
                <option value="all">All</option>
              </select>
            </div>
          ) : (
            <></>
          )}
          {timesField || timeRangeImageGraph ? (
            <div>
              Time:{" "}
              <select
                name="timeRange"
                disabled={!timesField && !timeRangeImageGraph}
              >
                <option value="all">
                  {dataVariation === "all" ? "Year and Month" : "All Time"}
                </option>
                {timesDataEN ? (
                  <>
                    <option value="year" disabled={!timesDataEN}>
                      All years
                    </option>
                    <option value="month" disabled={!timesDataEN}>
                      {dataVariation === "all"
                        ? "All months"
                        : "Past 12 months"}
                    </option>
                  </>
                ) : (
                  <></>
                )}
                {timeRangeImageGraph ? (
                  <>
                    <option value="6month" disabled={!timeRangeImageGraph}>
                      Past 6 Month
                    </option>
                    <option value="4week" disabled={!timeRangeImageGraph}>
                      Past 4 Weeks
                    </option>
                  </>
                ) : (
                  <></>
                )}
              </select>
            </div>
          ) : (
            <></>
          )}
          {timeRangeData && !imageGraph ? (
            <div>
              Time Range - From:{" "}
              <input
                name="timeFrom"
                disabled={!timeRangeData || imageGraph}
                type="date"
              />{" "}
              To:{" "}
              <input
                name="timeTo"
                disabled={!timeRangeData || imageGraph}
                type="date"
              />
            </div>
          ) : (
            <></>
          )}
          {!disabledThemes ? (
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
          ) : (
            <></>
          )}
          {axisTitlesEN ? (
            <>
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
            </>
          ) : (
            <></>
          )}
          {legendEN ? (
            <div>
              Legend Enabled:
              <input
                name="legendEnabled"
                type="checkbox"
                disabled={!legendEN}
              />
            </div>
          ) : (
            <></>
          )}
          {friendsAvailable && validFriendData ? (
            <div>
              Display Friend's Data? :
              <input
                name="friendDataOn"
                type="checkbox"
                checked={wantFriendData}
                onChange={(e) => {
                  setWantFriendData(e.target.checked);
                }}
                disabled={!friendsAvailable || !validFriendData}
              />
            </div>
          ) : (
            <></>
          )}
          {wantFriendData ? (
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
          ) : (
            <></>
          )}
          {multiDataEN && wantFriendData ? (
            <div>
              Display both own data and friend's data? :
              <input
                name="bothFriendAndOwnData"
                type="checkbox"
                disabled={!multiDataEN || !wantFriendData}
              />
            </div>
          ) : (
            <></>
          )}
          {imageGraph ? (
            <div>
              Link Click Action:{" "}
              <select name="clickAction" disabled={!imageGraph}>
                <option value="playMusic">Play Music</option>
                <option value="spotifyPage">Link to Spotify Page</option>
              </select>
            </div>
          ) : (
            <></>
          )}
          <div>
            Preview Graph? :
            <input name="preview" type="checkbox" />
          </div>
          <div>
            <button className="TypButton" type="submit">
              Generate Graph
            </button>
          </div>
        </form>
      </div>
      {previewData !== undefined ? displayPreview() : <></>}
    </div>
  );
}
