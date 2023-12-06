import React, { useEffect, useState } from "react";
import ImageGraph from "./Graphs/ImageGraph";
import Navbar from "./NavBar";
import Playback from "./Playback";
import FriendsCard from "./FriendsCard";
import TextSize from "../theme/TextSize";
import axios from "axios";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import ItemList from "./ItemList";
import { playItem } from "./Playback";
import { getPlaylists } from "./PlaylistManager";
import { addSongToPlaylist } from "./PlaylistManager";

async function getRecommendations(playlist, method) {
  if (!playlist) { return; }
  try {
    const axiosInstance = axios.create({ withCredentials: true });
    const response = await axiosInstance.post(
      "/api/playlist/get_recs",
      { selectedPlaylistID: playlist.id,
        selectedRecMethod: method}
    );
    return response.data;
  } catch (e) { console.log(e); }
}

const PlaylistRecommendation = () => {
  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("");
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);
  const [selectedRecMethod, setSelectedRecMethod] = useState("genres");
  const [recommendations, setRecommendations] = useState([]);
  const [syncValue, setSyncValue] = useState(Date.now());

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
    margin: '5px', // Small space between buttons
    padding: '0px 10px 0px 10px',
    width: '100%',
    height: "50px",
    fontSize: textSizes.body
  };
  const sectionContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    width: "600px",
    padding: "20px",
    margin: "20px",
    position: "relative",
    overflow: "auto"
  };

  useEffect(() => {
    (async () => {
      setSavedPlaylists("loading");
      const data = await getPlaylists();
      setSavedPlaylists(data);
    })();
  }, [])
  useEffect(() => {
    (async () => {
      const playlist = savedPlaylists[selectedPlaylistIndex];
      setSelectedPlaylistName(playlist ? playlist.name : "");
      setRecommendations("loading");
      var data = await getRecommendations(playlist, selectedRecMethod);
      setRecommendations(data);
    })();
  }, [selectedRecMethod, selectedPlaylistIndex])

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display:"flex"}}>
          <div style={sectionContainerStyle}>
            <p style={headerTextStyle}>Playlists</p>
            <ItemList 
              data={savedPlaylists} 
              selectedIndex={selectedPlaylistIndex} 
              onClick={setSelectedPlaylistIndex}
            />
          </div>
          <div style={sectionContainerStyle}>
            <p style={headerTextStyle}>Recommendations</p>
            <p style={textStyle}>{selectedPlaylistName}</p>
            <div style={{position: "absolute", top: "20px", right: "10px"}}>
              <span style={textStyle}>Based on: </span>
              <select value={selectedRecMethod} onChange={(e) => setSelectedRecMethod(e.target.value)}
                style={{...buttonStyle, width: "150px"}}>
                <option value="genres">Genres</option>
                <option value="artists">Artists</option>
                <option value="albums">Albums</option>
              </select>
            </div>
            <ItemList 
              data={recommendations}
              onClick={(index) => playItem(recommendations[index], () => setSyncValue(Date.now()))}
              buttons={[
                {
                  width: "40px", value: "+", size: "30px",
                  onClick: (item) => addSongToPlaylist(savedPlaylists[selectedPlaylistIndex], item)
                }
              ]}
            />
          </div>
        </div>
        
      </div>
      <div className="footer"><Playback syncTrigger={syncValue}/></div>
    </div>
  );
};

export default PlaylistRecommendation;


//TODO: 
//Actual playlist selection
//dropdown
//Second button for adding song to playlist