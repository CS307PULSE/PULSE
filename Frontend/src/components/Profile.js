import TestIcon from "../test_icon.jpg"
import { React, useEffect, useState } from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import { pulseColors } from "../theme/Colors";
import axios from "axios";

import Colors from "../theme/Colors"; 
import TextSize from "../theme/TextSize";

var textSizeSetting, themeSetting;
try {
    var textSizeResponse = await axios.get("http://127.0.0.1:5000/get_text_size", {withCredentials: true});
    textSizeSetting = textSizeResponse.data;
    console.log("Profile Text Size Setting: " + textSizeSetting);

    var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {withCredentials: true});
    themeSetting = themeResponse.data;
    console.log("Profile Theme Setting: " + textSizeSetting);
} catch (e) {
    console.log("Formatting settings fetch failed: " + e);
    textSizeSetting = 1;
    themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

const bodyStyle = {
    backgroundColor: themeColors.background,
    margin: 0,
    padding: 0,
    maxHeight: '100vh',
    overflow: "auto"
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
    height: "50px",
    fontSize: textSizes.body
};

const textFieldStyle = {
    backgroundColor: themeColors.background,
    borderRadius: "10px",
    height: "20px",
    width: "300px",
    color: themeColors.text,
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

var storedUsername, storedGender, storedLocation;
try {
    storedUsername = await axios.get("http://127.0.0.1:5000/get_text_size", {withCredentials: true}).data;
    storedGender = await axios.get("http://127.0.0.1:5000/get_theme", {withCredentials: true}).data;
    storedLocation = await axios.get("http://127.0.0.1:5000/get_theme", {withCredentials: true}).data;
} catch (e) {
    console.log("User info fetch failed: " + e);
    storedUsername = "undefined";
    storedGender = "undefined";
    storedLocation = "undefined";
}

async function saveTheme(themeParameter) {
    const axiosInstance = axios.create({
        withCredentials: true,
      });
      const response = await axiosInstance.post(
        "http://127.0.0.1:5000/set_theme",
        {
          theme: themeParameter
        }
      );
      const data = response.data;
      console.log("Attempted post with value " + themeParameter);
      window.location.reload();
      return data;
}
async function saveTextSize(textSizeParameter) {
    const axiosInstance = axios.create({
        withCredentials: true,
      });
      const response = await axiosInstance.post(
        "http://127.0.0.1:5000/set_text_size",
        {
          text_size: textSizeParameter
        }
      );
      const data = response.data;
      console.log("Attempted post with value " + textSizeParameter);
      window.location.reload();
      return data;
}
async function saveUsername(usernameParameter) {
    console.log("Attempting username post with value " + usernameParameter);
    const axiosInstance = axios.create({
        withCredentials: true,
      });
      const response = await axiosInstance.post(
        "http://127.0.0.1:5000/profile/change_displayname",
        {
          displayname: usernameParameter
        }
      );
      const data = response.data;
      return data;
}
async function saveGender(genderParameter) {
    console.log("Attempting gender post with value " + genderParameter);
    const axiosInstance = axios.create({
        withCredentials: true,
      });
      const response = await axiosInstance.post(
        "http://127.0.0.1:5000/profile/change_gender",
        {
          gender: genderParameter
        }
      );
      const data = response.data;
      return data;
}
async function saveLocation(locationParameter) {
    console.log("Attempting location post with value " + locationParameter);
    const axiosInstance = axios.create({
        withCredentials: true,
      });
      const response = await axiosInstance.post(
        "http://127.0.0.1:5000/profile/change_location",
        {
          location: locationParameter
        }
      );
      const data = response.data;
      return data;
}
async function saveUserInfo(username, gender, location) {
    saveUsername(username);
    saveGender(gender);
    saveLocation(location);
}

function Profile({testParameter}){

    const [username, setUsername] = useState(storedUsername);
    const [gender, setGender] = useState(storedGender);
    const [location, setLocation] = useState(storedLocation);

    return(
    <div style={bodyStyle}>
        <Navbar />
        <div className="profile" style={profileContainerStyle}>
            <p style={profileHeader}>Profile</p>
                
            <div style={iconContainerStyle}>
                <img style={iconPictureStyle} src={TestIcon}/>
                <input id="file" accept="image/jpeg,image/png" name="fileToUpload" type="file"/>
            </div> <br></br>

            <label style={profileText} for="username">Username: </label>
            <input id="username" type="text" style={textFieldStyle} value={username} onChange={e => {setUsername(e.target.value)}}></input> <br></br>
            
            <label style={profileText} for="gender">Gender: </label>
            <input id="gender" type="text" style={textFieldStyle} value={gender} onChange={e => {setGender(e.target.value)}}></input> <br></br>

            <label style={profileText} for="location">Location: </label>
            <input id="location" type="text" style={textFieldStyle} value={location} onChange={e => {setLocation(e.target.value)}}></input> <br></br>

            <div style={buttonContainerStyle}>
                <button onClick={() => {saveUserInfo(username, gender, location)}} style={buttonStyle}><p>Save Profile</p></button>
            </div>

            <p style={profileHeader}>Settings</p>
            <p style={profileText}>Text Size: </p>
            <div style={buttonContainerStyle}>
                <button onClick={() => {saveTextSize(0)}} style={buttonStyle}><p>Small</p></button>
                <button onClick={() => {saveTextSize(1)}} style={buttonStyle}><p>Medium</p></button>
                <button onClick={() => {saveTextSize(2)}} style={buttonStyle}><p>Large</p></button>
            </div>

            <p style={profileText}>Theme: </p>
            <div style={buttonContainerStyle}>
                <button onClick={() => {saveTheme(0)}} style={buttonStyle}><p>Dark</p></button>
                <button onClick={() => {saveTheme(1)}} style={buttonStyle}><p>Light</p></button>
            </div>
        </div>
        <div style={{padding: "60px"}}></div>
        <SongPlayer />
    </div>
    );
}
export default Profile;