import React, { useEffect, useState } from "react";
import { pulseColors } from "../theme/Colors";
import axios from "axios";

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize("medium"); //Obtain text size values
const themeColors = Colors("light"); //Obtain color values

const images = {
    playButton: "https://cdn-icons-png.flaticon.com/512/3318/3318660.png",
    nextButton: "https://cdn-icons-png.flaticon.com/512/7030/7030549.png",
    prevButton: "https://cdn-icons-png.flaticon.com/512/3318/3318703.png"
}

const songPlayerStyle = {
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
    right: '20%'
};

const volumeSliderStyle = {
    width: '10%',
    height: "40px",
    margin: '10px auto',
    position: 'absolute',
    right: '30px'
};

const infoContainerStyle = {
    padding:"10px",
    width: "20%"
}
const songNameTextStyle = {
    color: themeColors.black,
    fontSize: textSizes.body,
    fontWeight: "bold",
    margin: "0px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
}
const artistNameTextStyle = {
    color: themeColors.black,
    fontSize: textSizes.body,
    margin: "0px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
}

const deviceDropdownStyle = {
    color: themeColors.white,
    width: "120px",
    height: "30px",
    backgroundColor: themeColors.black
}


function SongPlayer() {
    const [volumeLevel, setVolumeLevel] = useState('');
    const [timestamp, setTimestamp] = useState('');
    useEffect(() => {
        axios
        .post("http://127.0.0.1:5000/player/play", {})
        .then((response) => {
            // Handle the response from the backend if needed
            console.log("Player scores sent successfully:", response.data);
        })
        .catch((error) => {
            console.error("Error sending player scores:", error);
        });
    }, []);

    return(
        
        <div className="player" style={songPlayerStyle}>
            <img style={songPlayerButtonStyle} src={images.prevButton} alt="Previous Song"></img>
            <img style={songPlayerButtonStyle} src={images.playButton} alt="Play Song"></img>
            <img style={songPlayerButtonStyle} src={images.nextButton} alt="Next Song"></img>
            <img style={songPlayerButtonStyle} src={images.nextButton} alt="Next Song"></img>
            <div style={infoContainerStyle}>
                <p style={songNameTextStyle}>lol</p>
                <p style={artistNameTextStyle}>lolasdsadasdasdas2asddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd</p>
            </div>
            <div style={infoContainerStyle}>
                <span style={{color: themeColors.black, fontSize: textSizes.body, margin: "0px", position: "absolute", left: "40%"}}>0:00</span>
                <input style={playbackSliderStyle} type="range" id="mySlider" min="0" max="1000" value={timestamp} step="1" onChange={e => setTimestamp(e.target.value)}/>
                <span style={{color: themeColors.black, fontSize: textSizes.body, margin: "0px", position: "absolute", right: "20%"}}>23:59</span>
            </div>
            <div>
                <select style={deviceDropdownStyle} name="dropdown" id="myDropdown">
                    <option value="" disabled selected>Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </select>
            </div>
            <input style={volumeSliderStyle} type="range" id="mySlider" min="0" max="100" value={volumeLevel} step="1" onChange={e => setVolumeLevel(e.target.value)}></input> 
                
        </div>
    );
}
export default SongPlayer;