import React, { useEffect } from "react";
import { useState } from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import MusicPlayerGame from "./MusicPlayerGame";
import { hexToRGBA } from "../theme/Colors";
import { useAppContext } from "./Context";

const GuessTheArtist = () => {
  //eslint-disable-next-line no-unused-vars
  const { state } = useAppContext();
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [numberOfRounds, setNumberOfRounds] = useState(0);
  const [isStartClicked, setIsStartClicked] = useState(false);

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
    height: "100%",
    margin: 0,
    padding: 0,
  };

  const friendContainerStyle = {
    position: "fixed",
    top: "64px",
    right: "0px",
    left: "80%",
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
  };

  const boxStyle = {
    margin: "60px",
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    border: "2px solid white",
    width: "1000px",
    height: "600px",
    alignItems: "center",
  };

  const innerBoxStyle = {
    backgroundColor: state.colorBackground,
    marginTop: "120px",
    display: "flex",
    flexDirection: "column", // or 'row' depending on your layout
    justifyContent: "center",
  };

  const gameTitleStyle = {
    color: state.colorText,
    textAlign: "center",
    fontSize: "30px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textTransform: "uppercase",
  };

  const gameSubTitleStyle = {
    color: state.colorText,
    textAlign: "center",
    fontSize: "15px",
    fontStyle: "normal",
    fontWeight: 300,
    lineHeight: "normal",
    textTransform: "uppercase",
  };

  const gameTextStyle = {
    color: state.colorText,
    textAlign: "center",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textTransform: "uppercase",
    margin: "10px", // Add margin for spacing between labels
  };

  const inputStyle = {
    backgroundColor: state.colorBackground,
    border: "2px solid " + state.colorBorder,
    margin: "5px", // Add margin for spacing between inputs
    textAlign: "center", // Center the text inside the input
    color: state.colorText,
  };
  const gameButton = {
    marginTop: "100px",
    backgroundColor: state.colorAccent,
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

  useEffect(() => {
    document.title = "PULSE - Guess the Artist";
  }, []);

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
    <div className="wrapper">
      <div className="content" style={bodyStyle}>
        <Navbar />
        <div style={friendContainerStyle}>
          <FriendsCard />
        </div>

        <div style={boxStyle}>
          {!isStartClicked ? (
            <>
              <h2 style={gameTitleStyle}>Guess The Artist Game</h2>
              <h4 style={gameSubTitleStyle}>
                <u>Rules of the Game:</u> The game can have 1-10 plays and 1-10
                Rounds per game
              </h4>
              <div style={innerBoxStyle}>
                <label style={gameTextStyle}>
                  Number of Players:
                  <input
                    type="number"
                    value={numberOfPlayers}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setNumberOfPlayers)
                    }
                    style={inputStyle}
                  />
                </label>
                <div />
                <label style={gameTextStyle}>
                  Number of Rounds:
                  <input
                    type="number"
                    value={numberOfRounds}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setNumberOfRounds)
                    }
                    style={inputStyle}
                  />
                </label>
                <button
                  className="gameButton"
                  style={gameButton}
                  onClick={handleStartGameClick}
                >
                  <p style={gameButtonText}>START GAME</p>
                </button>
              </div>
            </>
          ) : (
            <div>
              <MusicPlayerGame
                numberOfPlayers={numberOfPlayers}
                numberOfRounds={numberOfRounds}
                gameCode={1}
                selectedArtist={""}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessTheArtist;
