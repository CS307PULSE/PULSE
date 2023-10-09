import React, { useState } from "react";
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";
import { BarGraph, LineGraph, PieGraph, data1, data2, data3 } from "./Graphs";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const GraphContainer = styled.div`
  background: #f5f5f5;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const defaultLayout = [
  {
    i: "bar1",
    graphType: "Bar",
    data: data1,
    graphSettings: { graphKeys: ["degrees"], graphIndexBy: "day" },
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "bar2",
    graphType: "Bar",
    data: data1,
    graphSettings: { graphKeys: ["degrees"], graphIndexBy: "day" },
    x: 1,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "pie1",
    graphType: "Pie",
    data: data3,
    GraphSettigngs: {},
    x: 2,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "line1",
    graphType: "Line",
    data: data2,
    graphSettings: { xName: "transportation", yName: "Count" },
    x: 3,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: "line2",
    graphType: "Line",
    data: data2,
    graphSettings: { xName: "transportation", yName: "Count" },
    x: 0,
    y: 1,
    w: 1,
    h: 1,
  },
];

export default function GraphGrid() {
  const [layout, setLayout] = useState(defaultLayout);
  const [layoutNumber, setlayoutNumber] = useState(1);

  const RemoveContainer = (containerName) => {
    let updatedLayout = layout;
    updatedLayout = updatedLayout.filter((item) => item.i !== containerName);
    setLayout(updatedLayout);
  };

  const AddContainer = (container) => {
    setLayout([...layout, container]);
  };

  //Database functions
  function getFromLS(key) {
    const storedLayout = localStorage.getItem(key);
    try {
      const newLayout = JSON.parse(storedLayout);
      if (newLayout == null) {
        throw new Error("null layout");
      }
      setLayout(newLayout);
      console.log("loading");
      console.log(newLayout);
      return newLayout;
    } catch (e) {
      console.log(e);
      console.log("created new layout");
      saveToLS();
      return defaultLayout;
    }
  }

  const saveToLS = (storingLayout) => {
    console.log("saving");
    console.log(storingLayout);
    localStorage.setItem(layoutNumber, JSON.stringify(storingLayout));
  };

  const handleSaveButtonClick = () => {
    saveToLS(layout);
  };

  const handleLoadButtonClick = (saveNumber) => {
    setlayoutNumber(saveNumber);
    setLayout(getFromLS(layoutNumber));
  };

  const handleLayoutChange = (layoutA, allLayouts) => {
    let updatedLayout = [];
    for (let container of layout) {
      const copyContainer = allLayouts.lg.find(
        (tempContainer) => tempContainer.i === container.i
      );
      container["x"] = copyContainer.x;
      container["y"] = copyContainer.y;
      container["w"] = copyContainer.w;
      container["h"] = copyContainer.h;
      updatedLayout.push(container);
    }
    setLayout(updatedLayout);
    console.log("current layout");
    console.log(updatedLayout);
  };

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
          <GraphContainer key={container.i} className="grid-cell">
            <div>
              <div>{container.i}</div>
              <CloseButton onClick={() => RemoveContainer(container.i)}>
                X
              </CloseButton>
            </div>
            {container.graphType === "Bar" ? (
              <BarGraph
                data={container.data}
                graphKeys={container.graphSettings.graphKeys}
                graphIndexBy={container.graphSettings.graphIndexBy}
              />
            ) : container.graphType === "Line" ? (
              <LineGraph
                data={container.data}
                xName={container.graphSettings.xName}
                yName={container.graphSettings.yName}
              />
            ) : container.graphType === "Pie" ? (
              <PieGraph data={container.data} />
            ) : (
              <p> No Graph </p>
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
    </React.Fragment>
  );
}
