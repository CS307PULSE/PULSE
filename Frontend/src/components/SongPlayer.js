import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "./Context";
import { pulseColors } from "../theme/Colors";
import TextSize from "../theme/TextSize";
import ItemList from "./ItemList";
import { hexToRGBA } from "../theme/Colors";

function SongPlayer() {
  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [volumeLevel, setVolumeLevel] = useState(100);
  const [playState, setPlayState] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState("queue");
  
  
  const [currentTrack, setCurrentTrack] = useState(null);
  const [albumArt, setAlbumArt] = useState("https://upload.wikimedia.org/wikipedia/en/4/45/Blackwaterpark.jpg");
  const [devices, setDevices] = useState(["asd", "asdda"]);
  const [currentDevice, setCurrentDevice] = useState();

  const [queueData, setQueueData] = ([]);
  const [searchMode, setSearchMode] = useState("songs");
  const [songSearchString, setSongSearchString] = useState("");
  const [songSearchResults, setSongSearchResults] = useState([]);


  async function nextSong() { //Nexting
    await axios
      .get("/player/skip", { withCredentials: true })
      .then((response) => {
        console.log("Song nexted successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error skipping song:", error);
      });
    syncPlayer();
  }
  async function previousSong() { //Preving
    await axios
      .get("/player/prev", { withCredentials: true })
      .then((response) => {
        console.log("Song preved successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error preving song:", error);
      });
    syncPlayer();
  }
  async function toggleRepeat() {
    await axios
      .get("/player/repeat", { withCredentials: true })
      .then((response) => {
        console.log("Repeat toggled successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error toggling repeat:", error);
      });
  }
  async function toggleShuffle() {
    await axios
      .get("/player/shuffle", { withCredentials: true })
      .then((response) => {
        console.log("Shuffle toggled successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error toggling repeat:", error);
      });
  }
  useEffect(() => {
    if (playState == undefined) {
    } else if (playState) {
      //Play and pause
      axios
        .get("/player/play", { withCredentials: true })
        .then((response) => {
          console.log("Played song successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error playing song:", error);
        });
    } else {
      axios
        .get("/player/pause", { withCredentials: true })
        .then((response) => {
          console.log("Paused song successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error pausing song:", error);
        });
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
  async function syncPlayer() {
    // Update queue
    // Update player
  }
  useEffect(() => {
    syncPlayer();
  }, []);
  async function addToQueue() {
    syncPlayer();
  }
  async function removeFromQueue() {
    syncPlayer();
  }
  async function searchForSongs(searchString) {
    setSongSearchResults("loading");
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/search_bar", {query: searchString});
    setSongSearchResults(response.data);
  }

  const images = {
    playButton: "https://cdn-icons-png.flaticon.com/512/3318/3318660.png",
    pauseButton: "https://cdn-icons-png.flaticon.com/512/8286/8286763.png",
    nextButton: "https://cdn-icons-png.flaticon.com/512/7030/7030549.png",
    prevButton: "https://cdn-icons-png.flaticon.com/512/3318/3318703.png",
    repeatButton: "https://cdn-icons-png.flaticon.com/512/5355/5355955.png",
    shuffleButton: "https://cdn-icons-png.flaticon.com/512/5356/5356895.png",
    expandButton: "https://www.svgrepo.com/show/93813/up-arrow.svg",
    searchButton: "https://cdn-icons-png.flaticon.com/256/3917/3917132.png",
    queueButton: "https://static-00.iconduck.com/assets.00/queue-icon-512x465-8e7ju60m.png"
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
    position: "fixed",
    width: "auto",
    height: "40px",
    margin: "10px",
    bottom: "0px"
  };
  const volumeSliderStyle = {
    width: "10%",
    height: "40px",
    margin: "10px auto",
    position: "absolute",
    right: "100px",
  };

  const expandedPlayerStyle = {
    display: "flex",
    position: "absolute",
    bottom: "0px",
    padding: "0px",
    margin: "0px",
    backgroundColor: pulseColors.lightOffGrey,
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "calc(100vh - 64px)", // Set height to 100vh to cover the entire height of the screen
  };
  const sectionContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    width: "calc(100% - 60px)",
    padding: "20px",
    margin: "20px",
    position: "relative",
    overflow: "auto",
    height: "calc(100% - 160px)"
  };
  const textStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif",
    margin: "5px"
  };
  const headerTextStyle = {
    color: state.colorText,
    fontFamily: "'Poppins', sans-serif",
    fontSize: textSizes.header3,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal"
  };
  const buttonContainerStyle = {
    display: 'flex',
    alignItems: 'center', // Center buttons horizontally
    width: "100%"
  };
  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: state.colorBorder,
    borderRadius: '10px',
    cursor: 'pointer',
    margin: '5px', // Small space between buttons
    width: '100%',
    height: "50px",
    fontSize: textSizes.body
  };
  const expandedAlbumArtStyle = {
    left: "30px",
    top: "30px",
    height: "60%",
    borderRadius: "10px"
  };
  
  if (expanded) { return (
    <div style={expandedPlayerStyle}>
      <div style={{width:"32%"}}> {/* Column 1 */}
        <div style={{...sectionContainerStyle, textAlign:"center"}}>
          <img style={expandedAlbumArtStyle} src={albumArt}></img>
          <button onClick={() => {}} style={{...buttonStyle, position: "absolute", bottom: "10px", right: "10px", width: "60px"}}>Sync</button>
          {/* <p style={textStyle}>{currentTrack.}</p> */}
          {/* <p style={textStyle}>{currentTrack.}</p> */}
          <select 
            value={currentDevice} 
            onChange={(e) => setDevices(e.target.value)} 
            style={{...buttonStyle, width: "250px", position: "absolute", bottom: "10px", left: "10px"}}
          >
            {devices.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
        </div>
      </div>
      <div style={{width:"34%"}}> {/* Column 2 */}
          {(() => {
            switch (mode) {
              case "queue":
                return (
                  <div style={{...sectionContainerStyle, overflowY: "scroll"}}>
                    <p style={headerTextStyle}>Queue</p>
                    <img onClick={() => {setMode("queue")}} style={{height: "40px", position: "absolute", top: "30px", right: "70px"}} src={images.queueButton}></img>
                    <img onClick={() => {setMode("search")}} style={{height: "40px", position: "absolute", top: "30px", right: "15px"}} src={images.searchButton}></img>
                    <ItemList 
                    type="songs" data={queueData} onClick={() => {}}
                    buttons={[
                      {text: "-", width: "80px"
                      }
                    ]}/>
                  </div>
                );
              case "search":
                return (
                  <div style={{...sectionContainerStyle, overflowY: "scroll"}}>
                    <p style={headerTextStyle}>Add Songs</p>
                    <img onClick={() => {setMode("queue")}} style={{height: "40px", position: "absolute", top: "30px", right: "70px"}} src={images.queueButton}></img>
                    <img onClick={() => {setMode("search")}} style={{height: "40px", position: "absolute", top: "30px", right: "15px"}} src={images.searchButton}></img>
                    <select 
                      value={searchMode} 
                      onChange={(e) => setSearchMode(e.target.value)} 
                      style={{...buttonStyle, width: "150px", position: "absolute", top: "20px", right: "130px"}}
                    >
                      <option key={0} value="songs">Songs</option>
                      <option key={1} value="artists">Artists</option>
                      <option key={2} value="albums">Albums</option>
                      <option key={3} value="playlists">Playlists</option>
                      <option key={4} value="episodes">Episodes</option>
                      <option key={5} value="shows">Shows</option>
                    </select>
                    <div style={buttonContainerStyle}>
                      <input type="text" style={buttonStyle} value={songSearchString}
                        onChange={e => {setSongSearchString(e.target.value)}}
                        onKeyDown={(e) => {if (e.key == 'Enter') {searchForSongs(songSearchString)}}}></input>
                      <button style={{...buttonStyle, width: "30%"}} onClick={() => {searchForSongs(songSearchString)}}>Search</button>
                    </div>
                    <ItemList 
                    type="songs" data={songSearchResults}
                    buttons={[
                      {width: "40px", value: "+", size: "30px",
                        onClick: (item) => {}
                      }
                    ]}/>
                  </div>
                );
            }
          })()}
      </div>
      <div style={{width:"32%"}}> {/* Column 3 */}
        <div style={{...sectionContainerStyle, textAlign:"center"}}>
        </div>
      </div>
      <div style={songPlayerStyle}>
        <img id="prevButton" style={{...songPlayerButtonStyle, left:"20px"}} src={images.prevButton} onClick={() => {previousSong()}} alt="Previous Song"></img>
        <img id="playButton" style={{...songPlayerButtonStyle, left:"80px"}} 
          src={playState ? images.playButton : images.pauseButton} 
          onClick={() => {setPlayState(!playState); syncPlayer();}} 
          alt="Play Song"
        ></img>
        <img id="nextButton" style={{...songPlayerButtonStyle, left:"140px"}} src={images.nextButton} onClick={() => {nextSong()}} alt="Next Song"></img>
        <img id="repeatButton" style={{...songPlayerButtonStyle, left:"200px"}} src={images.repeatButton} onClick={() => {toggleRepeat(true)}} alt="Repeat"></img>
        <img id="shuffleButton" style={{...songPlayerButtonStyle, left:"260px"}} src={images.shuffleButton} onClick={() => {toggleShuffle(true)}} alt="Shuffle"></img>
        <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value={volumeLevel} step="10" onChange={(e) => saveVolume(e.target.value)}></input>
      </div> 
      <img id="expanderButton" style={{...songPlayerButtonStyle, right:"20px", transform:"rotate(180deg)"}} src={images.expandButton} onClick={() => {setExpanded(false)}} alt="Expand"></img>
    </div>
  );
  } else { return (
    <div style={songPlayerStyle}>
      <img id="prevButton" style={{...songPlayerButtonStyle, left:"20px"}} src={images.prevButton} onClick={() => {previousSong()}} alt="Previous Song"></img>
      <img id="playButton" style={{...songPlayerButtonStyle, left:"80px"}} src={playState ? images.playButton : images.pauseButton} 
      onClick={() => {
          if (playState === undefined) {
            setPlayState(true);
          } else {
            setPlayState(!playState);
          }
        }}
        alt="Play Song"
      ></img>
      <img id="nextButton" style={{...songPlayerButtonStyle, left:"140px"}} src={images.nextButton} onClick={() => {nextSong()}} alt="Next Song"></img>
      <img id="repeatButton" style={{...songPlayerButtonStyle, left:"200px"}} src={images.repeatButton} onClick={() => {toggleRepeat(true)}} alt="Repeat"></img>
      <img id="shuffleButton" style={{...songPlayerButtonStyle, left:"260px"}} src={images.shuffleButton} onClick={() => {toggleShuffle(true)}} alt="Shuffle"></img>
      <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value={volumeLevel} step="10" onChange={(e) => saveVolume(e.target.value)}></input>
      <img id="expanderButton" style={{...songPlayerButtonStyle, right:"20px"}} src={images.expandButton} onClick={() => {setExpanded(true)}} alt="Expand"></img>
    </div>
  );
}
}

export default SongPlayer;
