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
    paddding:"0px",
    margin: "0px",
    backgroundColor: themeColors.background2,
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "60px", // Set height to 100vh to cover the entire height of the screen    
};

const songPlayerButtonStyle = {
    width: "auto",
    height: "40px",
    margin: "10px"
}

function SongPlayer() {
    return(
        <div className="player" style={songPlayerBackgroundStyle}>
            <td>
                <img style={songPlayerButtonStyle} src={images.prevButton} alt="Previous Song"></img>
                <img style={songPlayerButtonStyle} src={images.playButton} alt="Play Song"></img>
                <img style={songPlayerButtonStyle} src={images.nextButton} alt="Next Song"></img>
            </td>


        </div>
    );
}
export default SongPlayer;