import React from "react";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import Card from "./Card";
import { Link } from "react-router-dom";


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

  const cardStyle = {
    marginBottom: '20px', // Add some bottom margin for spacing
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  };
  
  const cardContent={
  color: 'white',
  width: "80%", // Take up 20% of the viewport width
  };
  
  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column', // Stack buttons in a column
    alignItems: 'center', // Center buttons horizontally
    marginTop: '10px', // Space between cards and buttons
  };
  
  const buttonStyle = {
    backgroundColor: 'black',
    color: 'white',
    padding: '8px',
    border: '1px solid white', // White border
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '5px', // Small space between buttons
    width: '90%',
  };
  const gamesTitleStyle = {
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Rhodium Libre",
    fontSize: "30px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textTransform: "uppercase",
    width: "80%", // Take up 20% of the viewport width
  };

const Games = () => {

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>

     <h2 style={gamesTitleStyle}>AVAILABLE GAMES</h2>
     <p style={cardContent}>
        <div style={buttonContainerStyle}>
            {/* Use Link instead of button, and provide the to prop with the dynamic URL */}
            <Link to="/game/guess-the-song" style={{ ...buttonStyle, textDecoration: 'none', textAlign: 'center' }}>GUESS THE SONG</Link>
            <Link to="/game/guess-the-artist" style={{ ...buttonStyle, textDecoration: 'none', textAlign: 'center' }}>GUESS THE ARTIST</Link>
            <Link to="/game/guess-who-listens" style={{ ...buttonStyle, textDecoration: 'none', textAlign: 'center' }}>GUESS WHO LISTENS TO THE SONG</Link>
            <Link to="/game/guess-the-lyric" style={{ ...buttonStyle, textDecoration: 'none', textAlign: 'center' }}>GUESS THE NEXT LYRIC</Link>
            <Link to="/game/heads-up" style={{ ...buttonStyle, textDecoration: 'none', textAlign: 'center' }}>HEADS UP</Link>
        </div>
     </p>

     <h2 style={gamesTitleStyle}>PREVIOUS SCORES</h2>
       
     
    </div>
  );
};

export default Games;
