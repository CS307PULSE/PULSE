import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";
import BarGraph from "./Graphs";

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
    { i: "blue-eyes-dragon", graph: <BarGraph />, x: 0, y: 0, w: 1, h: 1 },
    { i: "dark-magician", graph: <BarGraph />, x: 1, y: 0, w: 1, h: 1 },
    { i: "kuriboh", graph: <BarGraph />, x: 2, y: 0, w: 1, h: 1 },
    { i: "spell-caster", graph: <BarGraph />, x: 3, y: 0, w: 1, h: 1 },
    { i: "summoned-skull", graph: <BarGraph />, x: 0, y: 1, w: 1, h: 1 },
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
    localStorage.setItem(loadoutNumber, JSON.stringify(layouts));
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
          <GraphContainer key={container.i}>
            <div>
              <div>{container.i}</div>
              <CloseButton onClick={() => RemoveContainer(container)}>
                X
              </CloseButton>
            </div>
            {container.graph}
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
