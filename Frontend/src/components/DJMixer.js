import React from 'react';
import Navbar from './NavBar';
import FriendsCard from './FriendsCard';


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

const DJMixer = () => {

  return (
    <div style={bodyStyle}>
        <Navbar/>
        <div style={friendContainerStyle}>
        <FriendsCard />
      </div>
    </div>
  );
};

export default DJMixer;






