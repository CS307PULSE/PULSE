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

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    //Reset name to avoid issues
    setGraphName("");

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    let formJson = Object.fromEntries(formData.entries());

    //Modify data for validation
    if (
      formJson.data.includes("top_songs") ||
      formJson.data.includes("top_artists")
    ) {
      formJson["graphType"] = "TopGraph";
    }

    if (validName) {
      onClose();
      console.log(formJson);
      addGraph(formJson);
    } else {
      alert("Invalid graph name! Enter a better name!");
    }
  }

  return (
    <div className="PopupOverlay">
      <div className="PopupContent">
        Add Graph
        <button className="PopupCloseButton" onClick={onClose}>
          X
        </button>
        <form onSubmit={handleSubmit}>
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
            <select name="data" value={data} onChange={changeData}>
              <option value="bar1">Bar1</option>
              <option value="line1">Line1</option>
              <option value="pie1">Pie1</option>
              <option value="pie2">Pie2</option>
              <option value="top_songs_4week">Top Songs of last 4 weeks</option>
              <option value="top_songs_6month">
                Top Songs of last 6 months
              </option>
              <option value="top_songs_all">Top Songs of all time</option>
              <option value="top_artists_4week">
                Top Artists of last 4 weeks
              </option>
              <option value="top_artists_6month">
                Top Artists of last 6 months
              </option>
              <option value="top_artists_all">Top Artists of all time</option>
            </select>
          </div>
          <div>
            Graph Type:{" "}
            <select name="graphType" value={graphType} onChange={changeGraph}>
              <option value="Bar">Bar</option>
              <option value="Line">Line</option>
              <option value="Pie">Pie</option>
            </select>
          </div>
          <div>
            Theme:{" "}
            <select name="theme" value={theme} onChange={changeTheme}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <button className="TypButton" type="submit">
              Generate Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
