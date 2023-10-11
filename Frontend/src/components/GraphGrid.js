import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  BarGraph,
  LineGraph,
  PieGraph,
  TopGraph,
  line1,
  bar1,
  pie1,
  pie2,
} from "./Graphs";
import Popup from "./Popup";
import "react-resizable/css/styles.css";
import axios from "axios";
import tempData from "./tempDataFile.js";

const ResponsiveGridLayout = WidthProvider(Responsive);

//Default layout so that page does not look empty
const defaultLayout = [
  {
    i: "bar1",
    graphType: "Bar",
    data: "bar1",
    graphSettings: {
      graphKeys: ["degrees"],
      graphIndexBy: "day",
      graphTheme: "accent",
    },
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "bar2",
    graphType: "Bar",
    data: "bar1",
    graphSettings: {
      graphKeys: ["degrees"],
      graphIndexBy: "day",
      graphTheme: "accent",
    },
    x: 1,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "pie1",
    graphType: "Pie",
    data: "pie1",
    graphSettings: { graphTheme: "accent" },
    x: 2,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "line1",
    graphType: "Line",
    data: "line1",
    graphSettings: {
      xName: "transportation",
      yName: "Count",
      graphTheme: "accent",
    },
    x: 3,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "line2",
    graphType: "Line",
    data: "line1",
    graphSettings: {
      xName: "transportation",
      yName: "Count",
      graphTheme: "accent",
    },
    x: 0,
    y: 1,
    w: 1,
    h: 1,
  },
];

async function fetchBackendDatas() {
  const response = await axios.get("http://127.0.0.1:5000/statistics");
  const data = response.data;
  console.log(data);
  return data;
}

/*
async function sendLayouts(layouts, defaultLayout) {
  const response = await axios.post(
    "http://127.0.0.1:5000/statistics/layouts",
    {
      layouts: layouts,
      defaultLayout: defaultLayout,
    }
  );
  const data = response.data;
  return data;
}
*/

export default function GraphGrid() {
  //UseStates for layout setting
  const [layout, setLayout] = useState(defaultLayout);
  const [graphNames, setGraphNames] = useState([]);
  const [layoutNumber, setlayoutNumber] = useState(1);

  //Top data
  const [topArtists, setTopArtists] = useState();
  const [topSongs, setTopSongs] = useState();

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

  //Get layout from local storage
  function getFromLS(key) {
    //Try-catch to set layout to default one if recieved empty layout
    try {
      const storedLayout = localStorage.getItem(key);
      const newLayout = JSON.parse(storedLayout);
      if (newLayout == null) {
        throw new Error("null layout");
      }
      return newLayout;
    } catch (e) {
      console.log(e);
      saveToLS(defaultLayout);
      return defaultLayout;
    }
  }

  //Send layout to local storage
  const saveToLS = (storingLayout) => {
    try {
      localStorage.setItem(layoutNumber, JSON.stringify(storingLayout));
    } catch (e) {
      alert(e);
    }
  };

  //Function for save button
  const handleSaveButtonClick = () => {
    saveToLS(layout);
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
      const copyContainer = allLayouts.lg.find(
        (tempContainer) => tempContainer.i === container.i
      );
      //Store graph names into an array for new graph use
      graphNames = [...graphNames, container.i];
      //Position data
      container["x"] = copyContainer.x;
      container["y"] = copyContainer.y;
      //Size data
      container["w"] = copyContainer.w;
      container["h"] = copyContainer.h;
      updatedLayout.push(container);
    }
    setGraphNames(graphNames);
    setLayout(updatedLayout);
  };

  //Get correct initial layout when initialized
  useEffect(() => {
    setLayout(getFromLS(layoutNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Get data from server & set top song/artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBackendDatas();
        setTopArtists(JSON.parse(data.top_artists));
        setTopSongs(JSON.parse(data.top_songs));
      } catch (error) {
        alert("Page failed fetching - loading backup data");
        console.error("Error fetching data:", error);
        // Temporary measure to keep things going
        setTopArtists(JSON.parse(tempData.top_artists));
        setTopSongs(JSON.parse(tempData.top_songs));
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
      graphSettings: { graphTheme: newGraphData.graphTheme },
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    };

    if (newGraph.graphType === "Bar") {
      newGraph.graphSettings = Object.assign(
        { graphKeys: ["degrees"], graphIndexBy: "day" },
        newGraph.graphSettings
      );
    } else if (newGraph.graphType === "Line") {
      newGraph.graphSettings = Object.assign(
        { xName: "transportation", yName: "Count" },
        newGraph.graphSettings
      );
    }

    AddContainer(newGraph);
  };

  function getData(dataName) {
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
        console.log(topSongs[0]);
        return topSongs[0];
      case "top_songs_6month":
        return topSongs[1];
      case "top_songs_all":
        return topSongs[2];
      case "top_artists_4week":
        console.log(topArtists[0]);
        return topArtists[0];
      case "top_artists_6month":
        return topArtists[1];
      case "top_artists_all":
        return topArtists[2];
      default:
        return null;
    }
  }

  if (topSongs === undefined) {
    return <>Still Loading...</>;
  }

  return (
    <React.Fragment>
      <ResponsiveGridLayout
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
        rowHeight={300}
        width={"100%"}
        onLayoutChange={handleLayoutChange}
        draggableCancel=".custom-draggable-cancel"
      >
        {layout.map((container) => (
          <div className="graphContainer" key={container.i}>
            <div>
              <div>{container.i}</div>
              <button
                className="GraphCloseButton custom-draggable-cancel"
                onClick={() => RemoveContainer(container.i)}
              >
                X
              </button>
            </div>
            {container.graphType === "Bar" ? (
              <BarGraph
                data={getData(container.data)}
                dataName={container.data}
                graphKeys={container.graphSettings.graphKeys}
                graphIndexBy={container.graphSettings.graphIndexBy}
                graphTheme={container.graphSettings.graphTheme}
              />
            ) : container.graphType === "Line" ? (
              <LineGraph
                data={getData(container.data)}
                dataName={container.data}
                xName={container.graphSettings.xName}
                yName={container.graphSettings.yName}
                graphTheme={container.graphSettings.graphTheme}
              />
            ) : container.graphType === "Pie" ? (
              <PieGraph
                data={getData(container.data)}
                dataName={container.data}
                graphTheme={container.graphSettings.graphTheme}
              />
            ) : container.graphType === "TopGraph" ? (
              <TopGraph
                data={getData(container.data)}
                dataName={container.data}
              />
            ) : (
              <p> Hi</p>
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
