import React, { useState, useEffect } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";

import { Link } from "react-router-dom";

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
  height: "100%",
};

const friendContainerStyle = {
  position: "fixed", // Fixed position so it stays on the right
  top: 100,
  right: 0,
  width: "20%", // Take up 20% of the viewport width
  height: "900", // Take up the full height
  backgroundColor: themeColors.background, // Add background color for the friend component
};

const cardStyle = {
  marginBottom: "20px", // Add some bottom margin for spacing
  textAlign: "center",
  fontFamily: "'Poppins', sans-serif",
};

const cardContent = {
  color: themeColors.background,
  width: "80%", // Take up 20% of the viewport width
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
  border: "1px solid " + themeColors.border, // White border
  borderRadius: "10px",
  cursor: "pointer",
  marginBottom: "5px", // Small space between buttons
  width: "90%",
};
const gamesTitleStyle = {
  color: themeColors.text,
  textAlign: "center",
  fontFamily: "Rhodium Libre",
  fontSize: textSizes.header2,
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "normal",
  textTransform: "uppercase",
  width: "80%", // Take up 20% of the viewport width
};

const gamesSubTitleStyle = {
  color: themeColors.text,
  textAlign: "center",
  fontFamily: "Rhodium Libre",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "normal",
  textTransform: "uppercase",
  width: "80%", // Take up 20% of the viewport width
};

function getGameType(gameId) {
  // Define your game types here
  const gameTypes = [
    "Guess the Song",
    "Guess the Artist",
    "Guess the Next Lyric",
  ];
  return gameTypes[gameId] || "Unknown Game";
}

function transposeMatrix(matrix) {
  if (!matrix || matrix.length < 2 || !matrix[0] || !matrix[1]) {
    return [];
  }

  const scoresRow = matrix[1];

  return scoresRow.map((_, colIndex) => {
    const gameType = getGameType(Number(scoresRow[colIndex + 1])); // Assuming game type is after the scores

    const group = matrix.slice(1, -1).map((row) => {
      const cell = row[colIndex];
      return cell === undefined ? "0" : cell;
    });

    const joinedGroup = group.join("");
    return { scores: joinedGroup, gameType };
  });
}

async function fetchDataScores() {
  const response = await axios.get("http://127.0.0.1:5000/games/get_scores", {
    withCredentials: true,
  });
  const data = response.data;
  console.log(data);
  return data;
}

const Games = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    // Make a GET request to your Flask backend
    fetchDataScores()
      .then((data) => setScores(data.scores))
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // <-- Add 'scores' as a dependency

  const getGameData = () => {
    if (!scores || scores.length < 2 || !scores[0] || !scores[1]) {
      return [];
    }

    return (
      <div>
        {scores.map((gameType, index1) => (
          <>
            <p>
              {" "}
              <b>
                <u>Game {index1 + 1}</u>
              </b>
            </p>
            <p>
              {gameType.map((gameRound, index2) => (
                <p>
                  Round {index2}:
                  {gameRound.map((gameScore) => (
                    <> {gameScore}</>
                  ))}
                </p>
              ))}
            </p>
          </>
        ))}
      </div>
    );
  };

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>

      <h2 style={gamesTitleStyle}>AVAILABLE GAMES</h2>
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

      {/* NEED TO FIX PULLING OF GAME STYLE */}

      <h2 style={gamesTitleStyle}>PREVIOUS SCORES</h2>
      <h2 style={gamesSubTitleStyle}>
        1: Guess the song, 2: Guess the Artist, 4: Guess the next lyric
      </h2>
      <div style={{ color: "white", whiteSpace: "pre", marginLeft: "500px" }}>
        {getGameData()}
      </div>
    </div>
  );
};

export default Games;
