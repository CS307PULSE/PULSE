import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "./Context";
import { pulseColors } from "../theme/Colors";
import TextSize from "../theme/TextSize";

function SongPlayer() {
  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [volumeLevel, setVolumeLevel] = useState("");
  const [playState, setPlayState] = useState();
  const [expanded, setExpanded] = useState(false);

  const images = {
    playButton: "https://cdn-icons-png.flaticon.com/512/3318/3318660.png",
    pauseButton: "https://cdn-icons-png.flaticon.com/512/8286/8286763.png",
    nextButton: "https://cdn-icons-png.flaticon.com/512/7030/7030549.png",
    prevButton: "https://cdn-icons-png.flaticon.com/512/3318/3318703.png",
    repeatButton: "https://cdn-icons-png.flaticon.com/512/5355/5355955.png",
    shuffleButton: "https://cdn-icons-png.flaticon.com/512/5356/5356895.png",
  };
  const songPlayerStyle = {
    position: "fixed",
    bottom: "0",
    padding: "0px",
    margin: "0px",
    backgroundColor: pulseColors.lightOffGrey,
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "60px", // Set height to 100vh to cover the entire height of the screen
    display: "flex",
  };
  const songPlayerButtonStyle = {
    width: "auto",
    height: "40px",
    margin: "10px",
  };
  const volumeSliderStyle = {
    width: "10%",
    height: "40px",
    margin: "10px auto",
    position: "absolute",
    right: "30px",
  };
  const expandedPlayerStyle = {
    width: "auto",
    height: "100%",
    margin: "10px",
  }

  function nextSong() { //Nexting
    axios
      .get("http://127.0.0.1:5000/player/skip", { withCredentials: true })
      .then((response) => {
        console.log("Song nexted successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error skipping song:", error);
      });
  }
  function previousSong() { //Preving
    axios
      .get("http://127.0.0.1:5000/player/prev", { withCredentials: true })
      .then((response) => {
        console.log("Song preved successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error preving song:", error);
      });
  }
  function toggleRepeat() {
    axios
      .get("http://127.0.0.1:5000/player/repeat", { withCredentials: true })
      .then((response) => {
        console.log("Repeat toggled successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error toggling repeat:", error);
      });
  }
  function toggleShuffle() {
    axios
      .get("http://127.0.0.1:5000/player/shuffle", { withCredentials: true })
      .then((response) => {
        console.log("Shuffle toggled successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error toggling repeat:", error);
      });
  }

  useEffect(() => {
    if (playState === undefined) {
    } else if (playState) {
      //Play and pause
      axios
        .get("http://127.0.0.1:5000/player/play", { withCredentials: true })
        .then((response) => {
          // Handle the response from the backend if needed
          // console.log("Song played successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error playing song:", error);
        });
      document.getElementById("playButton").src = images.pauseButton;
    } else {
      axios
        .get("http://127.0.0.1:5000/player/pause", { withCredentials: true })
        .then((response) => {
          // Handle the response from the backend if needed
          // console.log("Song paused successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error pausing song:", error);
        });
      document.getElementById("playButton").src = images.playButton;
    }
  }, [playState]);

  async function saveVolume(volumeParameter) {
    //Set volume
    console.log("Attempting volume post with value " + volumeParameter);
    setVolumeLevel(volumeParameter);
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "http://127.0.0.1:5000/player/volume",
      {
        volume: volumeParameter,
      }
    );
    const data = response.data;
    return data;
  }
  if (expanded) { return (
    <div style={expandedPlayerStyle}>

    </div>
  );
  } else { return (
    <div style={songPlayerStyle}>
      <img id="prevButton" style={songPlayerButtonStyle} src={images.prevButton} onClick={() => {previousSong()}} alt="Previous Song"></img>
      <img id="playButton" style={songPlayerButtonStyle} src={images.playButton} onClick={() => {
          if (playState === undefined) {
            setPlayState(true);
          } else {
            setPlayState(!playState);
          }
        }}
        alt="Play Song"
      ></img>
      <img id="nextButton" style={songPlayerButtonStyle} src={images.nextButton} onClick={() => {nextSong()}} alt="Next Song"></img>
      <img id="repeatButton" style={songPlayerButtonStyle} src={images.repeatButton} onClick={() => {toggleRepeat(true)}} alt="Repeat"></img>
      <img id="shuffleButton" style={songPlayerButtonStyle} src={images.shuffleButton} onClick={() => {toggleShuffle(true)}} alt="Shuffle"></img>
      <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value={volumeLevel} step="1" onChange={(e) => saveVolume(e.target.value)}></input>
    </div>
  );
  }
}
export default SongPlayer;
