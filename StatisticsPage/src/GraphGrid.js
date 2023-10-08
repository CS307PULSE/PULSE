import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
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

export default function GraphGrid() {
  const [layout, setLayout] = useState([
    {
      i: "blue-eyes-dragon",
      graphType: "Bar",
      data: data1,
      graphSettings: { graphKeys: ["degrees"], graphIndexBy: "day" },
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    },
    {
      i: "dark-magician",
      graphType: "Bar",
      data: data1,
      graphSettings: { graphKeys: ["degrees"], graphIndexBy: "day" },
      x: 1,
      y: 0,
      w: 1,
      h: 1,
    },
    {
      i: "kuriboh",
      graphType: "Pie",
      data: data3,
      GraphSettigngs: {},
      x: 2,
      y: 0,
      w: 1,
      h: 1,
    },
    {
      i: "spell-caster",
      graphType: "Line",
      data: data2,
      graphSettings: { xName: "transportation", yName: "Count" },
      x: 3,
      y: 0,
      w: 1,
      h: 1,
    },
    {
      i: "summoned-skull",
      graphType: "Line",
      data: data2,
      graphSettings: { xName: "transportation", yName: "Count" },
      x: 0,
      y: 1,
      w: 1,
      h: 1,
    },
  ]);

  const [loadoutNumber, setLoadoutNumber] = useState(1);

  const RemoveContainer = (container) => {
    setLayout(layout.filter((i) => i !== container));
  };

  const AddContainer = (container) => {
    setLayout([...layout, container]);
  };

  //Database functions
  function getFromLS(key) {
    const storedLayout = localStorage.getItem(key);
    return storedLayout ? JSON.parse(storedLayout) : { lg: layout };
  }

  const saveToLS = (layout, layouts) => {
    console.log(layouts);
    localStorage.setItem(loadoutNumber, JSON.stringify(layouts));
  };

  const handleSaveButtonClick = () => {
    saveToLS(layout, layout);
  };

  return (
    <React.Fragment>
      <ResponsiveGridLayout
        layouts={getFromLS(loadoutNumber)}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
        rowHeight={300}
        width={1000}
        onLayoutChange={saveToLS}
      >
        {layout.map((container) => (
          <GraphContainer key={container.i} className="grid-cell">
            <div>
              <div>{container.i}</div>
              <CloseButton onClick={() => RemoveContainer(container)}>
                X
              </CloseButton>
            </div>
            {container.graphType == "Bar" ? (
              <BarGraph
                data={container.data}
                graphKeys={container.graphSettings.graphKeys}
                graphIndexBy={container.graphSettings.graphIndexBy}
              />
            ) : container.graphType == "Line" ? (
              <LineGraph
                data={container.data}
                xName={container.graphSettings.xName}
                yName={container.graphSettings.yName}
              />
            ) : container.graphType == "Pie" ? (
              <PieGraph data={container.data} />
            ) : (
              <p> No Graph </p>
            )}
          </GraphContainer>
        ))}
      </ResponsiveGridLayout>
      <div>
        <button onClick={() => setLoadoutNumber(1)}>Load 1</button>
        <button onClick={() => setLoadoutNumber(2)}>Load 2</button>
      </div>
    </React.Fragment>
  );
}
