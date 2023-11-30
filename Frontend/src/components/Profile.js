import { React, useEffect, useState } from "react";
import Navbar from "./NavBar";
import Playback from "./Playback";
import axios from "axios";
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import { hexToRGBA, presetColors } from "../theme/Colors";
import Friend from "./Friend";
axios.defaults.baseURL = process.env.REACT_APP_SITE_URI;

const customBackgrounds = [
  "https://images.pexels.com/photos/2382325/pexels-photo-2382325.jpeg?cs=srgb&dl=pexels-suzy-hazelwood-2382325.jpg&fm=jpg",
  "https://wallpapers.com/images/featured/blue-galaxy-txrbj85vrv1fzm4c.jpg",
  "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/07/five-nights-at-freddys-lore-story-so-far.jpg",
];

var storedUserFields;
try {
  storedUserFields = {
    username: await getUserField("/api/profile/get_displayname"),
    gender: await getUserField("/api/profile/get_gender"),
    location: await getUserField("/api/profile/get_location"),
    icon: await getUserField("/api/profile/get_image"),
    favoriteSong: await getUserField("/api/profile/get_chosen_song"),
  };
} catch (e) {
  console.log("User info fetch failed: " + e);
  storedUserFields = {
    username: "undefined",
    gender: "undefined",
    location: "undefined",
    icon: "undefined",
  };
}
async function getUserField(route) {
  var response = await axios.get(route, { withCredentials: true });
  return response.data;
}
async function saveUserField(route, payload) {
  const axiosInstance = axios.create({ withCredentials: true });
  const response = await axiosInstance.post(route, payload);
  return response.data;
}

function Profile({ testParameter }) {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [imagePath, setImagePath] = useState(storedUserFields.icon);
  const [username, setUsername] = useState(storedUserFields.username);
  const [gender, setGender] = useState(storedUserFields.gender);
  const [location, setLocation] = useState(storedUserFields.location);
  const [favoriteSong, setFavoriteSong] = useState(storedUserFields.favoriteSong);
  const [status, setStatus] = useState("No Status"); //storedUserFields.status
  const [publicColorText, setPublicColorText] = useState("#FFFFFF"); //storedUserFields.publicColor
  const [publicColorBackground, setPublicColorBackground] = useState("#000000"); //storedUserFields.publicColor
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(-1);
  const [newThemeName, setNewThemeName] = useState("New Theme");
  const [themeEditsMade, setThemeEditsMade] = useState(false);

  const updateTextSize = (newSetting) => {
    dispatch({ type: "UPDATE_TEXT_SIZE", payload: newSetting });
  };

  const updateColor = (colorType, newColor) => {
    switch (colorType) {
      case "all":
        dispatch({ type: "UPDATE_COLOR_ALL", payload: newColor });
        break;
      case "background":
        dispatch({ type: "UPDATE_COLOR_BACKGROUND", payload: newColor });
        break;
      case "text":
        dispatch({ type: "UPDATE_COLOR_TEXT", payload: newColor });
        break;
      case "border":
        dispatch({ type: "UPDATE_COLOR_BORDER", payload: newColor });
        break;
      case "accent":
        dispatch({ type: "UPDATE_COLOR_ACCENT", payload: newColor });
        break;
    }
    setThemeEditsMade(true);
  };
  const updateBackgroundImage = (newSetting) => {
    dispatch({ type: "UPDATE_BACKGROUND_IMAGE", payload: newSetting });
    setThemeEditsMade(false);
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
    position: "relative",
  };
  const headerTextStyle = {
    color: state.colorText,
    fontFamily: "'Poppins', sans-serif",
    fontSize: textSizes.header1,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
  };
  const profileText = {
    // backgroundColor: backgroundColor,
    color: state.colorText,
    fontSize: textSizes.body,
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif",
  };

  const customThemeContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    width: "500px",
  };
  const buttonContainerStyle = {
    display: "flex",
    alignItems: "center", // Center buttons horizontally
    marginTop: "5px", // Space between cards and buttons
    width: "600px",
  };
  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.colorBorder,
    borderRadius: "10px",
    cursor: "pointer",
    margin: "5px",
    width: "100%",
    height: "50px",
    fontSize: textSizes.body
  };
  const textFieldContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "10px",
    height: "40px",
  };
  const textFieldStyle = {
    backgroundColor: state.colorBackground,
    border: "1px " + state.colorBorder + " solid",
    borderRadius: "10px",
    height: "20px",
    width: "300px",
    color: state.colorText,
    padding: "10px",
    position: "absolute",
    right: "20px",
  };
  const iconContainerStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    display: "inline-block",
    justifyContent: "center",
  };
  const iconPictureStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "10px",
  };
  const backgroundOptionStyle = {
    width: "160px",
    height: "90px",
    borderRadius: "10px",
    margin: "20px",
    border: "1px " + state.colorBorder + " solid",
  };
  function getCurrentColorArray() {
    return [
      state.colorBackground,
      state.colorText,
      state.colorBorder,
      state.colorAccent,
    ];
  }

  function retrieveTheme(index) {
    var retrievedTheme = state.savedThemes[index];
    if (index < 0 || retrieveTheme == undefined) {
      return;
    }
    setNewThemeName(retrievedTheme[0]);
    dispatch({ type: "UPDATE_COLOR_ALL", payload: retrievedTheme.slice(1,5) });
    if (state.savedThemes[index].length > 5) {
      dispatch({ type: "UPDATE_BACKGROUND_IMAGE", payload: retrievedTheme[5] });
    }
    setThemeEditsMade(false);
    console.log(state.savedThemes);
  }
  useEffect(() => {
    retrieveTheme(selectedThemeIndex);
  }, [selectedThemeIndex]);
  function createTheme() {
    var newSavedThemes = state.savedThemes;
    newSavedThemes.push([newThemeName, ...getCurrentColorArray(), state.backgroundImage]);
    dispatch({ type: "UPDATE_SAVED_THEMES", payload: newSavedThemes });
    setSelectedThemeIndex(newSavedThemes.length - 1);
    setThemeEditsMade(false);
  }
  function updateTheme(index, name, newColors) {
    if (state.savedThemes[index] == undefined) {
      return;
    }
    var newSavedThemes = state.savedThemes;
    newSavedThemes[index] = [newThemeName, ...getCurrentColorArray(), state.backgroundImage];
    dispatch({ type: "UPDATE_SAVED_THEMES", payload: newSavedThemes });
    setThemeEditsMade(false);
  }
  function deleteTheme(index) {
    if (state.savedThemes[index] == undefined) {
      return;
    }
    setSelectedThemeIndex(-1);
    var newSavedThemes = state.savedThemes;
    newSavedThemes.splice(index, 1);
    dispatch({ type: "UPDATE_SAVED_THEMES", payload: newSavedThemes });
    setThemeEditsMade(false);
  }

  async function saveUserInfo() {
    const savePromises = [
      saveUserField("/api/profile/set_displayname", { displayname: username }),
      saveUserField("/api/profile/set_gender", { gender: gender }),
      saveUserField("/api/profile/set_location", { location: location }),
      saveUserField("/api/profile/set_image", { filepath: imagePath }),
      saveUserField("/api/profile/set_chosen_song", { chosen_song: favoriteSong }),
    ];
    await Promise.all(savePromises);
    window.location.reload();
  }
  async function saveUserSettings() {
    const savePromises = [
      saveUserField("/api/profile/set_text_size", {
        text_size: state.settingTextSize,
      }),
      saveUserField("/api/profile/set_background_image", {
        background: state.backgroundImage,
      }),
      saveUserField("/api/profile/set_color_palette", {
        color_palette: [getCurrentColorArray()],
      }),
      saveUserField("/api/profile/set_saved_themes", { themes: state.savedThemes }),
    ];
    await Promise.all(savePromises);
    window.location.reload();
  }
  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
          <div>
          <div style={sectionContainerStyle}>
              <Friend
                name={storedUserFields.username}
                photoFilename={storedUserFields.icon}
                favoriteSong={storedUserFields.favoriteSong}
                status={status}
                publicColorText={publicColorText}
                publicColorBackground={publicColorBackground}
              />
            </div>
            <div style={sectionContainerStyle}>
              <p style={headerTextStyle}>Profile</p>
              <button style={{...buttonStyle, width:"calc(100% - 300px)", position:"absolute", top:"60px", right:"20px"}}
                onClick={() => {saveUserInfo()}}>Save Profile</button>
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
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Status</label>
                <input id="favorite-song" type="text" style={textFieldStyle} value={status} onChange={e => {setStatus(e.target.value)}}></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Public Color</label>
                <input style={{...textFieldStyle, width:"100px", height:"50px"}} type="color" onChange={e => {setPublicColorText(e.target.value)}} value={publicColorText}></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Public Background</label>
                <input style={{...textFieldStyle, width:"100px", height:"50px"}} type="color" onChange={e => {setPublicColorBackground(e.target.value)}} value={publicColorBackground}></input>
              </div>
            </div>
          </div> 
          <div>
          <div style={sectionContainerStyle}>
              <p style={headerTextStyle}>Settings</p>
              <button style={{...buttonStyle, width:"calc(100% - 300px)", position:"absolute", top:"60px", right:"20px"}} 
                onClick={() => saveUserSettings()}>Save Settings</button>
              <p style={profileText}>Text Size</p>
              <div style={buttonContainerStyle}>
                <button onClick={() => updateTextSize(0)} style={buttonStyle}><p>Small</p></button>
                <button onClick={() => updateTextSize(1)} style={buttonStyle}><p>Medium</p></button>
                <button onClick={() => updateTextSize(2)} style={buttonStyle}><p>Large</p></button>
              </div>
              <p style={profileText}>Theme Presets</p>
              <div style={buttonContainerStyle}>
                <button onClick={() => {
                  updateColor("all", presetColors.dark);
                  updateBackgroundImage(customBackgrounds[0]);
                }} style={buttonStyle}><p>Dark</p></button>
                <button onClick={() => {
                  updateColor("all", presetColors.light);
                  updateBackgroundImage(customBackgrounds[1]);
                }} style={buttonStyle}><p>Light</p></button>
                <button onClick={() => {
                  updateColor("all", presetColors.scary);
                  updateBackgroundImage(customBackgrounds[2]);
                }} style={buttonStyle}><p>Scary</p></button>
              </div>
              <br></br>
              <p style={{...headerTextStyle, fontSize: textSizes.header3}} htmlFor="customColors">Custom Themes</p>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Theme Name</label>
                <input id="save-theme-name-input" type="text" style={textFieldStyle} value={newThemeName} onChange={e => {setNewThemeName(e.target.value); setThemeEditsMade(true);}}></input>
              </div>
              <div style={buttonContainerStyle}>
                <select style={buttonStyle} id="customColors" value={selectedThemeIndex} onChange={(e) => setSelectedThemeIndex(e.target.value)}>
                  <option key={-1} value={-1}></option>
                  {state.savedThemes.map((item, index) => (
                    <option key={index} value={index}>
                      {item[0]}
                    </option>
                  ))}
                </select>
              </div>
              <div style={buttonContainerStyle}>
                <button onClick={() => {updateTheme(selectedThemeIndex)}} style={buttonStyle}><p>{"Update Theme" + (themeEditsMade ? "*" : "")}</p></button>
                <button onClick={() => {createTheme()}} style={buttonStyle}><p>Create Theme</p></button>
                <button onClick={() => {deleteTheme(selectedThemeIndex)}} style={buttonStyle}><p>Delete Theme</p></button>
              </div>
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
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Background Image (URL)</label>
                <input id="custom-background" type="text" style={textFieldStyle} value={state.backgroundImage} onChange={e => {updateBackgroundImage(e.target.value)}}></input>
                <br></br>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <Playback />
      </div>
    </div>
  );
}
export default Profile;
