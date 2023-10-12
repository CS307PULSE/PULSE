import React, { useState, useEffect } from "react";

const musicPlayerStyle = {
  backgroundColor: "black",
  color: "white",
  padding: "20px",
  textAlign: "center",
};

const playButtonStyle = {
  backgroundColor: "#6eeb4d",
  padding: "10px 20px",
  width: "100%",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "18px",
  margin: "10px",
};

const playerListStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const playerCheckboxStyle = {
  margin: "5px",
};

const buttonContainerStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  width: "100%",
  marginTop: "10px",
};

const buttonStyle = {
  backgroundColor: "#6eeb4d",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "18px",
  margin: "5px",
};

const ScoreTitleStyle = {
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Rhodium Libre",
    fontSize: "30px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textTransform: "uppercase",
  };
  const ScoreStyle = {
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Rhodium Libre",
    fontSize: "15px",
    fontStyle: "normal",
    fontWeight: 300,
    lineHeight: "normal",
    textTransform: "uppercase",
  };
const MusicPlayerGame = ({ numberOfPlayers, numberOfRounds }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [players, setPlayers] = useState([]);
    const [currentNumberOfRounds, setCurrentNumberOfRounds] = useState(numberOfRounds);
    const [showScores, setShowScores] = useState(false);
  
    useEffect(() => {
      const initialPlayers = Array.from({ length: numberOfPlayers }, (_, index) => ({
        id: index + 1,
        name: `Player ${index + 1}`,
        selected: false,
        score: 0,
      }));
      setPlayers(initialPlayers);
    }, [numberOfPlayers]);
  
    const handlePlayButtonClick = () => {
      // Add logic for playing music
      setIsPlaying(!isPlaying);
    };
  
    const handleCheckboxChange = (playerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId ? { ...player, selected: !player.selected } : player
        )
      );
    };
  
    const handleEveryoneWrongClick = () => {
      // Add logic for everyone got it wrong
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => ({ ...player, selected: false }))
      );
      setCurrentNumberOfRounds((prevRounds) => prevRounds - 1);
      checkIfShowScores();
    };
  

const handlePlayersSelectedRightClick = () => {
    // Check if at least one player is selected
    const isAnyPlayerSelected = players.some((player) => player.selected);
  
    if (!isAnyPlayerSelected) {
      // If no player is selected, display an alert and return
      alert("Please select at least one player before proceeding.");
      return;
    }
  
    // Add logic for players selected got it right
    const updatedPlayers = players.map((player) => {
      if (player.selected) {
        return { ...player, score: player.score + 1, selected: false };
      }
      return player;
    });
  
    setPlayers(updatedPlayers);
    setCurrentNumberOfRounds((prevRounds) => prevRounds - 1);
    checkIfShowScores();
  };
  
  // ... (existing code)
  
  
    const checkIfShowScores = () => {
      if (currentNumberOfRounds === 1) {
        setShowScores(true);
      }
    };
  
    if (showScores) {
      // Render scores page content
      return (
        <div >
          <h2 style={ScoreTitleStyle}>Scores</h2>
          {players.map((player) => (
            <p key={player.id} style={ScoreStyle}>
              {player.name}: {player.score} points
            </p>
          ))}
        </div>
      );
        }
  
    return (
      <div style={musicPlayerStyle}>
        <button style={playButtonStyle} onClick={handlePlayButtonClick}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div style={playerListStyle}>
          <h3>Player List</h3>
          {players.map((player) => (
            <label key={player.id} style={playerCheckboxStyle}>
              <input
                type="checkbox"
                checked={player.selected}
                onChange={() => handleCheckboxChange(player.id)}
              />
              {player.name} (Score: {player.score})
            </label>
          ))}
          <div style={{ padding: "20px" }} />
          <div style={buttonContainerStyle}>
            <button style={buttonStyle} onClick={handleEveryoneWrongClick}>
              Everyone Got It Wrong
            </button>
            <button style={buttonStyle} onClick={handlePlayersSelectedRightClick}>
              Players Selected Got It Right
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default MusicPlayerGame;
  