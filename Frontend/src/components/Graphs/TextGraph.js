export const TextGraph = (props) => {
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
            <div key={artist.id + index}>
              {"#" + index + " artist is " + artist.name}
            </div>
          ))
        ) : props.dataName.includes("top_song") ? (
          props.data.map((track, index) => (
            <div key={track.id + index}>
              {"#" +
                index +
                " track is " +
                track.name +
                " by " +
                track.artists[0].name}
            </div>
          ))
        ) : props.dataName.includes("recent_songs") ||
          props.dataName.includes("saved_songs") ? (
          props.data.map((trackObj, index) => (
            <div key={trackObj.track.id + index}>
              {"#" +
                index +
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
            <div key={album.album.id + index}>
              {"#" +
                index +
                " album is " +
                album.album.name +
                " by " +
                album.album.artists[0].name}
            </div>
          ))
        ) : props.dataName.includes("saved_playlists") ? (
          props.data.map((playlist, index) => (
            <div key={playlist.id + index}>
              {"#" +
                index +
                " playlist is " +
                playlist.name +
                " created by " +
                playlist.owner.display_name}
            </div>
          ))
        ) : props.dataName.includes("playlists_for_recs") ? (
          props.data.map((playlist, index) => (
            <div key={playlist.id + index}>
              {"#" +
                index +
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
