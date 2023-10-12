import TestIcon from "../test_icon.jpg"
import React from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
//import { pulseColors } from "../theme/Colors";

import Colors from "../theme/Colors"; 
import TextSize from "../theme/TextSize";
const textSizes = TextSize(1); //Obtain text size values
const themeColors = Colors("dark"); //Obtain color values

const bodyStyle = {
    backgroundColor: themeColors.background,
    margin: 0,
    padding: 0,
    height: '100vh',
};
const profileContainerStyle = {
    padding: "20px",
    margin: "0px",
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "100%", // Set height to 100vh to cover the entire height of the screen
    display: "inline-block"
};
const profileHeader={
    color: themeColors.text,
    fontFamily: "'Poppins', sans-serif",
    fontSize: textSizes.header1,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal"
};
const profileText={
    color: themeColors.text,
    fontSize: textSizes.body,
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif"
};

const buttonContainerStyle = {
    display: 'flex',
    alignItems: 'center', // Center buttons horizontally
    marginTop: '10px', // Space between cards and buttons
    width: "500px"
};

const buttonStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: themeColors.text,
    borderRadius: '10px',
    cursor: 'pointer',
    margin: '5px', // Small space between buttons
    width: '100%',
    height: "50px"
};

const textFieldStyle = {
    backgroundColor: "#222",
    borderRadius: "10px",
    height: "20px",
    width: "300px",
    color:"#FFFFFF",
    padding: "10px",
    margin:"10px"
};

const iconContainerStyle = {
    width: "100px",
    height: "120px",
    position: "relative",
    display: "inline-block",
    justifyContent: "center"
}
const iconPictureStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "10px"
}

function Profile({testParameter}){

    return(
    <div style={bodyStyle}>
        <Navbar />
        <div className="profile" style={profileContainerStyle}>
            <p style={profileHeader}>Profile</p>
            <form action="fileupload.php" enctype="multipart/form-data" method="post">
                
                <div style={iconContainerStyle}>
                    <img style={iconPictureStyle} src={TestIcon}/>
                    <input id="file" accept="image/jpeg,image/png" name="fileToUpload" type="file"/>
                </div> <br></br>

                <label style={profileText} for="username">Username: </label>
                <input id="username" type="text" style={textFieldStyle}></input> <br></br>
                
                <label style={profileText} for="gender">Gender: </label>
                <input id="gender" type="text" style={textFieldStyle}></input> <br></br>

                <label style={profileText} for="location">Location: </label>
                <input id="location" type="text" style={textFieldStyle}></input> <br></br>

                <div style={buttonContainerStyle}>
                    <button style={buttonStyle} name="submit" type="submit" onsubmit="">Save Changes</button>
                </div>
            </form>

            <p style={profileHeader}>Settings</p>

            <p style={profileText}>Text Size: </p>
            <div style={buttonContainerStyle}>
                <button onclick={TextSize(1)} style={buttonStyle}><p>Small</p></button>
                <button onclick={TextSize(1)} style={buttonStyle}><p>Medium</p></button>
                <button onclick={TextSize(1)} style={buttonStyle}><p>Large</p></button>
            </div>

            <p style={profileText}>Theme: </p>
            <div style={buttonContainerStyle}>
                <button onclick={Colors("light")} style={buttonStyle}><p>Light</p></button>
                <button onclick={Colors("darK")} style={buttonStyle}><p>Dark</p></button>
            </div>
        </div>
        <SongPlayer />
    </div>
    );
}
export default Profile;