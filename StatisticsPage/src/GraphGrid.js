import React, { useState, useEffect } from "react";
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";
import {
  BarGraph,
  LineGraph,
  PieGraph,
  line1,
  bar1,
  pie1,
  pie2,
} from "./Graphs";
import Popup from "./Popup";
import "react-resizable/css/styles.css";
import axios from "axios";

const ResponsiveGridLayout = WidthProvider(Responsive);

//Stylized div for each of the graph containers
const GraphContainer = styled.div`
  background: #f5f5f5;
`;

//Default layout so that page does not look empty
const defaultLayout = [
  {
    i: "bar1",
    graphType: "Bar",
    data: "bar1",
    graphSettings: { graphKeys: ["degrees"], graphIndexBy: "day" },
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "bar2",
    graphType: "Bar",
    data: "bar1",
    graphSettings: { graphKeys: ["degrees"], graphIndexBy: "day" },
    x: 1,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "pie1",
    graphType: "Pie",
    data: "pie1",
    GraphSettigngs: {},
    x: 2,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "line1",
    graphType: "Line",
    data: "line1",
    graphSettings: { xName: "transportation", yName: "Count" },
    x: 3,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "line2",
    graphType: "Line",
    data: "line1",
    graphSettings: { xName: "transportation", yName: "Count" },
    x: 0,
    y: 1,
    w: 1,
    h: 1,
  },
];

/*
async function fetchLayouts() {
  const response = await axios.get("http://127.0.0.1:5000/stats/layouts");
  const data = response.data;
  console.log(data);
  return data;
}

async function sendLayouts(layout) {
  const response = await axios.post(
    "http://127.0.0.1:5000/stats/layouts",
    layout
  );
  const data = response.data;
  console.log(data);
  return data;
}
*/

export default function GraphGrid() {
  //UseStates for layout setting
  const [layout, setLayout] = useState(defaultLayout);
  const [graphNames, setGraphNames] = useState([]);
  const [layoutNumber, setlayoutNumber] = useState(1);

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
    const storedLayout = localStorage.getItem(key);

    //Try-catch to set layout to default one if recieved empty layout
    try {
      const newLayout = JSON.parse(storedLayout);
      if (newLayout == null) {
        throw new Error("null layout");
      }
      return newLayout;
    } catch (e) {
      saveToLS(defaultLayout);
      return defaultLayout;
    }
  }

  //Send layout to local storage
  const saveToLS = (storingLayout) => {
    localStorage.setItem(layoutNumber, JSON.stringify(storingLayout));
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
    //console.log(JSON.stringify(updatedLayout));
    setLayout(updatedLayout);
  };

  //Get correct initial layout when initialized
  useEffect(() => {
    setLayout(getFromLS(layoutNumber));
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
      graphSettings: {},
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    };

    if (newGraph.graphType === "Bar") {
      newGraph.graphSettings = { graphKeys: ["degrees"], graphIndexBy: "day" };
    } else if (newGraph.graphType === "Line") {
      newGraph.graphSettings = { xName: "transportation", yName: "Count" };
    }

    AddContainer(newGraph);
  };

  function getData(dataName) {
    if (dataName === "bar1") {
      return bar1;
    } else if (dataName === "line1") {
      return line1;
    } else if (dataName === "pie1") {
      return pie1;
    } else if (dataName === "pie2") {
      return pie2;
    }

    return null;
  }

  return (
    <React.Fragment>
      <ResponsiveGridLayout
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
        rowHeight={300}
        width={1000}
        onLayoutChange={handleLayoutChange}
      >
        {layout.map((container) => (
          <GraphContainer key={container.i}>
            <div>
              <div>{container.i}</div>
              <button
                className="GraphCloseButton"
                onClick={() => RemoveContainer(container.i)}
              >
                X
              </button>
            </div>
            {container.graphType === "Bar" ? (
              <BarGraph
                data={getData(container.data)}
                graphKeys={container.graphSettings.graphKeys}
                graphIndexBy={container.graphSettings.graphIndexBy}
              />
            ) : container.graphType === "Line" ? (
              <LineGraph
                data={getData(container.data)}
                xName={container.graphSettings.xName}
                yName={container.graphSettings.yName}
              />
            ) : container.graphType === "Pie" ? (
              <PieGraph data={getData(container.data)} />
            ) : container.graphType === "Text" ? (
              <p> {container.graphType} </p>
            ) : (
              <p> Hi</p>
            )}
          </GraphContainer>
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
