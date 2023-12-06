import React, { useState } from "react";
import { StyleSheet, css } from "aphrodite";
import { useAppContext } from './Context';
import axios from "axios";

const MatchCardSongs = ({ onSwipeLeft, onSwipeRight, onClick = () => {}, data }) => {
  const { state, dispatch } = useAppContext();
  const theme = {
    primaryColor: "#6EEB4D",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    darkOffGrey: "#364232",
    lightOffGrey: "#c5d1c0",
    fontFamily: "'Poppins', sans-serif",
  };

  const {
    album: {
      album_type,
      artists,
      available_markets,
      external_urls: { spotify: artistExternalUrl },
      href: albumHref,
      id: albumId,
      images,
      name: albumName,
      release_date: albumReleaseDate,
      release_date_precision: albumReleaseDatePrecision,
      total_tracks: albumTotalTracks,
      type: albumType,
      uri: albumUri
    },

    id: trackId,
    is_local: trackIsLocal,
    name: trackName,
    type: trackType,
    uri: trackUri
  } = data;

  const {
    external_urls: { spotify: artistExternalUrl1 },
    href: artistHref1,
    id: artistId1,
    name: artistName1,
    type: artistType1,
    uri: artistUri1,
  } = artists[0];

  const [
    { height: image1Height, url: image1Url, width: image1Width },
  ] = images;

  const [startX, setStartX] = useState(0);

  const handleDragStart = (e) => {
    setStartX(e.clientX);
  };

  const handleDragEnd = (e) => {
    const endX = e.clientX;
    const deltaX = endX - startX;

    if (deltaX > 50 && onSwipeRight) {
      onSwipeRight();
    } else if (deltaX < -50 && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  const handleDrag = (e) => {
    const deltaX = e.clientX - startX;
    // Adjust the card's position during the drag
    e.target.style.transform = "translateX(0)";
  };

  const onClickSong = async () => {
    const axiosInstance = axios.create({ withCredentials: true });
    const response = await axiosInstance.post("/api/player/play_song", { spotify_uri: trackUri });
    return response.data;
  }

  const styles = StyleSheet.create({
    card: {
      width: "500px",
      height: "600px",
      backgroundColor: state.colorAccent,
      color: state.colorText,
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      cursor: "grab",
      position: "relative",
      margin: "20px",
      transition: "transform 0.3s ease-in-out",
      ":hover": {
        transform: "scale(1.05)",
      },
    },
    content: {
      padding: "20px",
      textAlign: "center",
      color: theme.textColor,
      fontFamily: theme.fontFamily,
      fontSize: "20px",
    },
    image: {
      width: "300px",
      height: "300px",
      borderColor:"white",
      borderWidth:"3",
      paddingBottom:"40px",
    },
    box:{
      background: "rgba(0, 0, 0, 0.8)",
      borderRadius: "20px",
      paddingBottom: "10px",
      paddingTop: "10px",
    },
   
  });

  return (
    <div
      className={css(styles.card)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      // onClick={}
    >
      <div className={css(styles.content)} onClick={() => onClickSong()}>
        <img src={image1Url} alt="Album cover" className={css(styles.image) } />
        <div className={css(styles.box)}>
        <p>{"Artist: " + artistName1}</p>
        <p>{"Song Name: " + trackName}</p>
        <p>{"Release Date: " + albumReleaseDate}</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCardSongs;
