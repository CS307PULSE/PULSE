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

const MusicPlayerGame = ({ numberOfPlayers }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const initialPlayers = Array.from({ length: numberOfPlayers }, (_, index) => ({
      id: index + 1,
      name: `Player ${index + 1}`,
      selected: false,
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
    setPlayers((prevPlayers) => prevPlayers.map((player) => ({ ...player, selected: false })));
  };

  const handlePlayersSelectedRightClick = () => {
    // Add logic for players selected got it right
    // You can access the selected players from the 'players' state
    console.log("Players Selected Got It Right:", players.filter((player) => player.selected));
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
        <div style={{padding:"20px"}}/>
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
