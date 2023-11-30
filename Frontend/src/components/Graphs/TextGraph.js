import axios from "axios";

async function sendSongRequest(spotify_uri) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/api/player/play_song",
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
    "http://127.0.0.1:5000/api/player/play_playlist",
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
    "http://127.0.0.1:5000/api/player/play_album",
    {
      spotify_uri: spotify_uri,
    }
  );
  const data = response.data;
  return data;
}

export const TextGraph = (props) => {
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
        className="TextGraph custom-draggable-cancel"
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
            <div
              key={artist.id + index}
              onClick={() => onClickAction(artist.uri)}
              style={{ cursor: "pointer", "text-decoration": "underline" }}
            >
              {"#" + (index + 1) + " artist is " + artist.name}
            </div>
          ))
        ) : props.dataName.includes("top_song") ? (
          props.data.map((track, index) => (
            <div
              key={track.id + index}
              onClick={() => onClickAction(track.uri)}
              style={{ cursor: "pointer", "text-decoration": "underline" }}
            >
              {"#" +
                (index + 1) +
                " track is " +
                track.name +
                " by " +
                track.artists[0].name}
            </div>
          ))
        ) : props.dataName.includes("recent_songs") ||
          props.dataName.includes("saved_songs") ? (
          props.data.map((trackObj, index) => (
            <div
              key={trackObj.track.id + index}
              onClick={() => onClickAction(trackObj.track.uri)}
              style={{ cursor: "pointer", "text-decoration": "underline" }}
            >
              {"#" +
                (index + 1) +
                " track is " +
                trackObj.track.name +
                " by " +
                trackObj.track.artists[0].name +
                " played at " +
                (props.dataName.includes("recent")
                  ? trackObj.played_at
                  : trackObj.added_at)}
            </div>
          ))
        ) : props.dataName.includes("saved_albums") ? (
          props.data.map((album, index) => (
            <div
              key={album.album.id + index}
              onClick={() => onClickAction(album.album.uri)}
              style={{ cursor: "pointer", "text-decoration": "underline" }}
            >
              {"#" +
                (index + 1) +
                " album is " +
                album.album.name +
                " by " +
                album.album.artists[0].name}
            </div>
          ))
        ) : props.dataName.includes("saved_playlists") ? (
          props.data.map((playlist, index) => (
            <div
              key={playlist.id + index}
              onClick={() => onClickAction(playlist.uri)}
              style={{ cursor: "pointer", "text-decoration": "underline" }}
            >
              {"#" +
                (index + 1) +
                " playlist is " +
                playlist.name +
                " created by " +
                playlist.owner.display_name}
            </div>
          ))
        ) : (
          <p>Bad data name</p>
        )}
      </div>
    );
  } catch (e) {
    console.log(e);
    return <p>Your data is empty!</p>;
  }
};

export default TextGraph;
