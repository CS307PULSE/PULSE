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
    var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {withCredentials: true});
    themeSetting = themeResponse.data;
} catch (e) {
    console.log("Formatting settings fetch failed: " + e);
    textSizeSetting = 1;
    themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

var storedUsername, storedGender, storedLocation, storedImagePath;
try {
    var usernameResponse = await axios.get("http://127.0.0.1:5000/profile/get_displayname", {withCredentials: true});
    storedUsername = usernameResponse.data;
    var genderResponse = await axios.get("http://127.0.0.1:5000/profile/get_gender", {withCredentials: true});
    storedGender = genderResponse.data;
    var locationResponse = await axios.get("http://127.0.0.1:5000/profile/get_location", {withCredentials: true});
    storedLocation = locationResponse.data;
    var imageResponse = await axios.get("http://127.0.0.1:5000/profile/get_image", {withCredentials: true});
    storedImagePath = imageResponse.data;
    console.log(storedImagePath);
} catch (e) {
    console.log("User info fetch failed: " + e);
    storedUsername = "undefined";
    storedGender = "undefined";
    storedLocation = "undefined";
    storedImagePath = "undefined";
}

function Profile({testParameter}){

    const [imagePath, setImagePath] = useState(storedImagePath);
    const [username, setUsername] = useState(storedUsername);
    const [gender, setGender] = useState(storedGender);
    const [location, setLocation] = useState(storedLocation);
    const [textColor, setTextColor] = useState(themeColors.text);
    const [backgroundColor, setBackgroundColor] = useState(themeColors.background);
    const [accentColor, setAccentColor] = useState(themeColors.green);

    const bodyStyle = {
        backgroundColor: backgroundColor,
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
        color: textColor,
        fontFamily: "'Poppins', sans-serif",
        fontSize: textSizes.header1,
        fontStyle: "normal",
        fontWeight: 600,
        lineHeight: "normal"
    };
    const profileText={
        color: textColor,
        fontSize: textSizes.body,
        fontStyle: "normal",
        fontFamily: "'Poppins', sans-serif"
    };
    
    const buttonContainerStyle = {
        display: 'flex',
        alignItems: 'center', // Center buttons horizontally
        marginTop: '5px', // Space between cards and buttons
        width: "500px"
    };
    const customThemeContainerStyle = {
        display: 'grid',
        gridTemplateColumns: "repeat(3, 1fr)",
        width: "500px"
    };
    
    const buttonStyle = {
        backgroundColor: backgroundColor,
        color: textColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: textColor,
        borderRadius: '10px',
        cursor: 'pointer',
        margin: '5px', // Small space between buttons
        width: '100%',
        height: "50px",
        fontSize: textSizes.body
    };
    
    const textFieldStyle = {
        backgroundColor: backgroundColor,
        borderRadius: "10px",
        height: "20px",
        width: "300px",
        color: textColor,
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
    async function saveImagePath(imagePathParameter) {
        console.log("Attempting location post with value " + imagePathParameter);
        const axiosInstance = axios.create({
            withCredentials: true,
          });
          const response = await axiosInstance.post(
            "http://127.0.0.1:5000/profile/upload",
            {
              filepath: imagePathParameter
            }
          );
          const data = response.data;
          return data;
    }
    
    async function handleImageSelect(event) {
        const file = event.target.files[0]; // Get the first selected file
        if (file) {
            console.log(file);
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.post(
                "http://127.0.0.1:5000/profile/upload",
                {
                    file_to_upload: file
                },
            );
            const data = response.data;
            return data;
        }
    }
    
    async function saveUserInfo(username, gender, location, imagePath) {
        saveUsername(username);
        saveGender(gender);
        saveLocation(location);
        saveImagePath(imagePath);
        window.location.reload();
    }

    return(
    <div style={bodyStyle}>
        <Navbar />
        <div className="profile" style={profileContainerStyle}>
            <p style={profileHeader}>Profile</p>
                
            <div style={iconContainerStyle}>
                <img style={iconPictureStyle} src={storedImagePath}/>
                
                {/* <input id="file" accept="image/jpeg,image/png" type="file" onChange={handleImageSelect}/> */}
            </div> <br></br>
            
            <label style={profileText}>Icon Link: </label>
            <input id="icon-url" type="text" style={textFieldStyle} value={imagePath} onChange={e => {setImagePath(e.target.value)}}></input> <br></br>

            <label style={profileText}>Username: </label>
            <input id="username" type="text" style={textFieldStyle} value={username} onChange={e => {setUsername(e.target.value)}}></input> <br></br>
            
            <label style={profileText}>Gender: </label>
            <input id="gender" type="text" style={textFieldStyle} value={gender} onChange={e => {setGender(e.target.value)}}></input> <br></br>

            <label style={profileText}>Location: </label>
            <input id="location" type="text" style={textFieldStyle} value={location} onChange={e => {setLocation(e.target.value)}}></input> <br></br>

            <div style={buttonContainerStyle}>
                <button onClick={() => {saveUserInfo(username, gender, location, imagePath)}} style={buttonStyle}><p>Save Profile</p></button>
            </div>

            <p style={profileHeader}>Settings</p>
            <p style={profileText}>Text Size: </p>
            <div style={buttonContainerStyle}>
                <button onClick={() => {saveTextSize(0)}} style={buttonStyle}><p>Small</p></button>
                <button onClick={() => {saveTextSize(1)}} style={buttonStyle}><p>Medium</p></button>
                <button onClick={() => {saveTextSize(2)}} style={buttonStyle}><p>Large</p></button>
            </div>

            <p style={profileText}>Theme Presets: </p>
            <div style={buttonContainerStyle}>
                <button onClick={() => {saveTheme(0)}} style={buttonStyle}><p>Dark</p></button>
                <button onClick={() => {saveTheme(1)}} style={buttonStyle}><p>Light</p></button>
            </div>
            <p style={profileText}>Custom Theme Colors: </p>
            <div style={customThemeContainerStyle}>
                <div style={{width: "100px"}}>
                    <label style={profileText} for="textColorPicker">Text</label><br></br>
                    <input style={buttonStyle} type="color" id="textColorPicker" onChange={e => {setTextColor(e.target.value)}} value={textColor}></input>
                </div>
                <div style={{width: "100px"}}>
                    <label style={profileText} for="backgroundColorPicker">Background</label><br></br>
                    <input style={buttonStyle} type="color" id="textColorPicker" onChange={e => {setBackgroundColor(e.target.value)}} value={backgroundColor}></input>
                </div>
                <div style={{width: "100px"}}>
                    <label style={profileText} for="accentColorPicker">Accent</label><br></br>
                    <input style={buttonStyle} type="color" id="textColorPicker" onChange={e => {setAccentColor(e.target.value)}} value={accentColor}></input>
                </div>
            </div>
            <br></br>
            <label style={profileText} for="customColors">Custom themes:</label>
            <div style={buttonContainerStyle}>
                <select style={buttonStyle} id="customColors" name="colors">
                    <option>Red</option>
                    <option>Blue</option>
                    <option>Green</option>
                </select>
            </div>
        </div>
        <div style={{padding: "60px"}}></div>
        <SongPlayer />
    </div>
    );
}
export default Profile;