import React, { useState, useEffect } from "react";
import axios from "axios";

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
const MusicPlayerGame = ({ numberOfPlayers, numberOfRounds, gameCode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentNumberOfRounds, setCurrentNumberOfRounds] = useState(numberOfRounds);
  const [showScores, setShowScores] = useState(false);
  const [playButtonDisabled, setPlayButtonDisabled] = useState(false);

  useEffect(() => {
    const initialPlayers = Array.from(
      { length: numberOfPlayers },
      (_, index) => ({
        id: index + 1,
        name: `Player ${index + 1}`,
        selected: false,
        score: 0,
      })
    );
    setPlayers(initialPlayers);
  }, [numberOfPlayers]);

   useEffect(() => {
    // Reset play button state at the start of each round
    setIsPlaying(false);
    setPlayButtonDisabled(false);
  }, [currentNumberOfRounds]);
 
  const handlePlayButtonClick = () => {
    const axiosInstance = axios.create({withCredentials: true});
    axiosInstance.post("http://127.0.0.1:8080/games/playback", { artist: "" })
    .then((response) => {
      // Handle the response from the backend if needed
      console.log("Playback initiated successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error initiating playback:", error);
    });

    // Add logic for playing music
    if (!isPlaying) {
      setIsPlaying(true);
      setPlayButtonDisabled(true);
    }
  };

  const handleCheckboxChange = (playerId) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId
          ? { ...player, selected: !player.selected }
          : player
      )
    );
  };

  const handleEveryoneWrongClick = () => {
    const axiosInstance = axios.create({withCredentials: true});
    axiosInstance.get("http://127.0.0.1:8080/player/pause")
    .then((response) => {
      // Handle the response from the backend if needed
      console.log("pause initiated successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error initiating pause:", error);
    });

    // Add logic for everyone got it wrong
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({ ...player, selected: false }))
    );
    setCurrentNumberOfRounds((prevRounds) => prevRounds - 1);
    checkIfShowScores();
  };

  const handlePlayersSelectedRightClick = () => {

    const axiosInstance = axios.create({withCredentials: true});
    axiosInstance.get("http://127.0.0.1:8080/player/pause")
    .then((response) => {
      // Handle the response from the backend if needed
      console.log("pause initiated successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error initiating pause:", error);
    });

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
      sendPlayerDataToBackend();
    }
  };

  // Function to send player data to the backend
  const sendPlayerDataToBackend = () => {
    // Assuming your backend API endpoint is 'your-backend-api-endpoint'
    const backendEndpoint = "http://127.0.0.1:5000/games/store_scores";

    // Extract player scores as an array of integers
    const playerScores = players.map((player) => player.score);

    // Make a POST request to send player scores to the backend
    const axiosInstance = axios.create({
      withCredentials: true,
    })
    axiosInstance
     .post(backendEndpoint, { gameCode, scores: playerScores })
      .then((response) => {
        // Handle the response from the backend if needed
        console.log("Player scores sent successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error sending player scores:", error);
      });
  };

  if (showScores) {
    // Render scores page content
    return (
      <div>
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
    <button
      style={playButtonStyle}
      onClick={handlePlayButtonClick}
      disabled={playButtonDisabled}
    >
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
