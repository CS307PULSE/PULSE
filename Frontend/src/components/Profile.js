import TestIcon from "../test_icon.jpg"
import React from "react";
//import { pulseColors } from "../theme/Colors";
import Colors from "../theme/Colors"; 
import TextSize from "../theme/TextSize";
const textSizes = TextSize("medium"); //Obtain text size values
const themeColors = Colors("light"); //Obtain color values

const profileStyle = {
    paddding:"0px",
    margin: "0px",
    backgroundColor: themeColors.background,
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "100%", // Set height to 100vh to cover the entire height of the screen
    backgroundSize: "cover", // Cover the entire container with the image
    backgroundRepeat: "no-repeat"
};
const profileHeader={
    paddingTop: "50px",
    paddingLeft: "50px",
    color: themeColors.text,
    textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
    fontFamily: "Rajdhani-SemiBold, Helvetica",
    fontSize: textSizes.header1,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
};
const profileText={
    paddingTop: "30px",
    paddingLeft: "50px",
    color: themeColors.text,
    textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
    fontFamily: "Rajdhani-SemiBold, Helvetica",
    fontSize: textSizes.body,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
};

const buttonStyle={
    backgroundColor: "#222",
    borderRadius: "10px",
    height: "40px",
    width: "80px",
    color:"#FFFFFF",
    margin:"5px"
};

function Profile({testParameter}){

    return(
    <div className="profile" style={profileStyle}>
        <p style={profileHeader}>Profile</p>
        <img className="logo" alt="logo" style={{}}src={TestIcon}/>
        <p style={profileText}>Username: </p>

        <p style={profileHeader}>Settings</p>
        <p style={profileText}>Text Size: </p>
        <button onclick={TextSize("small")} style={buttonStyle}><p>Small</p></button>
        <button onclick={TextSize("medium")} style={buttonStyle}><p>Medium</p></button>
        <button onclick={TextSize("large")} style={buttonStyle}><p>Large</p></button>
        <p style={profileText}>Theme: </p>
    </div>
    );
}
export default Profile;