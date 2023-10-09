import React, { useState } from "react";

//Popup passing through open and close functions
export default function Popup({ isOpen, onClose, addGraph, graphNames }) {
  //Use states for data to be read from when generating new graph container
  const [graphName, setGraphName] = useState("");
  const [data, setData] = useState("top");
  const [graphType, setGraph] = useState("line");
  const [theme, setTheme] = useState("dark");
  const [validName, setValidName] = useState(false);

  if (!isOpen) return null; //Don't do anything when not open

  //Functions to change data vars from input fields
  const changeGraphName = (e) => {
    //Replace special characters w/ null
    const regexName = e.target.value.replace(/[^\w\s]/gi, "");
    if (
      graphNames.some((element) => {
        return element === regexName;
      })
    ) {
      setValidName(false);
    } else {
      setValidName(true);
    }
    setGraphName(regexName);
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
          <input
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
              if (validName) {
                addGraph({ data, graphType, theme });
                onClose();
              } else {
                alert("Pick a new name!");
              }
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
