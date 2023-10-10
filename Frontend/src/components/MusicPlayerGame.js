import React, { useState } from "react";

const musicPlayerStyle = {
  backgroundColor: "black",
  color: "white",
  padding: "20px",
  textAlign: "center",
};

const playButtonStyle = {
  backgroundColor: "#6eeb4d",
  padding: "10px 20px",
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

const MusicPlayerGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", selected: false },
    { id: 2, name: "Player 2", selected: false },
    { id: 3, name: "Player 3", selected: false },
    // Add more players as needed
  ]);

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
    setPlayers((prevPlayers) => prevPlayers.map((player) => ({ ...player, selected: false })));
  };

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
            {player.name}
          </label>
        ))}
        <button onClick={handleEveryoneWrongClick}>Everyone Got It Wrong</button>
      </div>
    </div>
  );
};

export default MusicPlayerGame;
