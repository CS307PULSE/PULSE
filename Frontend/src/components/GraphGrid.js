import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Tooltip } from "react-tooltip";
import {
  BarGraph,
  LineGraph,
  PieGraph,
  ImageGraph,
  line1,
  bar1,
  pie1,
  pie2,
} from "./Graphs";
import Popup from "./Popup";
import "react-resizable/css/styles.css";
import axios from "axios";
import tempBasicData from "./TempData/BasicStats.js";

const ResponsiveGridLayout = WidthProvider(Responsive);

//Default layout so that page does not look empty
const defaultLayout = [
  {
    h: 1,
    i: "Top songs of last 4 weeks",
    w: 2,
    x: 0,
    y: 0,
    data: "top_songs_4week",
    graphType: "ImageGraph",
    graphSettings: {},
  },
  {
    h: 1,
    i: "Top Artists of last 4 weeks",
    w: 2,
    x: 0,
    y: 3,
    data: "top_artists_4week",
    graphType: "ImageGraph",
    graphSettings: {},
  },
  {
    h: 1,
    i: "Recent songs",
    w: 3,
    x: 2,
    y: 0,
    data: "recent_songs",
    graphType: "ImageGraph",
    graphSettings: {},
  },
  {
    h: 1,
    i: "Saved Songs",
    w: 1,
    x: 4,
    y: 1,
    data: "saved_songs",
    graphType: "ImageGraph",
    graphSettings: {},
  },
  {
    h: 1,
    i: "Followed Artists",
    w: 2,
    x: 2,
    y: 1,
    data: "followed_artists",
    graphType: "ImageGraph",
    graphSettings: {},
  },
  {
    h: 1,
    i: "Saved Albums",
    w: 2,
    x: 0,
    y: 2,
    data: "saved_albums",
    graphType: "ImageGraph",
    graphSettings: {},
  },
  {
    i: "Sample Pie",
    graphType: "Pie",
    data: "pie1",
    graphSettings: { graphTheme: "category10" },
    x: 3,
    y: 2,
    w: 1,
    h: 1,
  },
  {
    i: "Sample Bar",
    graphType: "Bar",
    data: "bar1",
    graphSettings: {
      graphKeys: ["degrees"],
      graphIndexBy: "day",
      graphTheme: "category10",
    },
    x: 2,
    y: 2,
    w: 1,
    h: 1,
  },
  {
    i: "Followers",
    graphType: "Line",
    data: "followers",
    graphSettings: {
      xName: "date",
      yName: "Followers",
      graphTheme: "spectral",
    },
    x: 4,
    y: 2,
    w: 1,
    h: 1,
  },
  {
    i: "Saved Playlists",
    graphType: "ImageGraph",
    data: "saved_playlists",
    graphSettings: {},
    x: 0,
    y: 1,
    w: 2,
    h: 1,
  },
];

async function fetchBackendDatas() {
  const response = await axios.get("http://127.0.0.1:5000/statistics", {
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
      console.log(
        "Layout " + key + " (should be " + layoutNumber + " ) stored as"
      );
      console.log(storingLayout);
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

  //Get correct initial layout when initialized
  useEffect(() => {
    setLayout(getFromLS(layoutNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedPullingData]);

  //Get data from server & set top song/artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("getting");
        const data = await fetchBackendDatas();

        //Log data in console to view
        try {
          const objData = {
            top_artists: JSON.parse(data.top_artists),
            top_songs: JSON.parse(data.top_songs),
            recent_history: JSON.parse(data.recent_history),
            saved_songs: JSON.parse(data.saved_songs),
            saved_albums: JSON.parse(data.saved_albums),
            followed_artists: JSON.parse(data.followed_artists),
            layout_data: JSON.parse(data.layout_data),
            follower_data: data.follower_data,
            saved_playlists: JSON.parse(data.saved_playlists),
          };
          console.log(objData);
        } catch (e) {}

        //Try catch for each data for parsing failure when data field empty
        try {
          setTopArtists(JSON.parse(data.top_artists));
        } catch (e) {
          console.log("Top Artist empty");
        }
        try {
          setTopSongs(JSON.parse(data.top_songs));
        } catch (e) {
          console.log("Top Song empty");
        }
        try {
          setRecentSongs(JSON.parse(data.recent_history));
        } catch (e) {
          console.log("Recent songs empty");
        }

        try {
          setSavedSongs(JSON.parse(data.saved_songs));
        } catch (e) {
          console.log("Saved Songs empty");
        }

        try {
          setSavedAlbums(JSON.parse(data.saved_albums));
        } catch (e) {
          console.log("Saved Albums empty");
        }

        try {
          setSavedPlaylists(JSON.parse(data.saved_playlists));
        } catch (e) {
          console.log("Saved Playlists empty");
        }

        try {
          setFollowedArtists(JSON.parse(data.followed_artists));
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
          const layout_data = JSON.parse(data.layout_data);
          let newLayouts = layout_data.layouts;
          console.log(newLayouts);

          for (let i = 0; i < 3; i++) {
            setlayoutNumber(i + 1);
            saveToLS(i + 1, newLayouts[i]);
          }
          if (layout_data.defaultLayout === "") {
          } else {
            setlayoutNumber(parseInt(layout_data.defaultLayout));
            console.log(parseInt(layout_data.defaultLayout));
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
    const fetchAdvancedData = async () => {
      try {
      } catch {}
    };
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

    if (newGraph.graphType === "VertBar") {
      newGraph.graphSettings = Object.assign(
        { graphKeys: ["degrees"], graphIndexBy: "day" },
        newGraph.graphSettings
      );
    } else if (newGraph.graphType === "Line") {
      if (newGraph.data === "followers") {
        newGraph.graphSettings = Object.assign(
          { xName: "date", yName: "Followers" },
          newGraph.graphSettings
        );
      } else {
        newGraph.graphSettings = Object.assign(
          { xName: "transportation", yName: "Count" },
          newGraph.graphSettings
        );
      }
    }

    console.log("New Layout item added:");
    console.log(newGraph);
    AddContainer(newGraph);
  };

  function getData(dataName) {
    try {
      switch (dataName) {
        case "bar1":
          return bar1;
        case "line1":
          return line1;
        case "pie1":
          return pie1;
        case "pie2":
          return pie2;
        case "top_songs_4week":
          return topSongs[0];
        case "top_songs_6month":
          return topSongs[1];
        case "top_songs_all":
          return topSongs[2];
        case "top_artists_4week":
          return topArtists[0];
        case "top_artists_6month":
          return topArtists[1];
        case "top_artists_all":
          return topArtists[2];
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
        default:
          return null;
      }
    } catch (e) {
      console.log(e);
      return "";
    }
  }

  if (!finishedPullingData) {
    return <>Still Loading...</>;
  } else if (!finishedPullingAdvancedData) {
    return <>Loading Advanced Data...</>;
  }

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
                data-tooltip-id="title-tooltip"
                data-tooltip-content={
                  container.graphType + " of " + container.data
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
              <Tooltip id="title-tooltip" />
            </div>
            {container.graphType === "VertBar" ? (
              <BarGraph
                data={getData(container.data)}
                dataName={container.data}
                graphKeys={container.graphSettings.graphKeys}
                graphIndexBy={container.graphSettings.graphIndexBy}
                graphTheme={container.graphSettings.graphTheme}
                hortAxisTitle={container.graphSettings.hortAxisTitle}
                vertAxisTitle={container.graphSettings.vertAxisTitle}
                legendEnabled={container.graphSettings.legendEnabled}
              />
            ) : container.graphType === "Line" ? (
              <LineGraph
                data={getData(container.data)}
                dataName={container.data}
                graphTheme={container.graphSettings.graphTheme}
                hortAxisTitle={container.graphSettings.hortAxisTitle}
                vertAxisTitle={container.graphSettings.vertAxisTitle}
                legendEnabled={container.graphSettings.legendEnabled}
              />
            ) : container.graphType === "Pie" ? (
              <PieGraph
                data={getData(container.data)}
                dataName={container.data}
                graphTheme={container.graphSettings.graphTheme}
                legendEnabled={container.graphSettings.legendEnabled}
              />
            ) : container.graphType === "ImageGraph" ? (
              <ImageGraph
                data={getData(container.data)}
                dataName={container.data}
                clickAction={container.graphSettings.clickAction}
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
