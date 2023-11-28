import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Card from "./Card";
import FriendsCard from "./FriendsCard";
import Uploader from "./Uploader";
import SongPlayer from "./SongPlayer";
import { useAppContext } from "./Context";
import StatsCard from "./StatsCard";
import ChatbotButton from "./ChatBotButton";
import axios from "axios";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";

function Mainpage() {
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
    fontFamily: "'Poppins', sans-serif",
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
  const searchContainerStyle = {
    display: "flex",
    marginLeft: "230px",
    // justifyContent: 'center',
    marginBottom: "20px",
  };
  const searchInputStyle = {
    padding: "8px",
    width: "50%",
  };

  //Update follower data
  async function updateFollowers() {
    const response = await axios.get("/statistics/update_followers", {
      withCredentials: true,
    });
    const data = response.data;
    console.log("Followers response:");
    console.log(response);
    return data;
  }

  const handleChatbotClick = () => {
    alert("Chatbot clicked!");
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
          <Card headerText="DJ MIXER" style={cardStyle}>
            <p style={cardContent}>This is the content of Card 2.</p>
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
                  GUESS THE SONG
                </Link>
                <Link
                  to="/game/guess-the-artist"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  GUESS THE ARTIST
                </Link>
                <Link
                  to="/game/guess-who-listens"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  GUESS WHO LISTENS TO THE SONG
                </Link>
                <Link
                  to="/game/guess-the-lyric"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  GUESS THE NEXT LYRIC
                </Link>
                <Link
                  to="/game/heads-up"
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  HEADS UP
                </Link>
              </div>
            </div>
          </Card>
          <Card headerText="UPLOADER" style={cardStyle}>
            <Uploader />
          </Card>
        </div>
        {/* Define routes for each game */}
        <ChatbotButton />
        <div style={friendContainerStyle}>
          <FriendsCard />
        </div>
      </div>
      <div className="footer">
        <SongPlayer />
      </div>
    </div>
  );
}

export default Mainpage;
