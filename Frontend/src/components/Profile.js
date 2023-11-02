import { React, useState } from "react";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import axios from "axios";
import { useAppContext } from "./Context"
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";

// try {
//     var textSizeResponse = await axios.get("http://127.0.0.1:5000/get_text_size", {withCredentials: true});
//     storedTextSizeSetting = textSizeResponse.data;
//     var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {withCredentials: true});
//     themeSetting = themeResponse.data;   
// } catch (e) {
//     console.log("Formatting settings fetch failed: " + e);
//     storedTextSizeSetting = 1;
//     themeSetting = 0;
// }

const customBackgrounds = [ "https://images.pexels.com/photos/2382325/pexels-photo-2382325.jpeg?cs=srgb&dl=pexels-suzy-hazelwood-2382325.jpg&fm=jpg",
                            "https://wallpapers.com/images/featured/blue-galaxy-txrbj85vrv1fzm4c.jpg",
                            "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/07/five-nights-at-freddys-lore-story-so-far.jpg"
]

var storedUserFields;
try {
    storedUserFields = {
        username: await getUserField("http://127.0.0.1:5000/profile/get_displayname"),
        gender: await getUserField("http://127.0.0.1:5000/profile/get_gender"),
        location: await getUserField("http://127.0.0.1:5000/profile/get_location"),
        icon: await getUserField("http://127.0.0.1:5000/profile/get_image"),
        favoriteSong: await getUserField("http://127.0.0.1:5000/profile/get_chosen_song")
    }
} catch (e) {
  console.log("User info fetch failed: " + e);
    storedUserFields = {
        username: "undefined",
        gender: "undefined",
        location: "undefined",
        icon: "undefined"
    }
}
async function getUserField(route) {
    var response = await axios.get(route, { withCredentials: true });
    return response.data;
}
async function saveUserField(route, payload) {
    const axiosInstance = axios.create({withCredentials: true});
    const response = await axiosInstance.post(route, payload);
    return response.data;
}

function Profile({testParameter}){

    const { state, dispatch } = useAppContext();

    const [imagePath, setImagePath] = useState(storedUserFields.icon);
    const [username, setUsername] = useState(storedUserFields.username);
    const [gender, setGender] = useState(storedUserFields.gender);
    const [location, setLocation] = useState(storedUserFields.location);
    const [favoriteSong, setFavoriteSong] = useState(storedUserFields.favoriteSong);

    const updateTextSize = (newSetting) => {
        dispatch({ type: 'UPDATE_TEXT_SIZE', payload: newSetting });
    };
    const textSizes = TextSize(state.settingTextSize); //Obtain text size values
    
    const updateColor = (colorType, newColor) => {
        switch (colorType) {
            case "all":
                dispatch({ type: 'UPDATE_COLOR_ALL', payload: newColor }); break;
            case "background": 
                dispatch({ type: 'UPDATE_COLOR_BACKGROUND', payload: newColor }); break;
            case "text": 
                dispatch({ type: 'UPDATE_COLOR_TEXT', payload: newColor }); break;
            case "border": 
                dispatch({ type: 'UPDATE_COLOR_BORDER', payload: newColor }); break;
            case "accent": 
                dispatch({ type: 'UPDATE_COLOR_ACCENT', payload: newColor }); break;
        }
    }
    const updateBackgroundImage = (newSetting) => {
        dispatch({ type: 'UPDATE_BACKGROUND_IMAGE', payload: newSetting });
    };

    const bodyStyle = {
        backgroundColor: state.colorBackground,
        backgroundImage: "url('" + state.backgroundImage + "')",
        backgroundSize: "cover", //Adjust the image size to cover the element
        backgroundRepeat: "no-repeat", //Prevent image repetition
        backgroundAttachment: "fixed", //Keep the background fixed
    };
    const sectionContainerStyle = {
        backgroundColor: hexToRGBA(state.colorBackground, 0.5),
        width: "600px",
        padding: "20px",
        margin: "20px",
        position: "relative"
    }
    const headerTextStyle = {
        color: state.colorText,
        fontFamily: "'Poppins', sans-serif",
        fontSize: textSizes.header1,
        fontStyle: "normal",
        fontWeight: 600,
        lineHeight: "normal"
    };
    const profileText={
        // backgroundColor: backgroundColor,
        color: state.colorText,
        fontSize: textSizes.body,
        fontStyle: "normal",
        fontFamily: "'Poppins', sans-serif"
    };
    const buttonContainerStyle = {
        display: 'flex',
        alignItems: 'center', // Center buttons horizontally
        marginTop: '5px', // Space between cards and buttons
        width: "600px"
    };
    const customThemeContainerStyle = {
        display: 'grid',
        gridTemplateColumns: "repeat(4, 1fr)",
        width: "500px"
    };
    const buttonStyle = {
        backgroundColor: state.colorBackground,
        color: state.colorText,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: state.colorBorder,
        borderRadius: '10px',
        cursor: 'pointer',
        margin: '5px', // Small space between buttons
        width: '100%',
        height: "50px",
        fontSize: textSizes.body
    };
    const textFieldContainerStyle = {
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "10px",
        height: "40px"
    }
    const textFieldStyle = {
        backgroundColor: state.colorBackground,
        border: "1px " + state.colorBorder + " solid",
        borderRadius: "10px",
        height: "20px",
        width: "300px",
        color: state.colorText,
        padding: "10px",
        position: "absolute",
        right: "20px"
    };
    const iconContainerStyle = {
        position: "absolute",
        top: "20px",
        right: "20px",
        display: "inline-block",
        justifyContent: "center"
    }
    const iconPictureStyle = {
        width: "120px",
        height: "120px",
        borderRadius: "10px"
    }
    const backgroundOptionStyle = {
        width: "160px",
        height: "90px",
        borderRadius: "10px",
        margin:"20px",
        border: "1px " + state.colorBorder + " solid"
    }
    
    async function saveUserInfo() {
        const savePromises = [
            saveUserField("http://127.0.0.1:5000/profile/change_displayname", {displayname: username}),
            saveUserField("http://127.0.0.1:5000/profile/change_gender", {gender: gender}),
            saveUserField("http://127.0.0.1:5000/profile/change_location", {location: location}),
            saveUserField("http://127.0.0.1:5000/profile/upload", {filepath: imagePath}),
            saveUserField("http://127.0.0.1:5000/profile/change_chosen_song", {chosen_song: favoriteSong})
        ]
        await Promise.all(savePromises);
        window.location.reload();
    }
    async function saveUserSettings() {
        const colorArray = [state.colorBackground, state.colorText, state.colorBorder, state.colorAccent];
        const themesArray = [colorArray, [], [], [], []];
        const savePromises = [
            saveUserField("http://127.0.0.1:5000/set_text_size", {text_size: state.settingTextSize}),
            saveUserField("http://127.0.0.1:5000/profile/change_background", {background: state.backgroundImage}),
            saveUserField("http://127.0.0.1:5000/profile/change_themes", {themes: themesArray})
        ]
        await Promise.all(savePromises);
        window.location.reload();
    }
    return(
    <div className="wrapper">
        <div className="header"><Navbar /></div>
        <div className="content" style={bodyStyle}>
            <div style={sectionContainerStyle}>
                <p style={headerTextStyle}>Profile</p>
                <div style={iconContainerStyle}>
                    <img style={iconPictureStyle} src={storedUserFields.icon}/>
                    {/* <input id="file" accept="image/jpeg,image/png" type="file" onChange={handleImageSelect}/> */}
                </div> <br></br>
                
                <div style={textFieldContainerStyle}>
                    <label style={profileText}>Icon Link</label>
                    <input id="icon-url" type="text" style={textFieldStyle} value={imagePath} onChange={e => {setImagePath(e.target.value)}}></input>
                </div>

                <div style={textFieldContainerStyle}>
                    <label style={profileText}>Username</label>
                    <input id="username" type="text" style={textFieldStyle} value={username} onChange={e => {setUsername(e.target.value)}}></input>
                </div>

                <div style={textFieldContainerStyle}>
                    <label style={profileText}>Gender</label>
                    <input id="gender" type="text" style={textFieldStyle} value={gender} onChange={e => {setGender(e.target.value)}}></input>
                </div>

                <div style={textFieldContainerStyle}>
                    <label style={profileText}>Location</label>
                    <input id="location" type="text" style={textFieldStyle} value={location} onChange={e => {setLocation(e.target.value)}}></input>
                </div>

                <div style={textFieldContainerStyle}>
                    <label style={profileText}>Favorite Song</label>
                    <input id="favorite-song" type="text" style={textFieldStyle} value={favoriteSong} onChange={e => {setFavoriteSong(e.target.value)}}></input>
                </div>

                <div style={buttonContainerStyle}>
                    <button onClick={() => {saveUserInfo()}} style={buttonStyle}><p>Save Profile</p></button>
                </div>
            </div>
            <div style={sectionContainerStyle}>
                <p style={headerTextStyle}>Settings</p>

                <p style={profileText}>Text Size</p>
                <div style={buttonContainerStyle}>
                    <button onClick={() => updateTextSize(0)} style={buttonStyle}><p>Small</p></button>
                    <button onClick={() => updateTextSize(1)} style={buttonStyle}><p>Medium</p></button>
                    <button onClick={() => updateTextSize(2)} style={buttonStyle}><p>Large</p></button>
                </div>

                <p style={{...headerTextStyle, fontSize: textSizes.header2}}>Color Theme</p>
                <p style={profileText}>Theme Presets</p>
                <div style={buttonContainerStyle}>
                    <button onClick={() => {}} style={buttonStyle}><p>Dark</p></button>
                    <button onClick={() => {}} style={buttonStyle}><p>Light</p></button>
                </div>
                <p style={profileText}>Custom Theme Colors</p>
                <div style={customThemeContainerStyle}>
                    <div style={{width: "100px"}}>
                        <label style={profileText} htmlFor="backgroundColorPicker">Background</label><br></br>
                        <input style={buttonStyle} type="color" id="backgroundColorPicker" onChange={e => {updateColor("background", e.target.value)}} value={state.colorBackground}></input>
                    </div>
                    <div style={{width: "100px"}}>
                        <label style={profileText}>Text</label><br></br>
                        <input style={buttonStyle} type="color" id="textColorPicker" onChange={e => {updateColor("text", e.target.value)}} value={state.colorText}></input>
                    </div>
                    <div style={{width: "100px"}}>
                        <label style={profileText} htmlFor="borderColorPicker">Border</label><br></br>
                        <input style={buttonStyle} type="color" id="borderColorPicker" onChange={e => {updateColor("border", e.target.value)}} value={state.colorBorder}></input>
                    </div>
                    <div style={{width: "100px"}}>
                        <label style={profileText} htmlFor="accentColorPicker">Accent</label><br></br>
                        <input style={buttonStyle} type="color" id="accentColorPicker" onChange={e => {updateColor("accent", e.target.value)}} value={state.colorAccent}></input>
                    </div>
                </div>
                <br></br>
                <p style={profileText} htmlFor="customColors">Saved Themes</p>
                <div style={buttonContainerStyle}>
                    <select style={buttonStyle} id="customColors" name="colors">
                        <option>Red</option>
                        <option>Blue</option>
                        <option>Green</option>
                    </select>
                </div>
                <p style={{...headerTextStyle, fontSize: textSizes.header2}}>Background</p>
                <div style={buttonContainerStyle}>
                    <button onClick={() => {updateBackgroundImage("")}} style={buttonStyle}><p>Clear</p></button>
                </div>
                <div style={buttonContainerStyle}>
                {customBackgrounds.map((item, index) => (
                    <img key={index} style={backgroundOptionStyle} src={item} onClick={() => {updateBackgroundImage(item)}}></img>
                ))}
                </div>

                <div style={textFieldContainerStyle}>
                    <label style={profileText}>Background URL</label>
                    <input id="custom-background" type="text" style={textFieldStyle} value={state.backgroundImage} onChange={e => {updateBackgroundImage(e.target.value)}}></input> <br></br>
                </div>
                <div style={buttonContainerStyle}>
                    <button style={buttonStyle} onClick={() => saveUserSettings()}>Save Settings</button>
                </div>
            </div>
        </div>
        <div className="footer"><SongPlayer /></div>
    </div>
  );
}
export default Profile;