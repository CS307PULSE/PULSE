import React from 'react';
import Navbar from './NavBar';
import FriendsCard from './FriendsCard';

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize("medium"); //Obtain text size values
const themeColors = Colors("light"); //Obtain color values

const bodyStyle = {
    backgroundColor: themeColors.background,
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
    backgroundColor: themeColors.background, // Add background color for the friend component
  };

const DJMixer = () => {

  return (
    <div style={bodyStyle}>
        <Navbar/>
        <div style={friendContainerStyle}>
      </div>
    </div>
  );
};

export default DJMixer;






