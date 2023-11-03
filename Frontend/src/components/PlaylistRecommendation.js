import React, { useEffect, useState } from "react";
import ImageGraph from "./Graphs/ImageGraph";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import FriendsCard from "./FriendsCard";
import TextSize from "../theme/TextSize";
import axios from "axios";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";

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

async function sendSongToBeAdded(selectedPlaylistID, selectedSongURI) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/playlist/add_song",
    { selectedPlaylistID: selectedPlaylistID,
      selectedSongURI : selectedSongURI}
  );
  const data = response.data;
  console.log("Got song recommendations for the chosen playlist");
  console.log(response);
  return data;
}

const bodyStyle = {
  backgroundColor: state.colorBackground
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
  backgroundColor: state.colorBackground,
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
  backgroundColor: state.colorBackground,
  color: state.colorButton,
  padding: "20px 40px", // Increase the padding for taller buttons
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: state.colorText,
  borderRadius: "10px",
  cursor: "pointer",
  margin: "5px",
  width: "70%", // Adjust the width to take up the entire space available
  textAlign: "center", // Center the text horizontally
};


const PlaylistRecommendation = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [savedPlaylists, setSavedPlaylists] = useState();
  const [finishedPullingData, setFinished] = useState(false);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(null);
  const [selectedPlaylistID, setSelectedPlaylistID] = useState(null);
  const [refreshSongRecs, setRefreshSongRecs] = useState(false)
  const [selectedRecMethod, setSelectedRecMethod] = useState("genres");
  const [songRecs, setSongRecs] = useState(null);
  const [selectedSongURI, setselectedSongURI] = useState()
  const [selectedSongName, setSelectedSongName] = useState("No song selected")
  const [finishedGettingSongs, setFinishedGettingSongs] = useState(false);

  //Get data from server & set top song/artists
  useEffect(() => {
    const fetchData = async () => {
      if (!finishedPullingData) {
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
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generatePlaylists(masterPlaylists, finishedPullingData) {
    console.log("not fetching but print playlists")
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
                          setRefreshSongRecs = {setRefreshSongRecs}
                          updateParentState = {updateParentState} />
        </div>
          )
    } else {
        return <p>Please wait while we pull your playlists</p>
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
      return <p></p>
    }
  }

  function updateParentState(selectedSongURI, selectedSongName, selectedPlaylistID, selectedPlaylistName, refreshSongRecs) {
    if (selectedSongURI !== null && selectedSongName !== null) {
      setselectedSongURI(selectedSongURI);
      setSelectedSongName(selectedSongName);
    } else if (selectedPlaylistID !== null && selectedPlaylistName !== null){
      setSelectedPlaylistID(selectedPlaylistID);
      setSelectedPlaylistName(selectedPlaylistName)
      console.log("selectedPlaylistID: " + selectedPlaylistID);
      console.log("selectedPlaylistName: " + selectedPlaylistName);
    } 
    console.log("your right here mf")
  }

  function generateSongs() {
    console.log("here");
    console.log("selectedPlaylistID: " + selectedPlaylistID);
    console.log("selectedPlaylistName: " + selectedPlaylistName);
    if (finishedPullingData && selectedPlaylistID !== undefined && selectedPlaylistID !== null && refreshSongRecs) {
      getSongRecommendations(selectedPlaylistID, selectedRecMethod).then((data) => {
        console.log("In getSongRecommendations");
        console.log(data);
        if (data !== null && data !== undefined) {
  

          setSongRecs(data);
          setFinishedGettingSongs(true);
          setRefreshSongRecs(false);
        }
      });
      if (!setFinishedGettingSongs) {
        return <p>Getting recs</p>
      }
      console.log("Before graph");
      console.log(songRecs);
      return (
        <div style={{ height: "300px", overflowY: "scroll" }}><ImageGraph data={songRecs} 
                          dataName={"songs_for_recs"} 
                          selectedSongURI ={selectedSongURI} 
                          setselectedSongURI = {setselectedSongURI}
                          selectedSongName ={selectedSongName} 
                          setSelectedSongName = {setSelectedSongName}
                          updateParentState = {updateParentState} />
        </div>
      )
    } else if (songRecs !== null) {
      console.log("Before graph 2");
      console.log(songRecs);
      return (
        <div style={{ height: "300px", overflowY: "scroll" }}><ImageGraph data={songRecs} 
                          dataName={"songs_for_recs"} 
                          selectedSongURI ={selectedSongURI} 
                          setselectedSongURI = {setselectedSongURI}
                          selectedSongName ={selectedSongName} 
                          setSelectedSongName = {setSelectedSongName}
                          updateParentState = {updateParentState} />
        </div>
      )
    } else if (finishedPullingData && selectedPlaylistID === null) {
        return <p>Please click on a playlist to get recommendations for!</p>
    } else {
        return <p></p>
    }
  }

  function generateAddSongsButton() {
    if (selectedSongURI !== null && selectedSongURI !== undefined) {
      return (
        <button
          style={{ ...buttonStyle, textDecoration: 'none' }}
          onClick={() => {
            sendSongToBeAdded(selectedPlaylistID, selectedSongURI)
              .then(data => {
                if (data !== "Added track!") {
                  alert("This song could not be added");
                }
              });
          }}
        >Add "{selectedSongName}" to {selectedPlaylistName}</button>
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
    setRefreshSongRecs(true)
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        {generatePlaylists(savedPlaylists, finishedPullingData)} 
        {generateDropdown(finishedPullingData, selectedPlaylistName)}
        {generateSongs()} 
        {generateAddSongsButton()}
      </div>
      <div className="footer"><SongPlayer /></div>
    </div>
  );
};

export default PlaylistRecommendation;


//TODO: 
//Actual playlist selection
//dropdown
//Second button for adding song to playlist