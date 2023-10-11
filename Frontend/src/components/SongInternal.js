import React from "react";
import { useState } from "react";
import MusicPlayerGame from "./MusicPlayerGame";

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
  };
const SongInternal = () => {
    const [numberOfPlayers, setNumberOfPlayers] = useState(0);
    const [numberOfRounds, setNumberOfRounds] = useState(0);
    const[isStartClicked, setIsStartClicked]= useState(false);

    const handleStartGameClick = () => {
        if (numberOfPlayers !== 0 && numberOfRounds !== 0) {
          setIsStartClicked(true);
        }
      };
      return (
        <div style={boxStyle}>
          {!isStartClicked ? (
            <>
              <h2 style={gameTitleStyle}>Guess The Song Game</h2>
              <h4 style={gameSubTitleStyle}>
                <u>Rules of the Game:</u> The game can have 1-10 plays and 1-10 Rounds per game
              </h4>
              <div style={innerBoxStyle}>
                <label style={gameTextStyle}>
                  Number of Players:
                  <input
                    type="number"
                    value={numberOfPlayers}
                    onChange={(e) => setNumberOfPlayers(e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <div />
                <label style={gameTextStyle}>
                  Number of Rounds:
                  <input
                    type="number"
                    value={numberOfRounds}
                    onChange={(e) => setNumberOfRounds(e.target.value)}
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
             <MusicPlayerGame/>
            </div>
          )}
        </div>
      );
    };
  export default SongInternal;