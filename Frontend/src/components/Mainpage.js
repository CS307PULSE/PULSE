import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Card from "./Card";
import FriendsCard from "./FriendsCard";
import SongPlayer from "./SongPlayer";
import StatsCard from "./StatsCard";

import { pulseColors } from "../theme/Colors";
import axios from "axios";

import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";

var textSizeSetting, themeSetting;
try {
  var textSizeResponse = await axios.get(
    "http://127.0.0.1:5000/get_text_size",
    { withCredentials: true }
  );
  textSizeSetting = textSizeResponse.data;
  var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {
    withCredentials: true,
  });
  themeSetting = themeResponse.data;
} catch (e) {
  console.log("Formatting settings fetch failed: " + e);
  textSizeSetting = 1;
  themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  overflow: "auto",
};

const cardContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-around",
  width: "75%", // Set width to 75% of the container
};

const cardStyle = {
  marginBottom: "20px", // Add some bottom margin for spacing
  padding: "20px",
  textAlign: "center",
  fontFamily: "'Poppins', sans-serif",
};

const cardContent = {
  color: themeColors.text,
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
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: "8px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: themeColors.text,
  borderRadius: "10px",
  cursor: "pointer",
  margin: "5px", // Small space between buttons
  width: "90%",
};

const friendContainerStyle = {
  position: "fixed", // Fixed position so it stays on the right
  top: 100,
  right: 0,
  width: "20%", // Take up 20% of the viewport width
  height: "900", // Take up the full height
  backgroundColor: themeColors.backgorund, // Add background color for the friend component
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
  const response = await axios.get("http://127.0.0.1:5000/update_followers", {
    withCredentials: true,
  });
  const data = response.data;
  console.log("Followers response:");
  console.log(response);
  return data;
}

function Mainpage() {
  useEffect(() => {
    document.title = "PULSE - Dashboard";
  }, []);

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={{ padding: "5px" }} />
      <div style={cardContainerStyle}>
        <Card headerText="STATISTICS" style={cardStyle}>
          {StatsCard()}
        </Card>
        <Card headerText="DJ MIXER" style={cardStyle}>
          <p style={cardContent}>This is the content of Card 2.</p>
        </Card>
      </div>
      <div style={{ padding: "20px" }} />
      <div style={cardContainerStyle}>
        <Card headerText="GAMES" style={cardStyle}>
          <p style={cardContent}>
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
          </p>
        </Card>
        <Card headerText="UPLOADER" style={cardStyle}>
          <p style={cardContent}>ENTER LOCAL FILE PATH:</p>
        </Card>
      </div>
      {/* Define routes for each game */}
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>

      <SongPlayer />
    </div>
  );
}

export default Mainpage;
