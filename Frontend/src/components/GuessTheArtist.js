import React from "react";
import { useState } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import MusicPlayerGame from "./MusicPlayerGame";

const bodyStyle = {
  backgroundColor: "black",
  margin: 0,
  padding: 0,
  height: "100vh",
};

const friendContainerStyle = {
  position: "fixed", // Fixed position so it stays on the right
  top: 100,
  right: 0,
  width: "20%", // Take up 20% of the viewport width
  height: "900", // Take up the full height
  backgroundColor: "white", // Add background color for the friend component
};

const boxStyle = {
  margin: "60px",
  backgroundColor: "black",
  border: "2px solid white",
  width: "1000px",
  height: "600px",
  alignItems: "center",
};

const innerBoxStyle = {
  marginTop: "120px",
  display: "flex",
  flexDirection: "column", // or 'row' depending on your layout
  justifyContent: "center",
};

const gameTitleStyle = {
  color: "#FFF",
  textAlign: "center",
  fontFamily: "Rhodium Libre",
  fontSize: "30px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "normal",
  textTransform: "uppercase",
};

const gameSubTitleStyle = {
  color: "#FFF",
  textAlign: "center",
  fontFamily: "Rhodium Libre",
  fontSize: "15px",
  fontStyle: "normal",
  fontWeight: 300,
  lineHeight: "normal",
  textTransform: "uppercase",
};

const gameTextStyle = {
  color: "#FFF",
  textAlign: "center",
  fontFamily: "Rhodium Libre",
  fontSize: "20px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "normal",
  textTransform: "uppercase",
  margin: "10px", // Add margin for spacing between labels
};

const inputStyle = {
  fontFamily: "Poppins-Bold, Helvetica",
  backgroundColor: "black",
  border: "2px solid white",
  margin: "5px", // Add margin for spacing between inputs
  textAlign: "center", // Center the text inside the input
  color: "white",
};
const gameButton = {
  marginTop: "100px",
  backgroundColor: "#6eeb4d",
  padding: "5px 5px", // Adjusted padding for a narrower button
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const gameButtonText = {
  fontFamily: "Poppins-Regular, Helvetica",
  fontWeight: 700,
  fontSize: "14px",
}
const GuessTheArtist = () => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [numberOfRounds, setNumberOfRounds] = useState(0);
  const[isStartClicked, setIsStartClicked]= useState(false);

  const handleInputChange = (value, setter) => {
    // Ensure the input value is between 1 and 10
    const newValue = Math.min(Math.max(parseInt(value), 1), 10);
    setter(newValue);
  };

  const handleStartGameClick = () => {
      if (numberOfPlayers !== 0 && numberOfRounds !== 0) {
        setIsStartClicked(true);
      } else {
        alert("Please enter valid input");
      }
    };

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>
      <div style={boxStyle}>
          {!isStartClicked ? (
            <>
              <h2 style={gameTitleStyle}>Guess The Artist Game</h2>
              <h4 style={gameSubTitleStyle}>
                <u>Rules of the Game:</u> The game can have 1-10 plays and 1-10 Rounds per game
              </h4>
              <div style={innerBoxStyle}>
                <label style={gameTextStyle}>
                  Number of Players:
                  <input
                    type="number"
                    value={numberOfPlayers}
                     onChange={(e) => handleInputChange(e.target.value, setNumberOfPlayers)}
                  style={inputStyle}
                  />
                </label>
                <div />
                <label style={gameTextStyle}>
                  Number of Rounds:
                  <input
                    type="number"
                    value={numberOfRounds}
                    onChange={(e) => handleInputChange(e.target.value, setNumberOfRounds)}
                    style={inputStyle}
                  />
                </label>
                <button className="gameButton" style={gameButton} onClick={handleStartGameClick}>
                  <p style={gameButtonText}>START GAME</p>
                </button>
              </div>
            </>
          ) : (
            <div>
              <MusicPlayerGame numberOfPlayers={numberOfPlayers} numberOfRounds={numberOfRounds} gameCode={1}/>
            </div>
          )}
        </div>
    </div>
  );
};

export default GuessTheArtist;
