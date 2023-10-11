import React from "react";
import Navbar from "./NavBar";
import Card from "./Card";
import FriendsCard from "./FriendsCard";
import { BrowserRouter as Router, Link, Route, Routes} from "react-router-dom";
import SongPlayer from "./SongPlayer";

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize("small"); //Obtain text size values
const themeColors = Colors("light"); //Obtain color values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: '100vh'
};

const cardContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  width: '75%', // Set width to 75% of the container

};

const cardStyle = {
  marginBottom: '20px', // Add some bottom margin for spacing
  textAlign: 'center',
  fontFamily: "'Poppins', sans-serif",
  
};

const cardContent={
  color: themeColors.text,
  fontSize: textSizes.body
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column', // Stack buttons in a column
  alignItems: 'center', // Center buttons horizontally
  marginTop: '10px', // Space between cards and buttons
};

const buttonStyle = {
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: '8px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: themeColors.text,
  borderRadius: '10px',
  cursor: 'pointer',
  marginBottom: '5px', // Small space between buttons
  width: '90%',
};



const friendContainerStyle = {
  position: 'fixed', // Fixed position so it stays on the right
  top: 100,
  right: 0,
  width: '20%', // Take up 20% of the viewport width
  height: '900', // Take up the full height
  backgroundColor: themeColors.background2, // Add background color for the friend component
};


function Mainpage() {
  return (
    <div style={bodyStyle}>
      

      <Navbar />
      
      <div style={{ padding: '20px' }} />
        <div style={cardContainerStyle}>
          <Card headerText="STATISTICS" style={cardStyle}>
            <p style={cardContent}>This is the content of Card 1.</p>
          </Card>
          <Card headerText="DJ MIXER" style={cardStyle}>
            <p style={cardContent}>This is the content of Card 2.</p>
          </Card>
        </div>
      <div style={{ padding: '20px' }} />
      <div style={cardContainerStyle}>
        <Card headerText="GAMES" style={cardStyle}>
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
        </Card>
        <Card headerText="UPLOADER" style={cardStyle}>
          <p style={cardContent}>ENTER LOCAL FILE PATH:</p>
        </Card>
      </div>
     {/* Define routes for each game */}
      <div style={friendContainerStyle}>
        <FriendsCard/>
      </div>
      
      <SongPlayer />
    </div>
   
  );
}

export default Mainpage;
