import React from "react";
import { pulseColors } from "../theme/Colors";

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize("medium"); //Obtain text size values
const themeColors = Colors("light"); //Obtain color values

const images = {
    playButton: "https://cdn-icons-png.flaticon.com/512/3318/3318660.png",
    nextButton: "https://cdn-icons-png.flaticon.com/512/7030/7030549.png",
    prevButton: "https://cdn-icons-png.flaticon.com/512/3318/3318703.png"
}

const songPlayerBackgroundStyle = {
    position: 'fixed',
    bottom: "0",
    padding: '0px',
    margin: '0px',
    backgroundColor: themeColors.background2,
    width: '100%', // Set width to 100% to cover the entire width of the screen
    height: '60px', // Set height to 100vh to cover the entire height of the screen   
    display: 'flex'
};

const songPlayerButtonStyle = {
    width: "auto",
    height: "40px",
    margin: "10px"
}

const playbackSliderStyle = {
    width: '40%',
    height: "40px",
    margin: '10px auto',
    position: 'absolute',
    right: '30%'
};

const volumeSliderStyle = {
    width: '10%',
    height: "40px",
    margin: '10px auto',
    position: 'absolute',
    right: '30px'
};



function SongPlayer() {
    return(
        
        <div className="player" style={songPlayerBackgroundStyle}>
            <img style={songPlayerButtonStyle} src={images.prevButton} alt="Previous Song"></img>
            <img style={songPlayerButtonStyle} src={images.playButton} alt="Play Song"></img>
            <img style={songPlayerButtonStyle} src={images.nextButton} alt="Next Song"></img>
            <input style={playbackSliderStyle} type="range" id="mySlider" min="0" max="1000" value="200" step="1"></input> 
            <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value="20" step="1"></input> 
                
        </div>
    );
}
export default SongPlayer;