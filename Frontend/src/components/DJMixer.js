import React from 'react';
import Navbar from './NavBar';
import FriendsCard from './FriendsCard';
import { Link } from "react-router-dom";

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize(1); // Obtain text size values
const themeColors = Colors(0); // Obtain color values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const friendContainerStyle = {
  position: "fixed",
  top: 100,
  right: 0,
  width: "20%",
  height: "900",
  backgroundColor: themeColors.background,
};

const buttonContainerStyle = {
  position: 'fixed',
  left: 0,
  display: 'flex',
  paddingTop:"270px",
  flexDirection: 'column',
  justifyContent: 'flex-start', 
  alignItems: 'center',
  margin: 'auto',
  marginTop:'100px',
  height: 'auto', // Take up the full height
  width: '70%', // Adjust the width of the button container
};

const buttonStyle = {
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: '20px 40px', // Increase the padding for taller buttons
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: themeColors.text,
  borderRadius: '10px',
  cursor: 'pointer',
  margin: '5px',
  width: '70%', // Adjust the width to take up the entire space available
  textAlign: 'center', // Center the text horizontally
};

const DJMixer = () => {
  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>
      <div style={buttonContainerStyle}>
        <Link to="/DJmixer/SongRecommendation" style={{ ...buttonStyle, textDecoration: 'none' }}>Song Recommendation</Link>
        <Link to="/DJmixer/ArtistRecommendation" style={{ ...buttonStyle, textDecoration: 'none' }}>Artist Recommendation</Link>
      </div>
    </div>
  );
};

export default DJMixer;
