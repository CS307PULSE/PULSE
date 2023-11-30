import React, { useState, useEffect } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import { Link } from "react-router-dom";
import axios from "axios";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";

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
  const response = await axios.get("/api/games/get_scores", {
    withCredentials: true,
  });
  const data = response.data;
  console.log(data);
  return data;
}

const Games = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values
  const [scores, setScores] = useState([]);

  const bodyStyle = {
    backgroundColor: state.colorBackground,
  };

  const friendContainerStyle = {
    position: "fixed",
    top: "64px",
    right: "0px",
    bottom: "60px",
    left: "80%",
    backgroundColor: hexToRGBA(state.colorBackground, 0.5)
  };

  const cardStyle = {
    marginBottom: "20px", // Add some bottom margin for spacing
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
  };

  const cardContent = {
    color: state.colorBackground,
    width: "80%", // Take up 20% of the viewport width
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
    border: "1px solid " + state.colorBorder, // White border
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "5px", // Small space between buttons
    width: "90%",
  };
  const gamesTitleStyle = {
    color: state.colorText,
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
    color: state.colorText,
    textAlign: "center",
    fontFamily: "Rhodium Libre",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textTransform: "uppercase",
    width: "80%", // Take up 20% of the viewport width
  };

  useEffect(() => {
    document.title = "PULSE - Games Page";
    // Make a GET request to your Flask backend
    fetchDataScores()
      .then((data) => setScores(data.scores))
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // <-- Add 'scores' as a dependency

  // const getGameData = () => {
  //   if (!scores || scores.length < 2 || !scores[0] || !scores[1]) {
  //     return [];
  //   }

  //   return (
  //     <div>
  //       {scores.map((gameType, index1) => (
  //         <>
  //           <p>
  //             {" "}
  //             <b>
  //               <u>Game {index1 + 1}</u>
  //             </b>
  //           </p>
  //           <p>
  //             {gameType.map((gameRound, index2) => (
  //               <p>
  //                 Round {index2}:
  //                 {gameRound.map((gameScore) => (
  //                   <> {gameScore}</>
  //                 ))}
  //               </p>
  //             ))}
  //           </p>
  //         </>
  //       ))}
  //     </div>
  //   );
  // };

  const getGameData = () => {
    if (!scores || scores.length < 2 || !scores[0] || !scores[1]) {
      return null;
    }
  
    function getGameType(gameId) {
      const gameTypes = [
        "Guess the Song",
        "Guess the Artist",
        "Guess Who Listens to the Song",
        "Guess the Next Lyric",
        "Heads Up",
      ];
      return gameTypes[gameId] || "Unknown Game";
    }

    const gamesTable = scores.map((gameType, index1) => (
      <div key={index1}>
        <h3>
          <u>{getGameType(index1)}</u>
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: state.colorBackground, color: state.colorText }}>
              <th style={{ padding: "10px", border: "1px solid " + state.colorBorder }}>Pervious Game</th>
              {gameType[0].map((_, index2) => (
                <th key={index2} style={{ padding: "10px", border: "1px solid " + state.colorBorder }}>
                  Player {index2 + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gameType.map((gameRound, index2) => (
              <tr key={index2}>
                <td style={{ padding: "10px", border: "1px solid " + state.colorBorder }}>
                  Round {index2 + 1}
                </td>
                {gameRound.map((gameScore, index3) => (
                  <td key={index3} style={{ padding: "10px", border: "1px solid " + state.colorBorder }}>
                    {gameScore}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  
    return <div>{gamesTable}</div>;
  };
  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
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

        <div style={{ color: "white", whiteSpace: "pre", marginRight: "400px" }}>
          {getGameData()}
        </div>
      </div>
      <div className="footer"></div>
    </div>
  );
};

export default Games;
