import axios from "axios";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

async function sendSongRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/player/play_song",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

async function sendPlaylistRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/player/play_playlist",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

async function sendAlbumRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/player/play_album",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

export const ImageGraph = (props) => {
  function onClickAction(uri) {
    if (props.clickAction === "playMusic") {
      if (props.dataName.includes("song")) {
        sendSongRequest(uri);
      } else if (props.dataName.includes("album")) {
        sendAlbumRequest(uri);
      } else if (props.dataName.includes("playlist")) {
        sendPlaylistRequest(uri);
      }
    } else {
      const uriParts = uri.split(":");
      const url = `http://open.spotify.com/${uriParts[1]}/${uriParts[2]}`;
      window.open(url, "_blank");
    }
  }

  try {
    return (
      <div
        className="ImageGraph custom-draggable-cancel"
        onWheel={(e) => {
          if (e.deltaY === 0) return;
          e.cancelable && e.preventDefault();
          e.currentTarget.scrollTo({
            left: e.currentTarget.scrollLeft + e.deltaY,
            behavior: "auto",
          });
        }}
      >
        {props.dataName.includes("top_artist") ||
        props.dataName.includes("followed_artists") ? (
          props.data.map((artist, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={artist.name}
              onClick={() => onClickAction(artist.uri)}
              style={{ cursor: "pointer" }}
              key={artist.id + index}
            >
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("top_song") ? (
          props.data.map((track, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={track.name + " by " + track.artists[0].name}
              onClick={() => onClickAction(track.uri)}
              style={{ cursor: "pointer" }}
              key={track.id + index}
            >
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("recent_songs") ||
          props.dataName.includes("saved_songs") ? (
          props.data.map((trackObj, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                trackObj.track.name +
                " by " +
                trackObj.track.artists[0].name +
                " played at " +
                (props.dataName.includes("recent")
                  ? trackObj.played_at
                  : trackObj.added_at)
              }
              onClick={() => onClickAction(trackObj.track.uri)}
              style={{ cursor: "pointer" }}
              key={trackObj.track.id + index}
            >
              <img
                src={trackObj.track.album.images[0].url}
                alt={trackObj.track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("saved_albums") ? (
          props.data.map((album, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                album.album.name + " by " + album.album.artists[0].name
              }
              onClick={() => onClickAction(album.album.uri)}
              style={{ cursor: "pointer" }}
              key={album.album.id + index}
            >
              <img
                src={album.album.images[0].url}
                alt={album.album.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("saved_playlists") ? (
          props.data.map((playlist, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                playlist.name + " created by " + playlist.owner.display_name
              }
              onClick={() => onClickAction(playlist.uri)}
              style={{ cursor: "pointer" }}
              key={playlist.id + index}
            >
              <img
                src={
                  playlist.images[0] === undefined
                    ? "https://images.wondershare.com/repairit/aticle/2021/07/resolve-images-not-showing-problem-1.jpg"
                    : playlist.images[0].url
                }
                alt={playlist.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("playlists_for_recs") ? (
          props.data.map((playlist, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                playlist.name + " created by " + playlist.owner.display_name
              }
              onClick={() => {
                if (props.selectedSongID !== null && props.selectedSongID !== playlist.id) {
                  props.updateParentState(null, null, playlist.id, playlist.name);
                  props.setRefreshSongRecs(true);
                } else {
                  props.setRefreshSongRecs(false);
                }
              }}
              style={{ cursor: "pointer" }}
              key={playlist.id + index}
            >
              <img
                src={
                  playlist.images[0] === undefined
                    ? "https://images.wondershare.com/repairit/aticle/2021/07/resolve-images-not-showing-problem-1.jpg"
                    : playlist.images[0].url
                }
                alt={playlist.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("songs_for_recs") ? (
          props.data.map((track, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={track.name + " by " + track.artists[0].name}
              onClick={() => {
                sendSongRequest(track.uri);
                props.updateParentState(
                  track.uri,
                  track.name,
                  null,
                  null
                );
              }}
              style={{ cursor: "pointer" }}
              key={track.id + index}
            >
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : props.dataName.includes("song_recommendations") ? (
          props.data.map((trackObj, index) => (
            <span
              data-tooltip-id="body-tooltip"
              data-tooltip-content={
                trackObj.track.name + " by " + trackObj.track.artists[0].name
              }
              onClick={() => onClickAction(trackObj.track.uri)}
              style={{ cursor: "pointer" }}
              key={trackObj.track.id + index}
            >
              <img
                src={trackObj.track.album.images[0].url}
                alt={trackObj.track.name}
                className="ImageGraphImage"
              />
            </span>
          ))
        ) : (
          <p>Bad data name</p>
        )}

        <Tooltip id="body-tooltip" />
      </div>
    );
  } catch (e) {
    console.log(e);
    return <p>Your data is empty!</p>;
  }
};

export default ImageGraph;
