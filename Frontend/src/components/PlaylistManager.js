import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import axios from "axios";
import { Link } from "react-router-dom";
import { genreList } from "../theme/Emotions";

const PlaylistManager = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(-1);
  const [songSearchString, setSongSearchString] = useState("");
  const [songSearchResults, setSongSearchResults] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);

  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistPublic, setPlaylistPublic] = useState(true);
  const [playlistCollaborative, setPlaylistCollaborative] = useState(true);
  const [playlistGenre, setPlaylistGenre] = useState(genreList[0]);

  const [imagePath, setImagePath] = useState("");

  async function searchForSongs(searchString) {
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/api/search_bar", {query: searchString});
    setSongSearchResults(response.data);
  }
  async function playlistPost(action, payload) {
    const route = "/api/playlist/" + action;
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post(route, payload);
    return response.data;
  }
  async function getPlaylists() {
    const axiosInstance = axios.create({withCredentials: true});
    var response = await axiosInstance.get("/api/statistics/get_saved_playlists");
    const parsedPlaylists = JSON.parse(response.data.saved_playlists);
    setPlaylists(parsedPlaylists);
  }
  useEffect(() => {
    getPlaylists();
  }, []);
  async function getPlaylistSongs(playlistID) {
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post("/api/playlist/get_tracks", {playlist: playlistID});
    const trackData = response.data;
    setPlaylistSongs(trackData.items);
  }
  useEffect(() => {
    if (playlists[selectedPlaylistIndex]) {
      getPlaylistSongs(playlists[selectedPlaylistIndex].id);
    }
  }, [selectedPlaylistIndex]);
  

  function getPlaylistImage(index) {
    const image = playlists[index].images[0];
    if (image) {
      return image.url;
    } else {
      return "https://iaaglobal.s3.amazonaws.com/bulk_images/no-image.png";
    }
  }
  function getSongImage(track) {
    const image = track.album.images[0];
    if (image) {
      return image.url;
    } else {
      return "https://iaaglobal.s3.amazonaws.com/bulk_images/no-image.png";
    }
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
    margin: '5px', // Small space between buttons
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
      width: "600px",
      padding: "20px",
      margin: "20px",
      position: "relative",
      overflow: "auto"
  }
  const selectionDisplayStyle = {
    backgroundColor: state.colorBackground,
    width: "100% - 20px",
    margin: "10px",
    display: "flex",
    alignItems: "center",
    overflow: "auto",
    border: "1px solid " + state.colorBorder,
    borderRadius: "5px"
  }
  const imageStyle = {
    width: "40px",
    height: "40px",
    margin: "10px"
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
        <div>
          <div style={sectionContainerStyle}>
            <div style={buttonContainerStyle}>
                <label style={textStyle}>Playlist Name </label>
                <input type="text" style={buttonStyle} value={playlistName} onChange={e => {setPlaylistName(e.target.value)}}></input>
            </div>
            <div style={buttonContainerStyle}>
                <label style={textStyle}>Public </label>
                <input type="checkbox" style={{position: "absolute", right: "20px", width: "50px"}} value={playlistPublic} onChange={e => {setPlaylistPublic(e.target.value)}}></input>
            </div>
            <div style={buttonContainerStyle}>
                <label style={textStyle}>Collaborative </label>
                <input type="checkbox" style={{position: "absolute", right: "20px", width: "50px"}} value={playlistCollaborative} onChange={e => {setPlaylistCollaborative(e.target.value)}}></input>
            </div>
            <div style={buttonContainerStyle}>
                <label style={textStyle}>Genre </label>
                <select style={buttonStyle} value={playlistGenre} onChange={(e) => setPlaylistGenre(e.target.value)}>
                  <option key={-1} value={"none"}>Blank Playlist</option>
                  {genreList.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
            </div>
            <div style={buttonContainerStyle}>
                <button style={buttonStyle} onClick={() => {
                  playlistPost("create", {name: playlistName, public: playlistPublic, collaborative: playlistCollaborative, genre: playlistGenre})
                }}>Generate Playlist</button>
            </div>
          </div>
          <div style={{...sectionContainerStyle, height: "400px"}}>
            <p style={headerTextStyle}>Playlists</p>
            {playlists.length > 0 && playlists.map((item, index) => (
              <div key={index} style={{...selectionDisplayStyle, 
                border: (index == selectedPlaylistIndex ?  "5px" : "1px") + " solid " + (index == selectedPlaylistIndex ? state.colorAccent : state.colorBorder)}} 
                onClick={() => {setSelectedPlaylistIndex(index)}}>
                <img style={imageStyle} src={getPlaylistImage(index)}></img>
                <div>
                  <p style={textStyle}>{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{...sectionContainerStyle, height: "400px"}}>
            <p style={headerTextStyle}>Selected Playlist: {playlists[selectedPlaylistIndex] ? playlists[selectedPlaylistIndex].name : "None"}</p>
            <div style={buttonContainerStyle}>
                <input type="text" style={textFieldStyle} value={imagePath} onChange={e => {setImagePath(e.target.value)}}></input>
                <button style={{...buttonStyle, width: "200px"}} onClick={() => {playlistPost("change_image", {url: imagePath, playlist: playlists[selectedPlaylistIndex].id})}}>{"Update Icon (.jpeg, < x800x800)"}</button>
            </div>
            <div style={buttonContainerStyle}>
                <button style={buttonStyle} onClick={() => {playlistPost("reorder_tracks", {playlist: playlists[selectedPlaylistIndex].id})}}>Reorder Tracks</button>
                <button style={buttonStyle} onClick={() => {playlistPost("follow", {playlist: playlists[selectedPlaylistIndex].id})}}>Follow</button>
                <button style={buttonStyle} onClick={() => {playlistPost("unfollow", {playlist: playlists[selectedPlaylistIndex].id})}}>Unfollow</button>
                <Link to="/DJmixer/ParameterRecommendation"><button style={buttonStyle} onClick={() => {}}>Derive Emotion</button></Link>
            </div>
            {playlistSongs.length > 0 && playlistSongs.map((item, index) => (
              <div key={index} style={selectionDisplayStyle}>
                <button style={{...buttonStyle, width: "80px"}} onClick={() => {playlistPost("remove_track", {song: item.track.uri, playlist: playlists[selectedPlaylistIndex].id})}}>Remove</button>
                <img style={imageStyle} src={getSongImage(item.track)}></img>
                <div>
                  <p style={textStyle}>{item.track.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={sectionContainerStyle}>
          <p style={headerTextStyle}>Add Songs</p>
            <div style={buttonContainerStyle}>
                <input type="text" style={buttonStyle} value={songSearchString} onChange={e => {setSongSearchString(e.target.value)}}></input>
                <button style={buttonStyle} onClick={() => {searchForSongs(songSearchString)}}>Search</button>
            </div>
            {songSearchResults.length > 0 && songSearchResults.map((item, index) => (
              <div key={index} style={selectionDisplayStyle}>
                <button style={{...buttonStyle, width: "80px"}} onClick={() => {playlistPost("add_track", {song: item.uri, playlist: playlists[selectedPlaylistIndex].id})}}>Add</button>
                <img style={imageStyle} src={item.album.images[2].url}></img>
                <div>
                  <p style={textStyle}>{item.name}</p>
                  <p style={textStyle}>{item.artists[0].name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
      <div className="footer"><SongPlayer /></div>
    </div>
  );
};

export default PlaylistManager;
