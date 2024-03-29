import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import Navbar from "./NavBar";
import Card from "./Card";
import FriendsCard from "./FriendsCard";
import Uploader from "./Uploader";
import Playback from "./Playback";
import { useAppContext } from "./Context";
import StatsCard from "./StatsCard";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";

function Mainpage() {
  //eslint-disable-next-line no-unused-vars
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };
  const cardContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "auto",
    width: "75%",
    height: "100%",
  };
  const cardStyle = {
    margin: "20px", // Add some bottom margin for spacing
    padding: "20px",
    textAlign: "center",
    overflow: "hidden",
  };
  const cardContent = {
    color: state.colorText,
    fontSize: textSizes.body,
    fontFamily: "'Poppins', sans-serif",
  };
  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column", // Stack buttons in a column
    alignItems: "center", // Center buttons horizontally
    marginTop: "10px", // Space between cards and buttons
  };
  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    padding: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.colorBorder,
    borderRadius: "10px",
    cursor: "pointer",
    margin: "5px", // Small space between buttons
    width: "90%",
  };
  const friendContainerStyle = {
    position: "fixed",
    top: "64px",
    right: "0px",
    bottom: "60px",
    left: "80%",
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
  };

  useEffect(() => {
    document.title = "PULSE - Dashboard";
  }, []);

  return (
    <div className="wrapper">
      <div className="header">
        <Navbar />
      </div>
      <div className="content" style={bodyStyle}>
        <div style={cardContainerStyle}>
          <Card headerText="STATISTICS" style={cardStyle}>
            <StatsCard />
          </Card>
          <Card headerText="EXPLORER" style={cardStyle}>
            <div style={cardContent}>
              <div style={buttonContainerStyle}>
                {/* Use Link instead of button, and provide the to prop with the dynamic URL */}
                <Link
                  to="/explorer/ParameterRecommendation"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Parameter Wizard
                </Link>
                <Link
                  to="/explorer/SongRecommendation"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Song Recommender
                </Link>
                <Link
                  to="/explorer/PlaylistRecommendation"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Recommendations for Playlists
                </Link>
                <Link
                  to="/explorer/PlaylistManager"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Playlist Manager
                </Link>
                <Link
                  to="/explorer/ArtistExplorer"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Artist Explorer
                </Link>
              </div>
            </div>
          </Card>
          <Card headerText="GAMES" style={cardStyle}>
            <div style={cardContent}>
              <div style={buttonContainerStyle}>
                {/* Use Link instead of button, and provide the to prop with the dynamic URL */}
                <Link
                  to="/game/guess-the-song"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Guess The Song
                </Link>
                <Link
                  to="/game/guess-the-artist"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Guess The Artist
                </Link>
                <Link
                  to="/game/guess-who-listens"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Guess Who Listens To The Song
                </Link>
                <Link
                  to="/game/guess-the-lyric"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Guess The Next Lyric
                </Link>
                <Link
                  to="/game/heads-up"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Heads Up
                </Link>
              </div>
            </div>
          </Card>
          <Card headerText="UPLOADER" style={cardStyle}>
            <Uploader />
          </Card>
        </div>
        {/* Define routes for each game */}
        <div style={friendContainerStyle}>
          <FriendsCard />
        </div>
      </div>
      <div className="footer">
        <Playback />
      </div>
    </div>
  );
}

export default Mainpage;
