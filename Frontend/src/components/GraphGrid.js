import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Tooltip } from "react-tooltip";
import { line1, bar1, pie1, pie2, nameFromDataName } from "./Graphs/Graphs";
import BarGraph from "./Graphs/BarGraph";
import LineGraph from "./Graphs/LineGraph";
import PieGraph from "./Graphs/PieGraph";
import BumpGraph from "./Graphs/BumpGraph";
import ImageGraph from "./Graphs/ImageGraph";
import CalendarGraph from "./Graphs/CalendarGraph";
import ScatterGraph from "./Graphs/ScatterGraph";
import RadialBarGraph from "./Graphs/RadialBarGraph";
import Popup from "./Popup";
import "react-resizable/css/styles.css";
import axios from "axios";
import tempBasicData from "./TempData/BasicStats.js";
import tempAdvancedData from "./TempData/AdvancedStats";
import defaultLayout from "./TempData/defaultLayout";

const ResponsiveGridLayout = WidthProvider(Responsive);

async function fetchBasicData() {
  const response = await axios.get("http://127.0.0.1:5000/statistics", {
    withCredentials: true,
  });
  const data = response.data;
  console.log(response);
  return data;
}

async function fetchBasicFriendData(spotify_id) {
  const response = await axios.post("http://127.0.0.1:5000/friend_statistics", {
    id: spotify_id,
  });
  const data = response.data;
  console.log(response);
  return data;
}

async function fetchAdvancedData() {
  const response = await axios.get("http://127.0.0.1:5000/get_advanced_stats", {
    withCredentials: true,
  });
  const data = response.data;
  console.log(response);
  return data;
}

async function sendLayouts(layouts, defaultLayout) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/statistics/set_layout",
    {
      layout: { layouts: layouts, defaultLayout: defaultLayout },
    }
  );
  const data = response.data;
  console.log(response);
  return data;
}

export default function GraphGrid() {
  //UseStates for layout setting
  const [layout, setLayout] = useState(defaultLayout);
  const [graphNames, setGraphNames] = useState([]);
  const [layoutNumber, setlayoutNumber] = useState(1);
  const [defaultLayoutNum, setDefaultLayoutNum] = useState(1);

  //Pulled data
  const [topArtists, setTopArtists] = useState();
  const [topSongs, setTopSongs] = useState();
  const [followers, setFollowers] = useState();
  const [recentSongs, setRecentSongs] = useState();
  const [savedSongs, setSavedSongs] = useState();
  const [savedAlbums, setSavedAlbums] = useState();
  const [followedArtists, setFollowedArtists] = useState();
  const [savedPlaylists, setSavedPlaylists] = useState();
  const [finishedPullingData, setFinished] = useState(false);
  const [friendDatas, setFriendDatas] = useState([]);
  const [advancedData, setAdvancedData] = useState();
  const [finishedPullingAdvancedData, setFinishedAdvanced] = useState(false);

  //Remove container function
  const RemoveContainer = (containerName) => {
    let updatedLayout = layout;
    updatedLayout = updatedLayout.filter((item) => item.i !== containerName);
    setLayout(updatedLayout);
  };

  //Add container function
  const AddContainer = (container) => {
    setLayout([...layout, container]);
  };

  const changeDefaultLayoutNum = (e) => {
    setDefaultLayoutNum(e.target.value);
  };

  //Get layout from local storage
  function getFromLS(key) {
    //Try-catch to set layout to default one if recieved empty layout
    try {
      const storedLayout = localStorage.getItem(key);
      //console.log(storedLayout);
      const newLayout = JSON.parse(storedLayout);
      if (newLayout == null) {
        throw new Error("null layout");
      }
      return newLayout;
    } catch (e) {
      console.log(e);
      saveToLS(key, defaultLayout);
      return defaultLayout;
    }
  }

  function getAllFromLS() {
    let allLayouts = [];
    for (let i = 1; i < 4; i++) {
      allLayouts.push(getFromLS(i));
    }
    return allLayouts;
  }

  //Send layout to local storage
  const saveToLS = (key, storingLayout) => {
    try {
      /*
      console.log(
        "Layout " + key + " (should be " + layoutNumber + " ) stored as"
      );
      console.log(storingLayout);*/
      localStorage.setItem(key, JSON.stringify(storingLayout));
    } catch (e) {
      alert(e);
    }
  };

  //Function for save button
  const handleSaveButtonClick = () => {
    saveToLS(layoutNumber, layout);
    console.log(layout);
    sendLayouts(getAllFromLS(), defaultLayoutNum);
  };

  //Function for load button
  const handleLoadButtonClick = (saveNumber) => {
    setlayoutNumber(saveNumber);
    const loadedLayout = getFromLS(saveNumber);
    setLayout(loadedLayout);
  };

  //When layout changes, store to layout var
  const handleLayoutChange = (layoutA, allLayouts) => {
    //Copy position and size data of each element to their counterparts in the layout var
    let updatedLayout = [];
    let graphNames = [];
    for (let container of layout) {
      const diffContainer = allLayouts.lg.find(
        (tempContainer) => tempContainer.i === container.i
      );
      //Store graph names into an array for new graph use
      graphNames = [...graphNames, container.i];
      //Position data
      container["x"] = diffContainer.x;
      container["y"] = diffContainer.y;
      //Size data
      container["w"] = diffContainer.w;
      container["h"] = diffContainer.h;
      updatedLayout.push(container);
    }
    setGraphNames(graphNames);
    setLayout(updatedLayout);
  };

  //Get data from server & set top song/artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("getting basic stats");
        const data = await fetchBasicData();

        //Log data in console to view
        try {
          console.log("Got below data");
          const objData = {
            top_artists: data.top_artists,
            top_songs: data.top_songs,
            recent_history: data.recent_history,
            saved_songs: data.saved_songs,
            saved_albums: data.saved_albums,
            followed_artists: data.followed_artists,
            layout_data: data.layout_data,
            follower_data: data.follower_data,
            saved_playlists: data.saved_playlists,
          };
          console.log(objData);
        } catch (e) {
          console.log(e);
        }

        //Try catch for each data for parsing failure when data field empty
        try {
          setTopArtists(data.top_artists);
        } catch (e) {
          console.log("Top Artist empty");
        }
        try {
          setTopSongs(data.top_songs);
        } catch (e) {
          console.log("Top Song empty");
        }
        try {
          setRecentSongs(data.recent_history);
        } catch (e) {
          console.log("Recent songs empty");
        }

        try {
          setSavedSongs(data.saved_songs);
        } catch (e) {
          console.log("Saved Songs empty");
        }

        try {
          setSavedAlbums(data.saved_albums);
        } catch (e) {
          console.log("Saved Albums empty");
        }

        try {
          setSavedPlaylists(data.saved_playlists);
        } catch (e) {
          console.log("Saved Playlists empty");
        }

        try {
          setFollowedArtists(data.followed_artists);
        } catch (e) {
          console.log("Followed Artists empty");
        }

        //Followers
        if (data.follower_data === "") {
          console.log("Followers empty");
        } else {
          setFollowers(data.follower_data);
        }

        //Layout
        if (data.layout_data === "") {
          console.log("Layout empty");
        } else {
          console.log("Getting databse layouts");
          //Set local storage of layouts
          const layout_data = data.layout_data;
          let newLayouts = layout_data.layouts;
          console.log(newLayouts);

          for (let i = 0; i < 3; i++) {
            setlayoutNumber(i + 1);
            saveToLS(i + 1, newLayouts[i]);
          }
          if (layout_data.defaultLayout === "") {
          } else {
            setlayoutNumber(parseInt(layout_data.defaultLayout));
          }
        }

        setFinished(true);
      } catch (error) {
        alert("Page failed fetching - loading backup data");
        console.error("Error fetching data:", error);
        // Temporary measure to keep things going
        setTopArtists(tempBasicData.top_artists);
        setTopSongs(tempBasicData.top_songs);
        setFollowers(tempBasicData.follower_data);
        setRecentSongs(tempBasicData.recent_history);
        setSavedSongs(tempBasicData.saved_songs);
        setSavedAlbums(JSON.parse(tempBasicData.saved_albums));
        setFollowedArtists(tempBasicData.followed_artists);
        setSavedPlaylists(tempBasicData.saved_playlists);

        setFinished(true);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Get advanced data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Getting advanced data");
        const data = await fetchAdvancedData();
        if (data === null) {
          // Error thrown here to trigger backup advanced data
          throw new Error("No advanced data found!");
        } else {
          setAdvancedData(data);
        }
      } catch (error) {
        alert(
          "Page failed fetching advanced data - loading backup advanced data"
        );
        console.log(
          "Page failed fetching advanced data - loading backup advanced data"
        );
        console.error("Error fetching advanced data:", error);
        setAdvancedData(tempAdvancedData);
      }
    };
    fetchData();
    setFinishedAdvanced(true);
  }, []);

  //Functions to enable opening and closing of the "Add Graph" menu
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => {
    setIsPopupOpen(true);
  };
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const getNewGraphData = (newGraphData) => {
    //Set structure w/ default values & graphName & graphType
    let newGraph = {
      i: newGraphData.graphName,
      graphType: newGraphData.graphType,
      data: newGraphData.data,
      timeRange: newGraphData.timeRange,
      dataVariation: newGraphData.dataVariation,
      friendDataOn: newGraphData.friendDataOn === "on" ? true : false,
      friendName: newGraphData.friendName,
      friendID: newGraphData.friendID,
      bothFriendAndOwnData:
        newGraphData.bothFriendAndOwnData === "on" ? true : false,
      graphSettings: {
        graphTheme: newGraphData.graphTheme,
        clickAction: newGraphData.clickAction,
        hortAxisTitle: newGraphData.hortAxisTitle,
        vertAxisTitle: newGraphData.vertAxisTitle,
        legendEnabled: newGraphData.legendEnabled,
      },
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    };

    if (newGraph.graphType === "VertBar" || newGraph.graphType === "HortBar") {
      newGraph.graphSettings = Object.assign(
        { graphKeys: ["degrees"], graphIndexBy: "day" },
        newGraph.graphSettings
      );
    }

    if (newGraphData.friendDataOn === "on") {
      if (
        !friendDatas.some((element) => element.id === newGraphData.friendID)
      ) {
        fetchBasicFriendData(newGraphData.friendID).then((friendData) => {
          setFriendDatas([
            ...friendDatas,
            {
              id: newGraphData.friendID,
              name: newGraphData.friendName,
              data: friendData,
            },
          ]);
        });
      }
    }

    console.log("New Layout item added:");
    console.log(newGraph);
    AddContainer(newGraph);
  };

  function getData(props) {
    switch (props.data) {
      case "bar1":
        return bar1;
      case "line1":
        return line1;
      case "pie1":
        return pie1;
      case "pie2":
        return pie2;
      case "justReturn":
        return;
      default:
        break;
    }
    try {
      //Get data for friend if not gotten before
      if (props.friendName !== undefined) {
        console.log(props);

        const friendIndex = friendDatas.findIndex((element, index) => {
          return element.id === props.friendID;
        });

        if (friendIndex === -1) {
          return null;
        }

        if (!props.bothFriendAndOwnData) {
          switch (props.data) {
            case "top_songs":
              switch (props.timeRange) {
                case "4week":
                  return [
                    topSongs[0],
                    friendDatas[friendIndex].data.top_songs[0],
                  ];
                case "6month":
                  return [
                    topSongs[1],
                    friendDatas[friendIndex].data.top_songs[2],
                  ];
                case "all":
                  return [
                    topSongs[1],
                    friendDatas[friendIndex].data.top_songs[2],
                  ];
                default:
                  return [topSongs, friendDatas[friendIndex].data.top_songs];
              }
            case "top_artists":
              switch (props.timeRange) {
                case "4week":
                  return [
                    topArtists[0],
                    friendDatas[friendIndex].data.top_artists[0],
                  ];
                case "6month":
                  return [
                    topArtists[1],
                    friendDatas[friendIndex].data.top_artists[1],
                  ];
                case "all":
                  return [
                    topArtists[2],
                    friendDatas[friendIndex].data.top_artists[2],
                  ];
                default:
                  return [
                    topArtists,
                    friendDatas[friendIndex].data.top_artists,
                  ];
              }
            case "followers":
              return [followers, friendDatas[friendIndex].data.follower_data];
            case "recent_songs":
              return [
                recentSongs,
                friendDatas[friendIndex].data.recent_history,
              ];
            case "saved_songs":
              return [savedSongs, friendDatas[friendIndex].data.saved_songs];
            case "saved_albums":
              return [savedAlbums, friendDatas[friendIndex].data.saved_albums];
            case "saved_playlists":
              return [
                savedPlaylists,
                friendDatas[friendIndex].data.saved_playlists,
              ];
            case "followed_artists":
              return [
                followedArtists,
                friendDatas[friendIndex].data.followed_artists,
              ];
            case "numMinutes":
            case "percentTimes":
            case "percentTimePeriod":
            case "numTimesSkipped":
            case "emotion":
              return advancedData;
            default:
              return null;
          }
        } else {
          switch (props.data) {
            case "top_songs":
              switch (props.timeRange) {
                case "4week":
                  return friendDatas[friendIndex].data.top_songs[0];
                case "6month":
                  return friendDatas[friendIndex].data.top_songs[1];
                case "all":
                  return friendDatas[friendIndex].data.top_songs[2];
                default:
                  return friendDatas[friendIndex].data.top_songs;
              }
            case "top_artists":
              switch (props.timeRange) {
                case "4week":
                  return friendDatas[friendIndex].data.top_artists[0];
                case "6month":
                  return friendDatas[friendIndex].data.top_artists[1];
                case "all":
                  return friendDatas[friendIndex].data.top_artists[2];
                default:
                  return friendDatas[friendIndex].data.top_artists;
              }
            case "followers":
              return friendDatas[friendIndex].data.follower_data;
            case "recent_songs":
              return friendDatas[friendIndex].data.recent_history;
            case "saved_songs":
              return friendDatas[friendIndex].data.saved_songs;
            case "saved_albums":
              return friendDatas[friendIndex].data.saved_albums;
            case "saved_playlists":
              return friendDatas[friendIndex].data.saved_playlists;
            case "followed_artists":
              return friendDatas[friendIndex].data.followed_artists;
            case "numMinutes":
            case "percentTimes":
            case "percentTimePeriod":
            case "numTimesSkipped":
            case "emotion":
              return advancedData;
            default:
              return null;
          }
        }
      } else {
        switch (props.data) {
          case "top_songs":
            switch (props.timeRange) {
              case "4week":
                return topSongs[0];
              case "6month":
                return topSongs[1];
              case "all":
                return topSongs[2];
              default:
                return topSongs;
            }
          case "top_artists":
            switch (props.timeRange) {
              case "4week":
                return topArtists[0];
              case "6month":
                return topArtists[1];
              case "all":
                return topArtists[2];
              default:
                return topArtists;
            }
          case "followers":
            return followers;
          case "recent_songs":
            return recentSongs;
          case "saved_songs":
            return savedSongs;
          case "saved_albums":
            return savedAlbums;
          case "saved_playlists":
            return savedPlaylists;
          case "followed_artists":
            return followedArtists;
          case "numMinutes":
          case "percentTimes":
          case "percentTimePeriod":
          case "numTimesSkipped":
          case "emotion":
            return advancedData;
          default:
            return null;
        }
      }
      //console.log("Got this data: " + dataName);
    } catch (e) {
      console.log(e);
      return "";
    }
  }

  //Get correct initial layout when initialized
  useEffect(() => {
    setLayout(getFromLS(layoutNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedPullingData]);

  useEffect(() => {
    // Call the getData function when the component mounts or when container changes
    getData({ data: "justReturn" });
  }, [friendDatas]);

  if (!finishedPullingData) {
    return <>Still Loading...</>;
  } else if (!finishedPullingAdvancedData) {
    return <>Loading Advanced Data...</>;
  } else {
    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1000, xs: 500, xxs: 0 }}
          cols={{ lg: 5, xs: 2, xxs: 1 }}
          rowHeight={300}
          width={"100%"}
          onLayoutChange={handleLayoutChange}
          draggableCancel=".custom-draggable-cancel"
        >
          {layout.map((container) => (
            <div className="graphContainer" key={container.i}>
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{ fontSize: "var(--title-text-size)" }}
                  data-tooltip-id={container.i + "-tooltip"}
                  data-tooltip-content={
                    container.graphType +
                    ' of "' +
                    nameFromDataName(container.data) +
                    '"' +
                    (container.data === "numMinutes" ||
                    container.data === "percentTimes"
                      ? " for " + container.dataVariation
                      : "") +
                    (container.data.includes("num") ||
                    container.data.includes("percent") ||
                    (container.data.includes("top") &&
                      !(container.graphType === "Bump"))
                      ? " for " + container.timeRange
                      : "")
                  }
                >
                  {container.i}
                </div>
                <button
                  className="GraphCloseButton custom-draggable-cancel"
                  onClick={() => RemoveContainer(container.i)}
                >
                  X
                </button>
                <Tooltip id={container.i + "-tooltip"} />
              </div>
              {container.graphType === "VertBar" ||
              container.graphType === "HortBar" ? (
                <BarGraph
                  graphName={container.graphType}
                  data={getData(container)}
                  dataName={container.data}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  graphKeys={container.graphSettings.graphKeys}
                  graphIndexBy={container.graphSettings.graphIndexBy}
                  graphTheme={container.graphSettings.graphTheme}
                  hortAxisTitle={container.graphSettings.hortAxisTitle}
                  vertAxisTitle={container.graphSettings.vertAxisTitle}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : container.graphType === "Line" ? (
                <LineGraph
                  data={getData(container)}
                  dataName={container.data}
                  dataVariation={container.dataVariation}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  timeRange={container.timeRange}
                  graphTheme={container.graphSettings.graphTheme}
                  hortAxisTitle={container.graphSettings.hortAxisTitle}
                  vertAxisTitle={container.graphSettings.vertAxisTitle}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : container.graphType === "Pie" ? (
                <PieGraph
                  data={getData(container)}
                  dataName={container.data}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  graphTheme={container.graphSettings.graphTheme}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : container.graphType === "ImageGraph" ? (
                <ImageGraph
                  data={getData(container)}
                  dataName={container.data}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  clickAction={container.graphSettings.clickAction}
                />
              ) : container.graphType === "Bump" ? (
                <BumpGraph
                  data={getData(container)}
                  dataName={container.data}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  graphTheme={container.graphSettings.graphTheme}
                  hortAxisTitle={container.graphSettings.hortAxisTitle}
                  vertAxisTitle={container.graphSettings.vertAxisTitle}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : container.graphType === "Calendar" ? (
                <CalendarGraph
                  data={getData(container)}
                  dataName={container.data}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  graphTheme={container.graphSettings.graphTheme}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : container.graphType === "Scatter" ? (
                <ScatterGraph
                  data={getData(container)}
                  dataName={container.data}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  graphTheme={container.graphSettings.graphTheme}
                  hortAxisTitle={container.graphSettings.hortAxisTitle}
                  vertAxisTitle={container.graphSettings.vertAxisTitle}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : container.graphType === "RadBar" ? (
                <RadialBarGraph
                  data={getData(container)}
                  dataName={container.data}
                  bothFriendAndOwnData={container.bothFriendAndOwnData}
                  dataVariation={container.dataVariation}
                  timeRange={container.timeRange}
                  graphTheme={container.graphSettings.graphTheme}
                  hortAxisTitle={container.graphSettings.hortAxisTitle}
                  vertAxisTitle={container.graphSettings.vertAxisTitle}
                  legendEnabled={container.graphSettings.legendEnabled}
                />
              ) : (
                <p> Invalid Graph Type</p>
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
        <div>
          <p> Current layout is {layoutNumber}</p>
          <button onClick={() => handleLoadButtonClick(1)}>Load 1</button>
          <button onClick={() => handleLoadButtonClick(2)}>Load 2</button>
          <button onClick={() => handleLoadButtonClick(3)}>Load 3</button>
          <button onClick={handleSaveButtonClick}>Save Current Loadout</button>
        </div>
        <div>
          <p>Set Default Layout: </p>
          <select
            name="defaultLayout"
            value={defaultLayoutNum}
            onChange={changeDefaultLayoutNum}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <button className="TypButton" onClick={openPopup}>
            Add Graph
          </button>
        </div>
        <Popup
          isOpen={isPopupOpen}
          onClose={closePopup}
          addGraph={getNewGraphData}
          graphNames={graphNames}
        />
      </React.Fragment>
    );
  }
}
