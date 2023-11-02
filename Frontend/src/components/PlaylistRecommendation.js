import React, { useEffect, useState } from "react";
import ImageGraph from "./Graphs/ImageGraph";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import { Link } from "react-router-dom";

import { pulseColors } from "../theme/Colors";
import axios from "axios";

import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";
import SongPlayer from "./SongPlayer";

var textSizeSetting, themeSetting;
try {
  var textSizeResponse = await axios.get(
    "http://127.0.0.1:5000/get_text_size",
    { withCredentials: true }
  );
  textSizeSetting = textSizeResponse.data;
  var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {
    withCredentials: true,
  });
  themeSetting = themeResponse.data;
} catch (e) {
  console.log("Formatting settings fetch failed: " + e);
  textSizeSetting = 1;
  themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const searchContainerStyle = {
    display: "flex",
    marginLeft: "30px",
    // justifyContent: 'center',
    marginBottom: "20px",
};

const searchInputStyle = {
    padding: "8px",
    width: "75%",
    display: "flex-grow",
};


const friendContainerStyle = {
  position: "fixed",
  top: 100,
  right: 0,
  width: "20%",
  height: "900",
  backgroundColor: themeColors.background,
};

const buttonContainerStyle = {
  position: "fixed",
  left: 0,
  display: "flex",
  paddingTop: "270px",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  margin: "auto",
  marginTop: "100px",
  height: "auto", // Take up the full height
  width: "70%", // Adjust the width of the button container
};

const buttonStyle = {
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: "20px 40px", // Increase the padding for taller buttons
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: themeColors.text,
  borderRadius: "10px",
  cursor: "pointer",
  margin: "5px",
  width: "70%", // Adjust the width to take up the entire space available
  textAlign: "center", // Center the text horizontally
};


async function fetchBackendDatas() {
    const response = await axios.get("http://127.0.0.1:5000/get_saved_playlists", {
      withCredentials: true,
    });
    const data = response.data;
    console.log(response);
    return data;
}

async function getSongRecommendations(selectedPlaylistID, selectedRecMethod) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/playlist/get_recs",
    { selectedPlaylistID: selectedPlaylistID,
      selectedRecMethod: selectedRecMethod}
  );
  const data = response.data;
  console.log("send the song to be added");
  console.log(response);
  return data;
}

async function sendSongToBeAdded(selectedPlaylistID, selectedSongID) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/playlist/add_song",
    { selectedPlaylistID: selectedPlaylistID,
      selectedSongID : selectedSongID}
  );
  const data = response.data;
  console.log("Got song recommendations for the chosen playlist");
  console.log(response);
  return data;
}


const PlaylistRecommendation = () => {
    const [savedPlaylists, setSavedPlaylists] = useState();
    const [finishedPullingData, setFinished] = useState(false);
    const [selectedPlaylistName, setSelectedPlaylistName] = useState(null);
    const [selectedPlaylistID, setSelectedPlaylistID] = useState(null);
    const [selectedRecMethod, setSelectedRecMethod] = useState("genres");
    const [songRecs, setSongRecs] = useState();
    const [selectedSongID, setSelectedSongID] = useState()
    const [selectedSongName, setSelectedSongName] = useState("No song selected")

  //Get data from server & set top song/artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("getting");
        const data = await fetchBackendDatas();

        //Log data in console to view
        try {
          const objData = {
            saved_playlists: JSON.parse(data.saved_playlists),
          };
          console.log(objData);
        } catch (e) {}

        try {
          setSavedPlaylists(JSON.parse(data.saved_playlists));
        } catch (e) {
          console.log("Saved Playlists empty");
        }


        changeFinishedValue();
      } catch (error) {
        alert("Page failed fetching - would load backup data but we dont got that here");
        console.error("Error fetching data:", error);
        changeFinishedValue();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  function generatePlaylists(masterPlaylists, finishedPullingData) {
    console.log(masterPlaylists)
    if (finishedPullingData) {
        return (
        <div style={{ height: "300px", overflowY: "scroll" }}>
          <ImageGraph data={masterPlaylists} 
                          dataName={"playlists_for_recs"} 
                          selectedPlaylistID = {selectedPlaylistID}
                          setSelectedPlaylistID = {setSelectedPlaylistID}
                          selectedPlaylistName = {selectedPlaylistName}
                          setSelectedPlaylistName = {setSelectedPlaylistName}
                          updateParentState = {updateParentState} />
        </div>
          )
    } else {
        return <p>Please wait while we pull your playlists</p>;
    }
  }

  function generateDropdown(finishedPullingData, selectedPlaylistName) {
    if (finishedPullingData && selectedPlaylistName !== undefined && selectedPlaylistName !== null) {
      return (
        <div>
          <p style={{ display: 'inline', marginRight: '10px' }}>
          Get song recommendations for {selectedPlaylistName} based on:
          </p>
          <select value={selectedRecMethod} onChange={changeSelectedRecMethod}>
          <option value="genres">Genres</option>
          <option value="artists">Artists</option>
          <option value="albums">Albums</option>
          </select>
        </div>
          )
    } else {
      return <p></p>;
    }
  }

  function updateParentState(selectedSongID, selectedSongName, selectedPlaylistID, selectedPlaylistName) {
    if (selectedSongID !== null && selectedSongName !== null) {
      setSelectedSongID(selectedSongID);
      setSelectedSongName(selectedSongName);
    } else {
      setSelectedPlaylistID(selectedPlaylistID);
      setSelectedPlaylistName(selectedPlaylistName)
      console.log("selectedPlaylistID: " + selectedPlaylistID);
      console.log("selectedPlaylistName: " + selectedPlaylistName);
    }
  }

  function generateSongs() {
    console.log("here");
    console.log("selectedPlaylistID: " + selectedPlaylistID);
    console.log("selectedPlaylistName: " + selectedPlaylistName);
    if (finishedPullingData && selectedPlaylistID !== undefined && selectedPlaylistID !== null) {
    getSongRecommendations(selectedPlaylistID, selectedRecMethod).then((data) => {
      console.log("DATA: "+ data);
      if (data !== null && data !== undefined) {
        setSongRecs(data);
      }
    });
    return (
      <div style={{ height: "300px", overflowY: "scroll" }}><ImageGraph data={songRecs} 
                        dataName={"songs_for_recs"} 
                        selectedSongID ={selectedSongID} 
                        setSelectedSongID = {setSelectedSongID}
                        selectedSongName ={selectedSongName} 
                        setSelectedSongName = {setSelectedSongName}
                        updateParentState = {updateParentState} />;
      </div>
    )
    } else if (finishedPullingData) {
      return <p>Please click on a playlist to get recommendations for!</p>
    } else {
        return <p></p>;
    }
  }

  function generateAddSongsButton() {
    if (selectedSongID !== null && selectedSongID !== undefined) {
      return (
        <button
          style={{ ...buttonStyle, textDecoration: 'none' }}
          onClick={() => {
            sendSongToBeAdded(selectedPlaylistID, selectedSongID)
              .then(data => {
                if (!data.success) {
                  alert("This song is already in your playlist");
                }
              });
          }}
        ></button>
      );
    } else {
      return <p></p>
    }
  }


  const changeFinishedValue = () => {
    setFinished(true)
  }
  const changeSelectedRecMethod= (e) => {
    setSelectedRecMethod(e.target.value);
  }

  return (
    <div style={bodyStyle}>
        <Navbar />
        {generatePlaylists(savedPlaylists, finishedPullingData)} 
        {generateDropdown(finishedPullingData, selectedPlaylistName)}
        {generateSongs()} 
        {generateAddSongsButton()}
    </div>
  );
};

export default PlaylistRecommendation;


//TODO: 
//Actual playlist selection
//dropdown
//Second button for adding song to playlist