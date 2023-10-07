import styled from "styled-components";
import React, { useState } from "react";

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  max-width: 80%;
`;

const CloseButton = styled.span`
  position: relative;
  top: -10px;
  right: -40px;
  cursor: pointer;
`;

export default function Popup({ isOpen, onClose }) {
  const [data, setData] = useState("top");
  const [graphType, setGraph] = useState("line");
  const [theme, setTheme] = useState("dark");

  if (!isOpen) return null;

  const changeData = (e) => {
    setData(e.target.data);
  };

  const changeGraph = (e) => {
    setGraph(e.target.graphType);
  };

  const changeTheme = (e) => {
    setTheme(e.target.theme);
  };

  return (
    <PopupOverlay>
      <PopupContent>
        Add Graph
        <CloseButton onClick={onClose}>X</CloseButton>
        <div>
          Data:{" "}
          <select value={data} onChange={changeData}>
            <option value="top">Top</option>
            <option value="bottom">bottom</option>
          </select>
        </div>
        <div>
          Graph Type:{" "}
          <select value={graphType} onChange={changeGraph}>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="pie">pie</option>
          </select>
        </div>
        <div>
          Theme:{" "}
          <select value={theme} onChange={changeTheme}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </PopupContent>
    </PopupOverlay>
  );
}
