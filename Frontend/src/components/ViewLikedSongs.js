import React, { useState, useEffect } from 'react';
import Navbar from './NavBar';
import axios from 'axios';
import ItemList from "./ItemList";
import { playItem } from "./Playback";
import { getPlaylists, addSongToPlaylist } from "./PlaylistManager";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import TextSize from "../theme/TextSize";
import Playback from './Playback';

const ViewLikedSongs = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize);
  const [likedSongs, setLikedSongs] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);
  const [syncValue, setSyncValue] = useState(Date.now());
  const [addSongResponse, setAddSongResponse] = useState("");

  async function handleAddPlaylistButton(playlist, item) {
    if (!playlist || !item) {
      setAddSongResponse("Please select a playlist!")
    }
    setAddSongResponse("Adding song...");
    const response = await addSongToPlaylist(playlist, item);
    setAddSongResponse(response);
  }

  // getting the liked songs
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/song_matcher/view_swiped_songs", {
        withCredentials: true,
      });

      const { data: likedSongsData } = response;
      console.log("Liked Songs:", likedSongsData);

      setLikedSongs(likedSongsData);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      // Handle the error as needed
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
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
            <p style={headerTextStyle}>Liked Songs</p>
            <p style={textStyle}>{addSongResponse}</p>
            <div style={{position: "absolute", top: "20px", right: "10px"}}>
          </div>
            <ItemList 
              data={likedSongs}
              onClick={(index) => playItem(likedSongs[index], () => setSyncValue(Date.now()))}
              buttons={[
                {
                  width: "40px", value: "+", size: "30px",
                  onClick: (item) => handleAddPlaylistButton(savedPlaylists[selectedPlaylistIndex], item)
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

export default ViewLikedSongs;
