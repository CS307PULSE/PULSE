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
import RadarGraph from "./Graphs/RadarGraph.js";
import TextGraph from "./Graphs/TextGraph.js";
import Popup from "./Popup";
import "react-resizable/css/styles.css";
import axios from "axios";
//import tempBasicData from "./TempData/BasicStats.js";
import tempAdvancedData from "./TempData/AdvancedStats";
import defaultLayout from "./TempData/defaultLayout";

const ResponsiveGridLayout = WidthProvider(Responsive);

async function fetchBasicData() {
  const response = await axios.get("/api/statistics", {
    withCredentials: true,
  });
  const data = response.data;
  return data;
}

async function fetchFriends() {
  const response = await axios.get("/api/friends/get_friends", {
    withCredentials: true,
  });
  const data = response.data;
  return data;
}

async function fetchBasicFriendData(spotify_id) {
  const response = await axios.post("/api/statistics/friend", {
    id: spotify_id,
  });
  const data = response.data;
  return data;
}

async function fetchAdvancedFriendData(spotify_id) {
  try {
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "/api/friend_get_advanced_stats",
      {
        id: spotify_id,
      }
    );
    const data = response.data;
    return data;
  } catch (e) {
    return null;
  }
}

async function fetchAdvancedData() {
  const response = await axios.get("/api/get_advanced_stats", {
    withCredentials: true,
  });
  const data = response.data;
  return data;
}

async function sendLayouts(layouts, defaultLayout, numLayoutColumns) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post("/api/statistics/set_layout", {
    layout: {
      layouts: layouts,
      defaultLayout: defaultLayout,
      numLayoutColumns: numLayoutColumns,
    },
  });
  const data = response.data;
  return data;
}

export default function GraphGrid() {
  //UseStates for layout setting
  const [layout, setLayout] = useState(defaultLayout);
  const [graphNames, setGraphNames] = useState([]);
  const [layoutNumber, setlayoutNumber] = useState(1);
  const [defaultLayoutNum, setDefaultLayoutNum] = useState(1);
  const [numLayoutColumns, setNumLayoutColumns] = useState(5);

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
  const [friends, setFriends] = useState([]);
  const [friendDatas, setFriendDatas] = useState([]);
  const [friendBasicDataAvailable, setBasicFriendsAvailable] = useState({});
  const [friendAdvancedDataAvailable, setAdvancedFriendsAvailable] = useState(
    {}
  );
  const [finishGettingFriends, setFinishedGettingFriends] = useState(false);
  const [advancedData, setAdvancedData] = useState();
  const [finishedPullingAdvancedData, setFinishedAdvanced] = useState(false);

  //Remove container function
  const removeContainer = (containerName) => {
    let updatedLayout = layout;
    updatedLayout = updatedLayout.filter((item) => item.i !== containerName);
    setLayout(updatedLayout);
  };

  const getContainer = (containerName) => {
    return layout.filter((item) => item.i === containerName)[0];
  };

  //Add container function
  const addContainer = (container) => {
    setLayout([...layout, container]);
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
      console.error(e);
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
      localStorage.setItem(key, JSON.stringify(storingLayout));
    } catch (e) {
      alert(e);
    }
  };

  //Function for save button
  const handleSaveButtonClick = () => {
    saveToLS(layoutNumber, layout);
    //console.log(layout);
    sendLayouts(getAllFromLS(), defaultLayoutNum, numLayoutColumns);
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

  //Save selected data to layout for saving
  const selectData = (selected, graphName) => {
    let container = getContainer(graphName);
    container.selectedData = selected;
    let updatedLayout = layout;
    updatedLayout = updatedLayout.filter((item) => item.i !== graphName);
    setLayout([...updatedLayout, container]);
  };

  //Get data from server & set top song/artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        //("getting basic stats");
        const data = await fetchBasicData();

        //Log data in console to view
        /*
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
        */

        setTopArtists(data.top_artists);
        setTopSongs(data.top_songs);
        setRecentSongs(data.recent_history);
        setSavedSongs(data.saved_songs);
        setSavedAlbums(data.saved_albums);
        setSavedPlaylists(data.saved_playlists);
        setFollowedArtists(data.followed_artists);

        //Followers
        if (data.follower_data === "") {
          //console.log("Followers empty");
        } else {
          setFollowers(data.follower_data);
        }

        //Layout
        if (data.layout_data === "") {
          //console.log("Layout empty");
        } else {
          //console.log("Getting databse layouts");
          //Set local storage of layouts
          const layout_data = data.layout_data;
          let newLayouts = layout_data.layouts;
          //console.log(newLayouts);

          for (let i = 0; i < 3; i++) {
            setlayoutNumber(i + 1);
            saveToLS(i + 1, newLayouts[i]);
          }
          if (
            layout_data.defaultLayout !== "" &&
            layout_data.defaultLayout !== undefined
          ) {
            setlayoutNumber(parseInt(layout_data.defaultLayout));
          }
          if (
            layout_data.numLayoutColumns !== "" &&
            layout_data.numLayoutColumns !== undefined
          ) {
            setNumLayoutColumns(layout_data.numLayoutColumns);
          }
        }

        setFinished(true);
      } catch (error) {
        alert("Page failed fetching - try refreshing?");
        console.error("Error fetching data:", error);
        setFinished(false);
      }
    };

    fetchData();

    fetchFriends().then((result) => {
      setFriends(
        result.map((friend) => {
          fetchBasicFriendData(friend.spotify_id).then((basicFriendData) => {
            fetchAdvancedFriendData(friend.spotify_id).then(
              (advancedFriendData) => {
                setFriendDatas([
                  ...friendDatas,
                  {
                    id: friend.spotify_id,
                    name: friend.name,
                    basicData: basicFriendData,
                    advancedData: advancedFriendData,
                  },
                ]);
                let obj = friendAdvancedDataAvailable;
                if (advancedFriendData !== null) {
                  obj[friend.spotify_id] = "available";
                } else {
                  obj[friend.spotify_id] = "unavailable";
                  console.error(
                    "Page failed fetching " +
                      friend.spotify_id +
                      "'s advanced data"
                  );
                }
                setAdvancedFriendsAvailable(obj);
              }
            );
            let obj = friendBasicDataAvailable;
            if (basicFriendData !== null) {
              obj[friend.spotify_id] = "available";
            } else {
              obj[friend.spotify_id] = "unavailable";
              console.error(
                "Page failed fetching " + friend.spotify_id + "'s basic data"
              );
            }
            setBasicFriendsAvailable(obj);
          });

          return friend.spotify_id;
        })
      );
      setFinishedGettingFriends(true);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Get advanced data
  useEffect(() => {
    const fetchData = async () => {
      try {
        //console.log("Getting advanced data");
        const data = await fetchAdvancedData();
        if (data === null) {
          // Error thrown here to trigger backup advanced data
          throw new Error("No advanced data found!");
        } else {
          setAdvancedData(data);
          setFinishedAdvanced(true);
        }
      } catch (error) {
        /*
        alert("Page failed fetching advanced data");
        setAdvancedData("Empty");
        */
        alert(
          "Page failed fetching advanced data - please upload your advanced data"
        );
        console.error("Error fetching advanced data:", error);
        setAdvancedData(tempAdvancedData);
        setFinishedAdvanced(true);
      }
    };
    fetchData();
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
      timeFromTo: [newGraphData.timeFrom, newGraphData.timeTo],
      dataVariation: newGraphData.dataVariation,
      friendDataOn: newGraphData.friendDataOn === "on" ? true : false,
      friendName: newGraphData.friendName,
      friendID: newGraphData.friendID,
      bothFriendAndOwnData:
        newGraphData.bothFriendAndOwnData === "on" ? true : false,
      selectedData: [],
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
      if (newGraph.data.includes("bar")) {
        newGraph.graphSettings = Object.assign(
          { graphKeys: ["degrees"], graphIndexBy: "day" },
          newGraph.graphSettings
        );
      } else {
        newGraph.graphSettings = Object.assign(
          { graphKeys: ["value"], graphIndexBy: "id" },
          newGraph.graphSettings
        );
      }
    }
    //console.log("New Layout item added:");
    //console.log(newGraph);
    addContainer(newGraph);
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
      case "emotion":
        return;
      default:
        break;
    }
    try {
      //Get data for friend if not gotten before
      if (props.friendName !== undefined) {
        if (!friends.includes(props.friendID)) {
          return null;
        }
        //console.log(props);

        const friendIndex = friendDatas.findIndex((element, index) => {
          return element.id === props.friendID;
        });

        if (friendIndex === -1) {
          return null;
        }

        if (props.bothFriendAndOwnData) {
          switch (props.data) {
            case "top_songs":
              switch (props.timeRange) {
                case "4week":
                  return [
                    topSongs[0],
                    friendDatas[friendIndex].basicData.top_songs[0],
                  ];
                case "6month":
                  return [
                    topSongs[1],
                    friendDatas[friendIndex].basicData.top_songs[2],
                  ];
                case "all":
                  return [
                    topSongs[1],
                    friendDatas[friendIndex].basicData.top_songs[2],
                  ];
                default:
                  return [
                    topSongs,
                    friendDatas[friendIndex].basicData.top_songs,
                  ];
              }
            case "top_artists":
              switch (props.timeRange) {
                case "4week":
                  return [
                    topArtists[0],
                    friendDatas[friendIndex].basicData.top_artists[0],
                  ];
                case "6month":
                  return [
                    topArtists[1],
                    friendDatas[friendIndex].basicData.top_artists[1],
                  ];
                case "all":
                  return [
                    topArtists[2],
                    friendDatas[friendIndex].basicData.top_artists[2],
                  ];
                default:
                  return [
                    topArtists,
                    friendDatas[friendIndex].basicData.top_artists,
                  ];
              }
            case "followers":
              return [
                followers,
                friendDatas[friendIndex].basicData.follower_data,
              ];
            case "recent_songs":
              return [
                recentSongs,
                friendDatas[friendIndex].basicData.recent_history,
              ];
            case "saved_songs":
              return [
                savedSongs,
                friendDatas[friendIndex].basicData.saved_songs,
              ];
            case "saved_albums":
              return [
                savedAlbums,
                friendDatas[friendIndex].basicData.saved_albums,
              ];
            case "saved_playlists":
              return [
                savedPlaylists,
                friendDatas[friendIndex].basicData.saved_playlists,
              ];
            case "followed_artists":
              return [
                followedArtists,
                friendDatas[friendIndex].basicData.followed_artists,
              ];
            case "numMinutes":
            case "numStreams":
            case "percentTimes":
            case "percentTimePeriod":
            case "numTimesSkipped":
            case "emotion":
              return [advancedData, friendDatas[friendIndex].advancedData];
            default:
              return null;
          }
        } else {
          switch (props.data) {
            case "top_songs":
              switch (props.timeRange) {
                case "4week":
                  return friendDatas[friendIndex].basicData.top_songs[0];
                case "6month":
                  return friendDatas[friendIndex].basicData.top_songs[1];
                case "all":
                  return friendDatas[friendIndex].basicData.top_songs[2];
                default:
                  return friendDatas[friendIndex].basicData.top_songs;
              }
            case "top_artists":
              switch (props.timeRange) {
                case "4week":
                  return friendDatas[friendIndex].basicData.top_artists[0];
                case "6month":
                  return friendDatas[friendIndex].basicData.top_artists[1];
                case "all":
                  return friendDatas[friendIndex].basicData.top_artists[2];
                default:
                  return friendDatas[friendIndex].basicData.top_artists;
              }
            case "followers":
              return friendDatas[friendIndex].basicData.follower_data;
            case "recent_songs":
              return friendDatas[friendIndex].basicData.recent_history;
            case "saved_songs":
              return friendDatas[friendIndex].basicData.saved_songs;
            case "saved_albums":
              return friendDatas[friendIndex].basicData.saved_albums;
            case "saved_playlists":
              return friendDatas[friendIndex].basicData.saved_playlists;
            case "followed_artists":
              return friendDatas[friendIndex].basicData.followed_artists;
            case "numMinutes":
            case "numStreams":
            case "percentTimes":
            case "percentTimePeriod":
            case "numTimesSkipped":
            case "emotion":
              return friendDatas[friendIndex].advancedData;
            default:
              return null;
          }
        }
      } else {
        switch (props.data) {
          case "top_songs":
          case "emotionData":
            switch (props.timeRange) {
              case "4week":
                return topSongs[0];
              case "6month":
                return topSongs[1];
              case "all":
                return topSongs[2];
              default:
                return topSongs[2];
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
          case "numStreams":
          case "percentTimes":
          case "percentTimePeriod":
          case "numTimesSkipped":
            return advancedData;
          default:
            return null;
        }
      }
      //console.log("Got this data: " + dataName);
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  const dataIsBasicOrAdvanced = {
    top_songs: "basic",
    top_artists: "basic",
    emotionData: "basic",
    followers: "basic",
    recent_songs: "basic",
    saved_songs: "basic",
    saved_albums: "basic",
    saved_playlists: "basic",
    followed_artists: "basic",
    numMinutes: "advanced",
    numStreams: "advanced",
    percentTimes: "advanced",
    percentTimePeriod: "advanced",
    numTimesSkipped: "advanced",
  };

  //Get correct initial layout when initialized
  useEffect(() => {
    setLayout(getFromLS(layoutNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedPullingData]);

  if (!finishedPullingData) {
    return (
      <div style={{ textAlign: "center" }}>
        <p className="loadingText" style={{fontStyle: "italic"}}>Loading...</p>
      </div>
    );
  } else if (!finishedPullingAdvancedData) {
    return (
      <div style={{ textAlign: "center" }}>
        <p className="loadingText">Loading advanced data...</p>
      </div>
    );
  } else {
    //console.log(finishedPullingAdvancedData);
    //console.log(advancedData);
    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1000, xs: 500, xxs: 0 }}
          cols={{
            lg: numLayoutColumns,
            xs: Math.round(numLayoutColumns / 2),
            xxs: 1,
          }}
          rowHeight={300}
          width={"100%"}
          onLayoutChange={handleLayoutChange}
          draggableCancel=".custom-draggable-cancel"
        >
          {layout.map((container) => {
            if (
              container.friendDataOn &&
              (!friendBasicDataAvailable[container.friendID] ||
                !friendAdvancedDataAvailable[container.friendID])
            ) {
              let msg;
              if (dataIsBasicOrAdvanced[container.data] === "basic") {
                if (
                  friendBasicDataAvailable[container.friendID] === undefined
                ) {
                  msg = "Loading graph data";
                  if (
                    finishGettingFriends &&
                    !friends.includes(container.friendID)
                  ) {
                    msg = "You're no longer friends";
                  }
                } else if (!friendBasicDataAvailable[container.friendID]) {
                  msg = "Friends basic data unavailable";
                }
              } else if (dataIsBasicOrAdvanced[container.data] === "advanced") {
                if (
                  friendAdvancedDataAvailable[container.friendID] === undefined
                ) {
                  msg = "Loading graph data";
                  if (
                    finishGettingFriends &&
                    !friends.includes(container.friendID)
                  ) {
                    msg = "You're no longer friends";
                  }
                } else if (!friendAdvancedDataAvailable[container.friendID]) {
                  msg = "Friends advanced data unavailable";
                }
              }
              if (msg !== undefined) {
                return (
                  <div className="graphContainer" key={container.i}>
                    <div style={{ marginBottom: "10px" }}>
                      <div
                        style={{ fontSize: "var(--title-text-size)" }}
                        data-tooltip-id={container.i + "-tooltip"}
                        data-tooltip-html={
                          (!emptyData(container.graphType)
                            ? "Graph Type: " + container.graphType + "<br />"
                            : "") +
                          "Data from: " +
                          (container.bothFriendAndOwnData
                            ? "Both User and " + container.friendName
                            : container.friendDataOn
                            ? container.friendName
                            : "User") +
                          "<br />" +
                          (!emptyData(container.data)
                            ? "Data Type: " +
                              nameFromDataName(container.data) +
                              "<br />"
                            : "") +
                          (!emptyData(container.dataVariation)
                            ? "Data variation: " +
                              container.dataVariation +
                              "<br />"
                            : "") +
                          (!emptyData(container.timeRange)
                            ? "Time Range: " + container.timeRange + "<br />"
                            : "") +
                          (!emptyData(container.timeFromTo)
                            ? "Data from to: " +
                              container.timeFromTo[0] +
                              " , " +
                              container.timeFromTo[1] +
                              "<br />"
                            : "") +
                          (!emptyData(container.graphSettings.graphTheme)
                            ? "Graph Theme: " +
                              container.graphSettings.graphTheme +
                              "<br />"
                            : "") +
                          (!emptyData(container.graphSettings.clickAction)
                            ? "Link Click Action: " +
                              container.graphSettings.clickAction +
                              "<br />"
                            : "")
                        }
                      >
                        {container.i}
                      </div>
                      <button
                        className="GraphCloseButton custom-draggable-cancel"
                        onClick={() => removeContainer(container.i)}
                      >
                        X
                      </button>
                      <Tooltip id={container.i + "-tooltip"} />
                    </div>
                    <div>{msg}</div>
                  </div>
                );
              }
            }
            return (
              <div className="graphContainer" key={container.i}>
                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{ fontSize: "var(--title-text-size)" }}
                    data-tooltip-id={container.i + "-tooltip"}
                    data-tooltip-html={
                      (!emptyData(container.graphType)
                        ? "Graph Type: " + container.graphType + "<br />"
                        : "") +
                      "Data from: " +
                      (container.bothFriendAndOwnData
                        ? "Both User and " + container.friendName
                        : container.friendDataOn
                        ? container.friendName
                        : "User") +
                      "<br />" +
                      (!emptyData(container.data)
                        ? "Data Type: " +
                          nameFromDataName(container.data) +
                          "<br />"
                        : "") +
                      (!emptyData(container.dataVariation)
                        ? "Data variation: " +
                          container.dataVariation +
                          "<br />"
                        : "") +
                      (!emptyData(container.timeRange)
                        ? "Time Range: " + container.timeRange + "<br />"
                        : "") +
                      (!emptyData(container.timeFromTo)
                        ? "Data from to: " +
                          container.timeFromTo[0] +
                          " , " +
                          container.timeFromTo[1] +
                          "<br />"
                        : "") +
                      (!emptyData(container.graphSettings.graphTheme)
                        ? "Graph Theme: " +
                          container.graphSettings.graphTheme +
                          "<br />"
                        : "") +
                      (!emptyData(container.graphSettings.clickAction)
                        ? "Link Click Action: " +
                          container.graphSettings.clickAction +
                          "<br />"
                        : "")
                    }
                  >
                    {container.i}
                  </div>
                  <button
                    className="GraphCloseButton custom-draggable-cancel"
                    onClick={() => removeContainer(container.i)}
                  >
                    X
                  </button>
                  <Tooltip
                    id={container.i + "-tooltip"}
                    style={{ zIndex: 1 }}
                  />
                </div>

                {container.graphType === "VertBar" ||
                container.graphType === "HortBar" ? (
                  <BarGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    graphKeys={container.graphSettings.graphKeys}
                    graphIndexBy={container.graphSettings.graphIndexBy}
                    graphTheme={container.graphSettings.graphTheme}
                    hortAxisTitle={container.graphSettings.hortAxisTitle}
                    vertAxisTitle={container.graphSettings.vertAxisTitle}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Line" ? (
                  <LineGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    dataVariation={container.dataVariation}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    friendName={container.friendName}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    hortAxisTitle={container.graphSettings.hortAxisTitle}
                    vertAxisTitle={container.graphSettings.vertAxisTitle}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Pie" ? (
                  <PieGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "ImageGraph" ? (
                  <ImageGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    clickAction={container.graphSettings.clickAction}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Bump" ? (
                  <BumpGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    hortAxisTitle={container.graphSettings.hortAxisTitle}
                    vertAxisTitle={container.graphSettings.vertAxisTitle}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Calendar" ? (
                  <CalendarGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Scatter" ? (
                  <ScatterGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    hortAxisTitle={container.graphSettings.hortAxisTitle}
                    vertAxisTitle={container.graphSettings.vertAxisTitle}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "RadBar" ? (
                  <RadialBarGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    hortAxisTitle={container.graphSettings.hortAxisTitle}
                    vertAxisTitle={container.graphSettings.vertAxisTitle}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Radar" ? (
                  <RadarGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    bothFriendAndOwnData={container.bothFriendAndOwnData}
                    dataVariation={container.dataVariation}
                    timeRange={container.timeRange}
                    timeFromTo={container.timeFromTo}
                    graphTheme={container.graphSettings.graphTheme}
                    hortAxisTitle={container.graphSettings.hortAxisTitle}
                    vertAxisTitle={container.graphSettings.vertAxisTitle}
                    legendEnabled={container.graphSettings.legendEnabled}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : container.graphType === "Text" ? (
                  <TextGraph
                    graphName={container.i}
                    data={getData(container)}
                    dataName={container.data}
                    friendName={container.friendName}
                    graphType={container.graphType}
                    selectedData={container.selectedData}
                    selectData={selectData}
                  />
                ) : (
                  <p> Invalid Graph Type</p>
                )}
              </div>
            );
          })}
        </ResponsiveGridLayout>
        <div className="overlay">
          <div className="spacing">Current layout is {layoutNumber}</div>
          <div className="spacing">
            <button
              className="MenuButton"
              onClick={() => handleLoadButtonClick(1)}
            >
              Load 1
            </button>
            <button
              className="MenuButton"
              onClick={() => handleLoadButtonClick(2)}
            >
              Load 2
            </button>
            <button
              className="MenuButton"
              onClick={() => handleLoadButtonClick(3)}
            >
              Load 3
            </button>
            <button className="MenuButton" onClick={handleSaveButtonClick}>
              Save Current Loadout
            </button>
          </div>
          <div className="spacing">
            Set Default Layout:{" "}
            <select
              name="defaultLayout"
              value={defaultLayoutNum}
              onChange={(e) => {
                setDefaultLayoutNum(e.target.value);
              }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div className="spacing">
            Grid Layout Columns:{" "}
            <input
              name="numLayoutColumns"
              value={numLayoutColumns}
              onChange={(e) => {
                const regexVal = e.target.value.replace(/\D/g, "");
                const value = Math.max(1, Math.min(15, Number(regexVal)));
                if (value === undefined || value === 0) {
                  setNumLayoutColumns(5);
                } else {
                  setNumLayoutColumns(value);
                }
              }}
              type="number"
              min="1"
              max="15"
              style={{ width: "3em" }}
            />
          </div>
          <div className="spacing">
            <button className="TypButton" onClick={openPopup}>
              Add Graph
            </button>
          </div>
        </div>
        <Popup
          isOpen={isPopupOpen}
          onClose={closePopup}
          addGraph={getNewGraphData}
          graphNames={graphNames}
          advancedDataAvailable={
            advancedData !== undefined && advancedData !== "Empty"
          }
        />
      </React.Fragment>
    );
  }
}

function emptyData(data) {
  if (data === undefined || data === null || data === "") {
    return true;
  } else if (typeof data === "object") {
    if (
      data.filter((e) => e !== undefined && e !== "" && e !== null).length === 0
    ) {
      return true;
    }
    return false;
  } else {
    return false;
  }
}
