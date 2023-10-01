import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";
import Popup from "./Popup";

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
    { i: "blue-eyes-dragon", x: 0, y: 0, w: 1, h: 1 },
    { i: "dark-magician", x: 1, y: 0, w: 1, h: 1 },
    { i: "kuriboh", x: 2, y: 0, w: 1, h: 1 },
    { i: "spell-caster", x: 3, y: 0, w: 1, h: 1 },
    { i: "summoned-skull", x: 0, y: 1, w: 1, h: 1 },
  ]);

  const RemoveContainer = (container) => {
    setLayout(layout.filter((i) => i !== container));
  };

  const AddContainer = (container) => {
    setLayout([...layout, container]);
  };

  return (
    <React.Fragment>
      <ResponsiveGridLayout
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
        rowHeight={300}
        width={1000}
      >
        {layout.map((container) => (
          <GraphContainer key={container.i}>
            <div>
              <div>{container.i}</div>
              <CloseButton onClick={() => RemoveContainer(container)}>
                X
              </CloseButton>
            </div>
          </GraphContainer>
        ))}
      </ResponsiveGridLayout>
    </React.Fragment>
  );
}

//Database functions
function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
    } catch (e) {}
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-8",
      JSON.stringify({
        [key]: value,
      })
    );
  }
}

/*
  const getLayouts = () => {
    const savedLayouts = localStorage.getItem("grid-layout");
    return savedLayouts ? JSON.parse(savedLayouts) : { lg: layout };
  };

  const handleLayoutChange = (layout, layouts) => {
    localStorage.setItem("grid-layout", JSON.stringify(layouts));
  };
*/
