import React, { useState, useEffect } from 'react';
import Navbar from './NavBar';
import axios from 'axios';
import ItemList from "./ItemList";
import { playItem } from "./Playback";
import { getPlaylists } from "./PlaylistManager";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import TextSize from "../theme/TextSize";

const ViewLikedSongs = () => {
const { state, dispatch } = useAppContext();
const textSizes = TextSize(state.settingTextSize);
const [likedSongs, setLikedSongs] = useState([]);
const [savedPlaylists, setSavedPlaylists] = useState([]);
const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);
const [syncValue, setSyncValue] = useState(Date.now());

//from alex's code 
  async function addSongToPlaylist(playlist, song) {
    console.log(playlist);
    console.log(song);
    if (!playlist || !song) { return; }
    const axiosInstance = axios.create({ withCredentials: true });
    const response = await axiosInstance.post("/api/playlist/add_song",
      {selectedPlaylistID: playlist.id, selectedSongURI: song.uri}
    );
    console.log(response);
    const data = response.data;
    return data;
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

  const songListStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '50px',
    color: 'white',
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

  const songItemStyle = {
    margin: '10px',
    padding: '10px',
    border: '1px solid #6EEB4D',
    borderRadius: '10px',
    width: '300px',
    textAlign: 'center',
  };

  useEffect(() => {
    (async () => {
      setSavedPlaylists("loading");
      const data = await getPlaylists();
      setSavedPlaylists(data);
    })();
  }, [])

  return (
    <div style={{ background: 'black', height: '100vh' }}>
        <Navbar/>
        <div>
          {likedSongs && likedSongs.length > 0 ? (
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
     <div style={{position: "absolute", top: "20px", right: "10px"}}>
     </div>
     <ItemList 
           data={likedSongs}
           onClick={(index) => playItem(likedSongs[index], () => setSyncValue(Date.now()))}
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
          
          ) : (
            <p>No liked songs available.</p>
          )}
        </div>
      </div>

  );
};

export default ViewLikedSongs;
