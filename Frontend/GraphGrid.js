import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";

const ResponsiveGridLayout = WidthProvider(Responsive);

const GraphContainer = styled.div`
  background: #f5f5f5;
`;

const Button = styled.button`
  background-color: #3f51b5;
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: #283593;
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

function clickMe() {
  alert("You clicked me!");
}

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
    <>
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
              <div onClick={() => RemoveContainer(container)}>X</div>
            </div>
          </GraphContainer>
        ))}
      </ResponsiveGridLayout>

      <div>
        <Button onClick={AddContainer}>Button</Button>
      </div>
    </>
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
