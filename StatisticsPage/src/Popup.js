import React, { useState } from "react";

//Popup passing through open and close functions
export default function Popup({ isOpen, onClose, addGraph }) {
  //Use states for data to be read from when generating new graph container
  const [graphName, setGraphName] = useState("");
  const [data, setData] = useState("top");
  const [graphType, setGraph] = useState("line");
  const [theme, setTheme] = useState("dark");

  if (!isOpen) return null; //Don't do anything when not open

  //Functions to change data vars from input fields
  const changeGraphName = (e) => {
    setGraphName(e.target.value);
  };
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
    <div className="PopupOverlay">
      <div className="PopupContent">
        Add Graph
        <button className="PopupCloseButton" onClick={onClose}>
          X
        </button>
        <div>
          <textarea
            name="graphName"
            rows={1}
            cols={20}
            className="nameField"
            value={graphName}
            onChange={changeGraphName}
            placeholder="Graph Name"
            required={true}
          />
        </div>
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
        <div>
          <button
            className="TypButton"
            onClick={() => {
              addGraph({ data, graphType, theme });
              onClose();
            }}
          >
            {" "}
            Generate Graph{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
