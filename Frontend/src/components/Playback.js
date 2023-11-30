import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "./Context";
import { pulseColors } from "../theme/Colors";
import TextSize from "../theme/TextSize";
import ItemList from "./ItemList";
import { hexToRGBA } from "../theme/Colors";
import { getImage } from "./ItemList";
import { formatDate } from "../theme/Format";

export async function playItem(item, syncFunction = () => {}) {
  if (!item) { return; }
  var route = (() => {switch (item.type) {
    case "playlist": return "/api/player/play_playlist";
    case "track": return "/api/player/play_song";
    case "album": return "/api/player/play_album";
    case "artist": return "/api/player/play_artist";
    case "episode": return "/api/player/play_song";
    // case "show": return "/api/player/play_song";
    default: return null;
  }})();
  if (!route) { return; }
  console.log(item);
  console.log(route);
  const axiosInstance = axios.create({withCredentials: true});
  const response = await axiosInstance.post(route, {spotify_uri: item.uri});
  syncFunction();
  return response.data;
}
export async function queueItem(item, syncFunction = () => {}) {
  const axiosInstance = axios.create({withCredentials: true});
  const response = await axiosInstance.post("/api/player/add_to_queue", {song_uri: item.uri});
  syncFunction();
  return response.data;
}
export async function searchSpotify(query, type) {
  const axiosInstance = axios.create({withCredentials: true});
  const response = await axiosInstance.post("/api/player/search_bar", {query: query, criteria: type});
  return response.data;
}
export function trackData(track, field) {
  if (!track) {
    return "";
  }
  try {
    switch (field) {
      case "name": return track.name;
      case "creator":
        switch (track.type) {
          case "track": return track.artists.map(artist => artist.name).join(', ');
          case "episode": return "";
        }
      case "release_date":
        switch (track.type) {
          case "track": return formatDate(track.album.release_date);
          case "episode": return formatDate(track.release_date);
        }
      case "description": 
        switch (track.type) {
          case "track": return "";
          case "episode": return track.description;
        }
    }
  } catch (e) {
    console.log(`Error getting \"${field}\" from ${track}: ` + e);
  }
}

function Playback() {
  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [volumeLevel, setVolumeLevel] = useState(100);
  const [playState, setPlayState] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState("queue");
  
  const [currentTrack, setCurrentTrack] = useState(null);
  const [albumArt, setAlbumArt] = useState("");
  const [devices, setDevices] = useState(null);
  const [currentDevice, setCurrentDevice] = useState();

  const [queueData, setQueueData] = useState([]);
  const [searchQueryType, setSearchQueryType] = useState("track");
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  async function nextSong() { //Nexting
    await axios.get("/api/player/skip", { withCredentials: true });
    syncPlayer();
  }
  async function previousSong() { //Preving
    await axios.get("/api/player/prev", { withCredentials: true });
    syncPlayer();
  }
  async function toggleRepeat() {
    await axios.get("/api/player/repeat", { withCredentials: true });
  }
  async function toggleShuffle() {
    await axios.get("/api/player/shuffle", { withCredentials: true });
  }
  async function togglePlay() {
    var action = playState;
    setPlayState(!playState);
    if (action) { //Play and pause
      await axios.get("/api/player/pause", { withCredentials: true });
    } else {
      await axios.get("/api/player/play", { withCredentials: true });
    }
    syncPlayer();
  }
  async function saveVolume(volumeParameter) { //Set volume
    console.log("Attempting volume post with value " + volumeParameter);
    setVolumeLevel(volumeParameter);
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/api/player/volume", {volume: volumeParameter});
    const data = response.data;
    return data;
  }
  async function syncPlayer() {
    const axiosInstance = axios.create({withCredentials: true});
    var response = await axiosInstance.get("/api/player/sync_player");
    var data = response.data;
    if (data == "failed") {
      setPlayState(false);
    } else {
      setPlayState(data.is_playing);
      if (data.current_track != "None") {
        setCurrentTrack(data.current_track);
        setAlbumArt(getImage(data.current_track));
      }
      setQueueData(data.queue.queue);
      setVolumeLevel(parseInt(data.volume));
      setDevices(data.all_devices.devices);
      setCurrentDevice(data.current_device.id);
    }
  }
  useEffect(() => {
    syncPlayer();
  }, []);
  async function getSearchResults(query, type) {
    setSearchResults("loading");
    var data = await searchSpotify(query, type);
    setSearchResults(data);
  }
  async function changeDevice(newDeviceID) {
    setCurrentDevice(newDeviceID);
    console.log(newDeviceID);
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/api/player/change_device", {uri: newDeviceID});
    const data = response.data;
    syncPlayer();
    return data;
  }
  function renderInfo(currentTrack) {
    if (!currentTrack) {
      return ("");
    }
    switch (currentTrack.type) {
      case "track": return (
        <div>
          <p style={headerTextStyle}>{trackData(currentTrack, "name")}</p>
          <a style={headerTextStyle} 
            href={currentTrack.album.external_urls.spotify} target="_blank">
            {"Album: " + currentTrack.album.name}</a>
          <p style={textStyle}>{"Released " + trackData(currentTrack, "release_date")}</p>
          <p style={textStyle}>{currentTrack.album.total_tracks + " Tracks"}</p>
          <p style={headerTextStyle}>
            {"Artists: " + trackData(currentTrack, "creator")}
          </p>
        </div>
      );
      case "episode": return (
        <div>
          <p style={headerTextStyle}>{trackData(currentTrack, "name")}</p>
          <p style={textStyle}>{"Released " + trackData(currentTrack, "release_date")}</p>
          <p style={headerTextStyle}>Description</p>
          <p style={textStyle}>{trackData(currentTrack, "description")}</p>
        </div>
      );
    }
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
    position: "absolute",
    width: "auto",
    height: "40px",
    margin: "10px",
    bottom: "0px",
    cursor: 'pointer'
  };
  const volumeSliderStyle = {
    width: "10%",
    height: "40px",
    margin: "10px auto",
    position: "absolute",
    right: "100px",
    cursor: 'pointer'
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
  const blurBackgroundArt = {
    backgroundImage: ("url('" + albumArt + "')"),
    filter: "blur(15px)",
    position: "fixed",
    width: "100%",
    height: "100%"
  }
  const sectionContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    width: "calc(100% - 60px)",
    padding: "20px",
    margin: "20px",
    position: "relative",
    overflow: "auto",
    height: "calc(100% - 130px)"
  };
  const textStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
    margin: "5px"
  };
  const headerTextStyle = {
    color: state.colorText,
    fontSize: textSizes.header3,
    fontWeight: 600,
    marginTop: "10px"
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
    margin: '5px',
    padding: '0px 10px 0px 10px',
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
      <div style={blurBackgroundArt}></div> {/* Background Art */}
      <div style={{width:"32%"}}> {/* Column 1 */}
        <div style={{...sectionContainerStyle, textAlign:"center"}}>
          <p style={headerTextStyle}>{currentTrack ? "" : "Playback Inactive"}</p>
          <img style={expandedAlbumArtStyle} src={albumArt}></img>
          <button onClick={() => syncPlayer()} style={{...buttonStyle, position: "absolute", bottom: "10px", right: "10px", width: "60px"}}>Sync</button>
          <p style={{...textStyle, fontSize: textSizes.header3}}>{currentTrack ? currentTrack.name : ""}</p>
          <p style={textStyle}>{trackData(currentTrack, "creator")}</p>
          <select 
            value={currentDevice} 
            onChange={(e) => {changeDevice(e.target.value); console.log(e.target.value);}}
            style={{...buttonStyle, width: "calc(100% - 100px)", position: "absolute", bottom: "10px", left: "10px"}}
          >
            {devices && devices.map((item, index) => (
              <option key={index} value={item.id}>{item.name}</option>
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
                    <img onClick={() => {setMode("queue"); syncPlayer();}} style={{height: "40px", position: "absolute", top: "20px", right: "70px"}} src={images.queueButton}></img>
                    <img onClick={() => {setMode("search"); syncPlayer();}} style={{height: "40px", position: "absolute", top: "20px", right: "15px"}} src={images.searchButton}></img>
                    <ItemList data={queueData} onClick={(index) => {playItem(queueData[index], syncPlayer);}}/>
                  </div>
                );
              case "search":
                return (
                  <div style={{...sectionContainerStyle, overflowY: "scroll"}}>
                    <p style={headerTextStyle}>Add Songs</p>
                    <img onClick={() => {setMode("queue")}} style={{height: "40px", position: "absolute", top: "20px", right: "70px"}} src={images.queueButton}></img>
                    <img onClick={() => {setMode("search")}} style={{height: "40px", position: "absolute", top: "20px", right: "15px"}} src={images.searchButton}></img>
                    <select 
                      value={searchQueryType}
                      onChange={(e) => {setSearchQueryType(e.target.value); getSearchResults(searchString, e.target.value);}}
                      style={{...buttonStyle, width: "max(calc(100% - 270px), 60px)", position: "absolute", top: "10px", right: "130px"}}
                    >
                      <option key={0} value="track">Songs</option>
                      <option key={1} value="artist">Artists</option>
                      <option key={2} value="album">Albums</option>
                      <option key={3} value="playlist">Playlists</option>
                      <option key={4} value="episode">Episodes</option>
                      <option key={5} value="show">Shows</option>
                    </select>
                    <div style={buttonContainerStyle}>
                      <input type="text" style={buttonStyle} value={searchString}
                        onChange={e => {setSearchString(e.target.value)}}
                        onKeyDown={(e) => {if (e.key == 'Enter') {getSearchResults(searchString, searchQueryType)}}}></input>
                      <button style={{...buttonStyle, width: "30%"}} onClick={() => {getSearchResults(searchString, searchQueryType)}}>Search</button>
                    </div>
                    <ItemList
                    type="song" data={searchResults} onClick={(index) => playItem(searchResults[index], syncPlayer)}
                    buttons={(searchQueryType == "track" || searchQueryType == "episode") ? 
                      [{width: "40px", value: "+", size: "30px", onClick: (item) => queueItem(item, syncPlayer)}] : []}/>
                  </div>
                );
            }
          })()}
      </div>
      <div style={{width:"32%"}}> {/* Column 3 */}
        <div style={sectionContainerStyle}>
          <p style={{...headerTextStyle, fontSize: textSizes.header2, marginBottom: "0px"}}>Info</p>
          {renderInfo(currentTrack)}
        </div>
      </div>
      <div style={songPlayerStyle}>
        <img id="prevButton" style={{...songPlayerButtonStyle, left:"20px"}} src={images.prevButton} onClick={() => {previousSong()}} alt="Previous Song"></img>
        <img id="playButton" style={{...songPlayerButtonStyle, left:"80px"}} 
          src={playState ? images.pauseButton : images.playButton} 
          onClick={() => togglePlay()}
          alt="Play Song"
        ></img>
        <img id="nextButton" style={{...songPlayerButtonStyle, left:"140px"}} src={images.nextButton} onClick={() => nextSong()} alt="Next Song"></img>
        <img id="repeatButton" style={{...songPlayerButtonStyle, left:"200px"}} src={images.repeatButton} onClick={() => toggleRepeat(true)} alt="Repeat"></img>
        <img id="shuffleButton" style={{...songPlayerButtonStyle, left:"260px"}} src={images.shuffleButton} onClick={() => toggleShuffle(true)} alt="Shuffle"></img>
        {/* <p style={{color: "black", fontSize: "20px", left: "360px", position: "fixed"}}>{playerStatus ? "Active Player" : "Inactive Player"}</p> */}
        <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value={volumeLevel} step="10" onChange={(e) => saveVolume(e.target.value)}></input>
      </div> 
      <img id="expanderButton" style={{...songPlayerButtonStyle, right:"20px", transform:"rotate(180deg)"}} src={images.expandButton} onClick={() => {setExpanded(false); syncPlayer();}} alt="Expand"></img>
    </div>
  );
  } else { return (
    <div>
      <div style={songPlayerStyle}>
        <img id="prevButton" style={{...songPlayerButtonStyle, left:"20px"}} src={images.prevButton} onClick={() => {previousSong()}} alt="Previous Song"></img>
        <img id="playButton" style={{...songPlayerButtonStyle, left:"80px"}} src={playState ? images.pauseButton : images.playButton} 
          onClick={() => {setPlayState(!playState)}} alt="Play Song"
        ></img>
        <img id="nextButton" style={{...songPlayerButtonStyle, left:"140px"}} src={images.nextButton} onClick={() => {nextSong()}} alt="Next Song"></img>
        <img id="repeatButton" style={{...songPlayerButtonStyle, left:"200px"}} src={images.repeatButton} onClick={() => {toggleRepeat(true)}} alt="Repeat"></img>
        <img id="shuffleButton" style={{...songPlayerButtonStyle, left:"260px"}} src={images.shuffleButton} onClick={() => {toggleShuffle(true)}} alt="Shuffle"></img>
        <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value={volumeLevel} step="10" onChange={(e) => saveVolume(e.target.value)}></input>
        <img id="albumArt" style={{...songPlayerButtonStyle, left:"360px"}} src={albumArt} onClick={() => {setExpanded(true); syncPlayer();}}></img>
        <p style={{color: pulseColors.black, fontSize: "16px", position: "absolute", width: "auto", left:"420px", margin: "10px", top: "0px"}}>{
          trackData(currentTrack, "name")}</p>
        <p style={{color: pulseColors.black, fontSize: "16px", position: "absolute", width: "auto", left:"420px", margin: "10px", bottom: "0px"}}>{
          trackData(currentTrack, "creator")}</p>
      </div>
      <img id="expanderButton" style={{...songPlayerButtonStyle, right:"20px"}} src={images.expandButton} onClick={() => {setExpanded(true)}} alt="Expand"></img>
    </div>
  );
  }
}

export default Playback;
