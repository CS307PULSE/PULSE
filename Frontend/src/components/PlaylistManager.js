import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Playback, { trackData } from "./Playback";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import axios from "axios";
import { Link } from "react-router-dom";
import { genreList } from "../theme/Emotions";
import ItemList from "./ItemList";
import { searchSpotify } from "./Playback";
import { playItem } from "./Playback";

export async function playlistPost(action, payload, reloadFunction = () => {}) {
  const route = "/api/playlist/" + action;
  const axiosInstance = axios.create({withCredentials: true});
  const response = await axiosInstance.post(route, payload);
  reloadFunction();
  return response.data;
}
export async function getPlaylists() {
  try {
    const axiosInstance = axios.create({withCredentials: true});
    var response = await axiosInstance.get("/api/playlist/get_owned"); 
    const parsedPlaylists = response.data.items ? response.data.items : [];
    return parsedPlaylists;
  } catch (e) { console.log("Error getting playlists: " + e); }
}
export async function addSongToPlaylist(playlist, song) {
  if (!playlist || !song) { return; }
  const axiosInstance = axios.create({ withCredentials: true });
  const response = await axiosInstance.post("/api/playlist/add_song",
    {selectedPlaylistID: playlist.id, selectedSongURI: song.uri}
  );
  return response.data;
}

const PlaylistManager = () => {
  const { state } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [syncValue, setSyncValue] = useState(Date.now());
  const [mode, setMode] = useState("edit"); //"edit", "explore", "synthesize"

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(-1);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);

  const [newPlaylistName, setNewPlaylistName] = useState("New Playlist");
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(true);
  const [newPlaylistCollaborative, setNewPlaylistCollaborative] = useState(true);
  const [newPlaylistGenre, setNewPlaylistGenre] = useState("none");

  const [synthPlaylists1, setSynthPlaylists1] = useState([]);
  const [synthPlaylists2, setSynthPlaylists2] = useState([]);
  const [selectedSynthIndex1, setSelectedSynthIndex1] = useState(-1);
  const [selectedSynthIndex2, setSelectedSynthIndex2] = useState(-1);
  const [synthSearch1, setSynthSearch1] = useState("");
  const [synthSearch2, setSynthSearch2] = useState("");
  const [newSynthPlaylistName, setNewSynthPlaylistName] = useState("New Synthesized Playlist");
  const [synthResponseText, setSynthResponseText] = useState("");

  const [reorderIndexStart, setReorderIndexStart] = useState(0);
  const [reorderIndexAmount, setReorderIndexAmount] = useState(0);
  const [reorderIndexInsert, setReorderIndexInsert] = useState(0);
  const [reorderResponseText, setReorderResponseText] = useState("");
  const [playlistSearchString, setPlaylistSearchString] = useState("");
  const [playlistSearch, setPlaylistSearch] = useState([]);
  const [imagePath, setImagePath] = useState("");

  const images = {
    expandButton: "https://www.svgrepo.com/show/93813/up-arrow.svg",
    searchButton: "https://cdn-icons-png.flaticon.com/256/3917/3917132.png",
  };

  async function searchForSongs(searchString) {
    setSearchResults("loading");
    var data = await searchSpotify(searchString, "track");
    setSearchResults(data);
  }
  async function updatePlaylists() {
    setPlaylists("loading");
    const data = await getPlaylists();
    setPlaylists(data);
    setSynthPlaylists1(data);
    setSynthPlaylists2(data);
  }
  useEffect(() => {
    updatePlaylists();
  }, []);
  async function getPlaylistSongs(playlistID) {
    setPlaylistSongs("loading");
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/api/playlist/get_tracks", {playlist: playlistID});
    const trackData = response.data.items;
    for (let i = 0; i < trackData.length; i++) {
      trackData[i] = trackData[i].track;
    }
    setPlaylistSongs(trackData);
  }
  useEffect(() => {
    if (playlists[selectedPlaylistIndex]) {
      getPlaylistSongs(playlists[selectedPlaylistIndex].id);
    }
  }, [selectedPlaylistIndex]);
  async function handleSynthSearch1() {
    const data = await searchSpotify(synthSearch1, "playlist");
    setSynthPlaylists1(data);
  }
  async function handleSynthSearch2() {
    const data = await searchSpotify(synthSearch2, "playlist");
    setSynthPlaylists2(data);
  }
  async function handlePlaylistSearch() {
    const data = await searchSpotify(playlistSearchString, "playlist");
    setPlaylistSearch(data);
  }
  async function reorderPlaylist(playlist, start, amount, insert) {
    if (!playlist) { setReorderResponseText("Please select a playlist!"); return; }
    try {
      setReorderResponseText("Reordering playlist...");
      const data = await playlistPost(
        "reorder_tracks",
        {playlist: playlist.id, start: parseInt(start), insert: parseInt(insert), amount: parseInt(amount)},
        () => getPlaylistSongs(playlists[selectedPlaylistIndex].id)
      )
      console.log(playlist.id);
      console.log(start);
      console.log(insert);
      console.log(amount);
      setReorderResponseText(data);
    } catch (e) { setReorderResponseText("Error reordering playlist!"); console.log(e); }
  }
  async function mergePlaylists() {
    setSynthResponseText("Merging playlists...")
    const response = await playlistPost(
      "merge", 
      {name: newSynthPlaylistName, first_playlist: synthPlaylists1[selectedSynthIndex1].id, second_playlist: synthPlaylists2[selectedSynthIndex2].id},
      updatePlaylists
    );
    setSynthResponseText(response);
  }
  async function fusePlaylists() {
    setSynthResponseText("Fusing playlists...")
    const response = await playlistPost(
      "fuse", 
      {name: newSynthPlaylistName, first_playlist: synthPlaylists1[selectedSynthIndex1].id, second_playlist: synthPlaylists2[selectedSynthIndex2].id},
      updatePlaylists
    );
    setSynthResponseText(response);
  }

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };
  const textStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
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
    marginTop: '5px', // Space between cards and buttons
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
  const textFieldContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "10px",
    height: "40px"
  }
  const textFieldStyle = {
      backgroundColor: state.colorBackground,
      border: "1px " + state.colorBorder + " solid",
      borderRadius: "10px",
      height: "20px",
      width: "300px",
      color: state.colorText,
      padding: "10px",
      position: "absolute",
      right: "20px"
  };
  
  const sectionContainerStyle = {
      backgroundColor: hexToRGBA(state.colorBackground, 0.5),
      width: "calc(100% - 60px)",
      padding: "20px",
      margin: "20px",
      position: "relative",
      overflow: "auto"
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
        <div style={{width:"100px"}}> {/* Column 1 */}
          <div style={{...buttonContainerStyle, position: "sticky", width: "400px", transform: "rotate(270deg) translate(-200px, -150px)"}}>
            <button style={{...buttonStyle, width:"33%"}} onClick={() => setMode("synthesize")}>Synthesize</button>
            <button style={{...buttonStyle, width:"33%"}} onClick={() => setMode("explore")}>Explore</button>
            <button style={{...buttonStyle, width:"33%"}} onClick={() => setMode("edit")}>Edit</button>
          </div>
        </div>
        {(() => { switch (mode) {
          case "edit": return ( <>
            <div style={{width:"calc((100% - 120px) * 0.5)"}}> {/* Column 2 */}
              <div style={{...sectionContainerStyle, height: "400px"}}>
                <p style={headerTextStyle}>Playlists</p>
                <ItemList 
                  data={playlists}
                  selectedIndex={selectedPlaylistIndex} onClick={setSelectedPlaylistIndex}
                />
              </div>
              <div style={sectionContainerStyle}>
                <p style={headerTextStyle}>Playlist Reordering</p>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>First Song Index</p>
                    <input name="reorder-index-1" type="number" style={buttonStyle} value={reorderIndexStart} onChange={e => {setReorderIndexStart(e.target.value)}}></input>
                </div>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>Number of Songs</p>
                    <input name="reorder-index-2" type="number" style={buttonStyle} value={reorderIndexAmount} onChange={e => {setReorderIndexAmount(e.target.value)}}></input>
                </div>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>Destination Index</p>
                    <input name="reorder-index-3" type="number" style={buttonStyle} value={reorderIndexInsert} onChange={e => {setReorderIndexInsert(e.target.value)}}></input>
                </div>
                <p style={textStyle}>{reorderResponseText}</p>
                <button style={buttonStyle} onClick={() => reorderPlaylist(playlists[selectedPlaylistIndex], reorderIndexStart, reorderIndexAmount, reorderIndexInsert)}>Reorder Tracks</button>
              </div>
            </div>
            <div style={{width:"calc((100% - 120px) * 0.5)"}}> {/* Column 3 */}
              <div style={{...sectionContainerStyle, height: "400px"}}>
                <p style={headerTextStyle}>Selected Playlist: {playlists ? trackData(playlists[selectedPlaylistIndex], "name") : ""}</p>
                <div style={buttonContainerStyle}>
                    <input type="text" style={textFieldStyle} value={imagePath} onChange={e => {setImagePath(e.target.value)}}></input>
                    <button style={{...buttonStyle, width: "200px"}} onClick={() => {playlistPost("change_image", {url: imagePath, playlist: playlists[selectedPlaylistIndex].id})}}>{"Update Icon (.jpeg, < x800x800)"}</button>
                </div>
                <div style={buttonContainerStyle}>
                    {/* <button style={buttonStyle} onClick={() => {playlistPost("reorder_tracks", {playlist: playlists[selectedPlaylistIndex].id})}}>Reorder Tracks</button> */}
                    {/* <button style={buttonStyle} onClick={() => {playlistPost("follow", {playlist: playlists[selectedPlaylistIndex].id})}}>Follow</button> */}
                    <button style={buttonStyle} onClick={() => {playlistPost("unfollow", {playlist: playlists[selectedPlaylistIndex].id})}}>Unfollow</button>
                    <Link to="/explorer/ParameterRecommendation"><button style={buttonStyle} onClick={() => {}}>Derive Emotion</button></Link>
                </div>
                <ItemList 
                  data={playlistSongs}
                  onClick={(index) => playItem(playlistSongs[index], () => setSyncValue(Date.now()))}
                  buttons={[
                    {width: "40px", value: "-", size: "30px",
                      onClick: (item) => {playlistPost("remove_track", {song: item.uri, playlist: playlists[selectedPlaylistIndex].id},
                        () => {getPlaylistSongs(playlists[selectedPlaylistIndex].id)})}
                    }
                  ]}/>
              </div>
              <div style={sectionContainerStyle}>
                <p style={headerTextStyle}>Add Songs</p>
                <div style={buttonContainerStyle}>
                    <input type="text" style={buttonStyle} value={searchString}
                      onChange={e => {setSearchString(e.target.value)}}
                      onKeyDown={(e) => {if (e.key == 'Enter') {searchForSongs(searchString)}}}></input>
                    <button style={{...buttonStyle, width: "30%"}} onClick={() => {searchForSongs(searchString)}}>Search</button>
                </div>
                <ItemList
                  data={searchResults}
                  onClick={(index) => playItem(searchResults[index], () => setSyncValue(Date.now()))}
                  buttons={[
                    {width: "40px", value: "+", size: "30px",
                      onClick: (item) => {playlistPost("add_track", {song: item.uri, playlist: playlists[selectedPlaylistIndex].id},
                        () => {getPlaylistSongs(playlists[selectedPlaylistIndex].id)})}
                    }
                  ]}/>
              </div>
            </div>
          </>);
          case "explore": return (<>
            <div style={{width:"calc((100% - 120px) * 0.5)"}}> {/* Column 2 */}
              <div style={{...sectionContainerStyle, height: "400px"}}>
                <p style={headerTextStyle}>Followed Playlists</p>
                <ItemList 
                  data={playlists}
                  selectedIndex={selectedPlaylistIndex} onClick={setSelectedPlaylistIndex}
                  buttons={
                    [
                      {
                        width: "40px",
                        value: "-",
                        size: "30px",
                        onClick: (item) => {playlistPost("unfollow", {playlist: item.id}, updatePlaylists)}
                      }
                    ]
                  }
                />
              </div>
            </div>
            <div style={{width:"calc((100% - 120px) * 0.5)"}}> {/* Column 3 */}
              <div style={sectionContainerStyle}>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>Playlist Name </p>
                    <input name="playlist-name-field" type="text" style={buttonStyle} value={newPlaylistName} onChange={e => {setNewPlaylistName(e.target.value)}}></input>
                </div>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>Public </p>
                    <input name="public-field" type="checkbox" style={{position: "absolute", right: "20px", width: "50px"}} value={newPlaylistPublic} onChange={e => {setNewPlaylistPublic(e.target.value)}}></input>
                </div>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>Collaborative </p>
                    <input name="collaborative-field" type="checkbox" style={{position: "absolute", right: "20px", width: "50px"}} value={newPlaylistCollaborative} onChange={e => {setNewPlaylistCollaborative(e.target.value)}}></input>
                </div>
                <div style={buttonContainerStyle}>
                    <p style={textStyle}>Genre </p>
                    <select style={buttonStyle} value={newPlaylistGenre} onChange={(e) => setNewPlaylistGenre(e.target.value)}>
                      <option key={-1} value={"none"}>Blank Playlist</option>
                      {genreList.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                </div>
                <div style={buttonContainerStyle}>
                    <button style={buttonStyle} onClick={() => {
                      playlistPost("create", {name: newPlaylistName, public: newPlaylistPublic, collaborative: newPlaylistCollaborative, genre: newPlaylistGenre}, updatePlaylists)
                    }}>Generate Playlist</button>
                </div>
              </div>
              <div style={sectionContainerStyle}>
                <p style={headerTextStyle}>Search For Playlists</p>
                <div style={buttonContainerStyle}>
                  <input type="text" style={buttonStyle} value={playlistSearchString}
                    onChange={(e) => setPlaylistSearchString(e.target.value)}
                    onKeyDown={(e) => {if (e.key === "Enter") {handlePlaylistSearch()}}}
                  />
                  <button
                    style={{ ...buttonStyle, width: "30%" }}
                    onClick={() => handleSynthSearch1()}>
                    Search
                  </button>
                </div>
                <ItemList
                  data={playlistSearch}
                  buttons={
                  [
                    {
                      width: "40px",
                      value: "-",
                      size: "30px",
                      onClick: (item) => {playlistPost("unfollow", {playlist: item.id}, updatePlaylists)}
                    },
                    {
                      width: "40px",
                      value: "+",
                      size: "30px",
                      onClick: (item) => {playlistPost("follow", {playlist: item.id}, updatePlaylists)}
                    }
                  ]
                }
                />
              </div>
            </div>
          </>);
          case "synthesize": return (<>
            <div style={{width:"calc((100% - 120px) * 0.7)"}}> {/* Column 2 */}
              <div style={{...sectionContainerStyle, height:"calc(100vh - 240px)"}}>
                <p style={headerTextStyle}>Search For Playlists</p>
                <div style={{display:"flex"}}>
                  <div style={{width:"50%", overflowY:"scroll"}}>
                    <div style={buttonContainerStyle}>
                      <input type="text" style={buttonStyle} value={synthSearch1}
                        onChange={(e) => setSynthSearch1(e.target.value)}
                        onKeyDown={(e) => {if (e.key === "Enter") {handleSynthSearch1()}}}
                      />
                      <button
                        style={{ ...buttonStyle, width: "30%" }}
                        onClick={() => handleSynthSearch1()}>
                        Search
                      </button>
                    </div>
                    <ItemList
                      data={synthPlaylists1}
                      selectedIndex={selectedSynthIndex1}
                      onClick={setSelectedSynthIndex1}
                    />
                  </div>
                  <div style={{width:"50%", overflowY:"scroll"}}>
                    <div style={buttonContainerStyle}>
                      <input type="text" style={buttonStyle} value={synthSearch2}
                        onChange={(e) => setSynthSearch2(e.target.value)}
                        onKeyDown={(e) => {if (e.key === "Enter") {handleSynthSearch2()}}}
                      />
                      <button
                        style={{ ...buttonStyle, width: "30%" }}
                        onClick={() => handleSynthSearch2()}>
                        Search
                      </button>
                    </div>
                    <ItemList
                      data={synthPlaylists2}
                      selectedIndex={selectedSynthIndex2}
                      onClick={setSelectedSynthIndex2}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div style={{width:"calc((100% - 120px) * 0.3)"}}> {/* Column 2 */}
              <div style={sectionContainerStyle}>
                <div style={buttonContainerStyle}>
                  <p style={textStyle}>New Playlist Name:</p>
                  <input type="text" style={buttonStyle} value={newSynthPlaylistName}
                    onChange={(e) => setNewSynthPlaylistName(e.target.value)}
                  />
                </div>
                <button style={buttonStyle} onClick={() => mergePlaylists()}>Merge Playlists</button>
                <button style={buttonStyle} onClick={() => fusePlaylists()}>Fuse Playlists</button>
                <p style={textStyle}>{synthResponseText}</p>
              </div>
            </div>
          </>);
        }})()}
        
        </div>
      </div>
      <div className="footer"><Playback syncTrigger={syncValue}/></div>
    </div>
  );
};

export default PlaylistManager;
