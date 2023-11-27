import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "./Context";
import { pulseColors } from "../theme/Colors";
import TextSize from "../theme/TextSize";

function SongPlayer() {
  const { state, dispatch } = useAppContext();

  const [volumeLevel, setVolumeLevel] = useState("");
  // const [timestamp, setTimestamp] = useState('');
  const [playState, setPlayState] = useState();
  const [nextState, setNextState] = useState(false);
  const [prevState, setPrevState] = useState(false);
  const [repeatState, setRepeatState] = useState(false);
  const [shuffleState, setShuffleState] = useState(false);

  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

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
  const playbackSliderStyle = {
    width: "40%",
    height: "40px",
    margin: "10px auto",
    position: "absolute",
    right: "15%",
  };
  const volumeSliderStyle = {
    width: "10%",
    height: "40px",
    margin: "10px auto",
    position: "absolute",
    right: "30px",
  };
  const infoContainerStyle = {
    padding: "10px",
    width: "20%",
  };
  const songNameTextStyle = {
    color: pulseColors.black,
    fontSize: textSizes.body,
    fontWeight: "bold",
    margin: "0px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  };
  const artistNameTextStyle = {
    color: pulseColors.black,
    fontSize: textSizes.body,
    margin: "0px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  };
  const deviceDropdownStyle = {
    color: pulseColors.white,
    width: "120px",
    height: "30px",
    backgroundColor: pulseColors.black,
  };

  useEffect(() => {
    //Nexting
    if (nextState) {
      axios
        .get("/player/skip", { withCredentials: true })
        .then((response) => {
          // Handle the response from the backend if needed
          // console.log("Song skipping successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error skipping song:", error);
        });
      setPlayState(true);
    }
    setNextState(false);
  }, [nextState]);

  useEffect(() => {
    //Preving
    if (prevState) {
      axios
        .get("/player/prev", { withCredentials: true })
        .then((response) => {
          // Handle the response from the backend if needed
          console.log("Song preved successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error preving song:", error);
        });
      setPlayState(true);
    }
    setPrevState(false);
  }, [prevState]);

  useEffect(() => {
    //Repeat
    if (repeatState) {
      axios
        .get("/player/repeat", { withCredentials: true })
        .then((response) => {
          // Handle the response from the backend if needed
          // console.log("Repeat toggled successful:", response.data);
        })
        .catch((error) => {
          console.error("Error toggling repeat:", error);
        });
    }
    setRepeatState(false);
  }, [repeatState]);

  useEffect(() => {
    //Shuffle
    if (shuffleState) {
      axios
        .get("/player/shuffle", { withCredentials: true })
        .then((response) => {
          // Handle the response from the backend if needed
          // console.log("Shuffle toggled successful:", response.data);
        })
        .catch((error) => {
          console.error("Error toggling repeat:", error);
        });
    }
    setShuffleState(false);
  }, [shuffleState]);

  useEffect(() => {
    if (playState === undefined) {
    } else if (playState) {
      //Play and pause
      axios
        .get("/player/play", { withCredentials: true })
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
        .get("/player/pause", { withCredentials: true })
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
      "/player/volume",
      {
        volume: volumeParameter,
      }
    );
    const data = response.data;
    return data;
  }

  return (
    <div className="player" style={songPlayerStyle}>
      <img
        id="prevButton"
        style={songPlayerButtonStyle}
        src={images.prevButton}
        onClick={() => {
          setPrevState(true);
        }}
        alt="Previous Song"
      ></img>
      <img
        id="playButton"
        style={songPlayerButtonStyle}
        src={images.playButton}
        onClick={() => {
          if (playState === undefined) {
            setPlayState(true);
          } else {
            setPlayState(!playState);
          }
        }}
        alt="Play Song"
      ></img>
      <img
        id="nextButton"
        style={songPlayerButtonStyle}
        src={images.nextButton}
        onClick={() => {
          setNextState(true);
        }}
        alt="Next Song"
      ></img>
      <img
        id="repeatButton"
        style={songPlayerButtonStyle}
        src={images.repeatButton}
        onClick={() => {
          setRepeatState(true);
        }}
        alt="Repeat"
      ></img>
      <img
        id="shuffleButton"
        style={songPlayerButtonStyle}
        src={images.shuffleButton}
        onClick={() => {
          setShuffleState(true);
        }}
        alt="Shuffle"
      ></img>
      {/* <img id="albumImage" style={songPlayerButtonStyle} src={images.nextButton} alt="Album Image"></img>
            <div style={infoContainerStyle}>
                <p style={songNameTextStyle}>lol</p>
                <p style={artistNameTextStyle}>asdsadasj daskldj askopasdsad</p>
            </div>
            <div style={infoContainerStyle}>
                <span style={{color: themeColors.black, fontSize: textSizes.body, margin: "0px", position: "absolute", left: "45%"}}>0:00</span>
                <input style={playbackSliderStyle} type="range" id="mySlider" min="0" max="1000" value={timestamp} step="1" onChange={e => setTimestamp(e.target.value)}/>
                <span style={{color: themeColors.black, fontSize: textSizes.body, margin: "0px", position: "absolute", right: "15%"}}>23:59</span>
            </div>
            <div>
                <select style={deviceDropdownStyle} name="dropdown" id="myDropdown">
                    <option value="" disabled selected>Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </select>
            </div> */}
      <input
        style={volumeSliderStyle}
        type="range"
        id="mySlider"
        min="0"
        max="100"
        value={volumeLevel}
        step="1"
        onChange={(e) => saveVolume(e.target.value)}
      ></input>
    </div>
  );
}
export default SongPlayer;
