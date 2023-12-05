import { React, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // If using React Router for navigation
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

async function getUserInfo() {
  try {
    const response = await axios.get("/api/profile/get_user_info", { withCredentials: true });
    const data = response.data;
    return data;
  } catch (e) {
    console.log("Failed to get user data:");
    console.log(e);
    return {
      display_name: "undefined",
      gender: "",
      location: "",
      icon: "",
      favorite_song: "",
      status: "",
      text_color: "",
      background_color: ""
    }
  }
}
var storedUserFields = await getUserInfo();

async function setUserInfo(payload) {
  const axiosInstance = axios.create({ withCredentials: true });
  const response = await axiosInstance.post(
    "/api/profile/set_user_info",
    payload
  );
  return response.data;
}

function Profile({ testParameter }) {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize);
  const [changesMade, setChangesMade] = useState(false);

  const navigate = useNavigate()

  const [userIcon, setUserIcon] = useState(storedUserFields.icon);
  const [displayName, setDisplayName] = useState(storedUserFields.display_name);
  const [gender, setGender] = useState(storedUserFields.gender);
  const [location, setLocation] = useState(storedUserFields.location);
  const [favoriteSong, setFavoriteSong] = useState(
    storedUserFields.favorite_song
  );
  const [status, setStatus] = useState(storedUserFields.status);
  const [publicColorText, setPublicColorText] = useState(
    storedUserFields.text_color
  );
  const [publicColorBackground, setPublicColorBackground] = useState(
    storedUserFields.background_color
  );
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(-1);
  const [newThemeName, setNewThemeName] = useState("New Theme");
  const [themeEditsMade, setThemeEditsMade] = useState(false);

  const updateTextSize = (newSetting) => {
    dispatch({ type: "UPDATE_TEXT_SIZE", payload: newSetting });
    setChangesMade(true);
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
      default: return;
    }
    setChangesMade(true);
    setThemeEditsMade(true);
  };
  const updateBackgroundImage = (newSetting) => {
    dispatch({ type: "UPDATE_BACKGROUND_IMAGE", payload: newSetting });
    setChangesMade(true);
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
    fontSize: textSizes.header1,
    fontWeight: 600,
    lineHeight: "normal",
  };
  const profileText = {
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
    fontSize: textSizes.body,
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
    if (index < 0 || retrieveTheme === undefined) {
      return;
    }
    setNewThemeName(retrievedTheme[0]);
    dispatch({ type: "UPDATE_COLOR_ALL", payload: retrievedTheme.slice(1, 5) });
    if (state.savedThemes[index].length > 5) {
      dispatch({ type: "UPDATE_BACKGROUND_IMAGE", payload: retrievedTheme[5] });
    }
    setThemeEditsMade(false);
  }
  useEffect(() => {
    retrieveTheme(selectedThemeIndex);
  }, [selectedThemeIndex]);
  function createTheme() {
    var newSavedThemes = state.savedThemes;
    newSavedThemes.push([
      newThemeName,
      ...getCurrentColorArray(),
      state.backgroundImage,
    ]);
    dispatch({ type: "UPDATE_SAVED_THEMES", payload: newSavedThemes });
    setSelectedThemeIndex(newSavedThemes.length - 1);
    setThemeEditsMade(false);
  }
  function updateTheme(index, name, newColors) {
    if (state.savedThemes[index] === undefined) {
      return;
    }
    var newSavedThemes = state.savedThemes;
    newSavedThemes[index] = [
      newThemeName,
      ...getCurrentColorArray(),
      state.backgroundImage,
    ];
    dispatch({ type: "UPDATE_SAVED_THEMES", payload: newSavedThemes });
    setThemeEditsMade(false);
  }
  function deleteTheme(index) {
    if (state.savedThemes[index] === undefined) {
      return;
    }
    setSelectedThemeIndex(-1);
    var newSavedThemes = state.savedThemes;
    newSavedThemes.splice(index, 1);
    dispatch({ type: "UPDATE_SAVED_THEMES", payload: newSavedThemes });
    setThemeEditsMade(false);
  }

  async function handleLogout() {
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response =  axiosInstance.get(
      "/api/logout",
    );
    const data = response.data;
    navigate("/")
    window.location.reload();
    return
  }

  async function saveUserProfile() {
    const payload = {
      display_name: displayName,
      gender: gender,
      location: location,
      icon: userIcon,
      favorite_song: favoriteSong,
      status: status,
      text_color: publicColorText,
      background_color: publicColorBackground,
    };
    await setUserInfo(payload);
    window.location.reload();
  }
  async function saveUserSettings() {
    const axiosInstance = axios.create({ withCredentials: true });
    const requests = [
      axiosInstance.post("/api/profile/set_text_size", {
        text_size: state.settingTextSize,
      }),
      axiosInstance.post("/api/profile/set_background_image", {
        background: state.backgroundImage,
      }),
      axiosInstance.post("/api/profile/set_color_palette", {
        color_palette: [getCurrentColorArray()],
      }),
      axiosInstance.post("/api/profile/set_saved_themes", {
        themes: state.savedThemes,
      })
    ];
    await Promise.all(requests);
    setChangesMade(false);
    return requests;
  }
  async function handleSaveSettingsButton() {
    await saveUserSettings();
    window.location.reload();
  }
  
  window.addEventListener('beforeunload', function (e) {
    if (changesMade) {
      e.preventDefault();
      e.returnValue = '';
      return 'You have unsaved changes. Are you sure you want to leave?';
    }
  });

  return (

    <div className="wrapper">
      <div className="header">
        <Navbar />
      </div>
      <div className="content" style={bodyStyle}>
        <div style={{ display: "flex" }}>
          <div>
            <div style={sectionContainerStyle}>
              <Friend
                name={displayName}
                photoFilename={userIcon}
                favoriteSong={favoriteSong}
                status={status}
                publicColorText={publicColorText}
                publicColorBackground={publicColorBackground}
              />
            </div>
            <div style={sectionContainerStyle}>
              <p style={headerTextStyle}>Profile</p>
              <button
                style={{
                  ...buttonStyle,
                  width: "calc(100% - 300px)",
                  position: "absolute",
                  top: "60px",
                  right: "20px",
                }}
                onClick={() => {
                  saveUserProfile();
                }}
              >
                Save Profile
              </button>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Icon Link</label>
                <input
                  id="icon-url"
                  type="text"
                  style={textFieldStyle}
                  value={userIcon}
                  onChange={(e) => {
                    setUserIcon(e.target.value);
                  }}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Display Name</label>
                <input
                  id="display-name"
                  type="text"
                  style={textFieldStyle}
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                  }}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Gender</label>
                <input
                  id="gender"
                  type="text"
                  style={textFieldStyle}
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                  }}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Location</label>
                <input
                  id="location"
                  type="text"
                  style={textFieldStyle}
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                  }}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Favorite Song</label>
                <input
                  id="favorite-song"
                  type="text"
                  style={textFieldStyle}
                  value={favoriteSong}
                  onChange={(e) => {
                    setFavoriteSong(e.target.value);
                  }}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Status</label>
                <input
                  id="favorite-song"
                  type="text"
                  style={textFieldStyle}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Public Color</label>
                <input
                  style={{ ...textFieldStyle, width: "100px", height: "50px" }}
                  type="color"
                  onChange={(e) => {
                    setPublicColorText(e.target.value);
                  }}
                  value={publicColorText}
                ></input>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Public Background</label>
                <input
                  style={{ ...textFieldStyle, width: "100px", height: "50px" }}
                  type="color"
                  onChange={(e) => {
                    setPublicColorBackground(e.target.value);
                  }}
                  value={publicColorBackground}
                ></input>
              </div>
            </div>
          </div>
          <div>
            <div style={sectionContainerStyle}>
              <p style={headerTextStyle}>Settings</p>
              <button
                style={{
                  ...buttonStyle,
                  width: "calc(100% - 300px)",
                  position: "absolute",
                  top: "60px",
                  right: "20px",
                }}
                onClick={() => handleSaveSettingsButton()}
              >
                Save Settings
              </button>
              <p style={profileText}>Text Size</p>
              <div style={buttonContainerStyle}>
                <button onClick={() => updateTextSize(0)} style={buttonStyle}>
                  <p>Small</p>
                </button>
                <button onClick={() => updateTextSize(1)} style={buttonStyle}>
                  <p>Medium</p>
                </button>
                <button onClick={() => updateTextSize(2)} style={buttonStyle}>
                  <p>Large</p>
                </button>
              </div>
              <p style={profileText}>Theme Presets</p>
              <div style={buttonContainerStyle}>
                <button
                  onClick={() => {
                    updateColor("all", presetColors.dark);
                    updateBackgroundImage(customBackgrounds[0]);
                    setChangesMade(true);
                  }}
                  style={buttonStyle}
                >
                  <p>Dark</p>
                </button>
                <button
                  onClick={() => {
                    updateColor("all", presetColors.light);
                    updateBackgroundImage(customBackgrounds[1]);
                    setChangesMade(true);
                  }}
                  style={buttonStyle}
                >
                  <p>Light</p>
                </button>
                <button
                  onClick={() => {
                    updateColor("all", presetColors.scary);
                    updateBackgroundImage(customBackgrounds[2]);
                    setChangesMade(true);
                  }}
                  style={buttonStyle}
                >
                  <p>Scary</p>
                </button>
              </div>
              <br></br>
              <p
                style={{ ...headerTextStyle, fontSize: textSizes.header3 }}
                htmlFor="customColors"
              >
                Custom Themes
              </p>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Theme Name</label>
                <input
                  id="save-theme-name-input"
                  type="text"
                  style={textFieldStyle}
                  value={newThemeName}
                  onChange={(e) => {
                    setNewThemeName(e.target.value);
                    setThemeEditsMade(true);
                  }}
                ></input>
              </div>
              <div style={buttonContainerStyle}>
                <select
                  style={buttonStyle}
                  id="customColors"
                  value={selectedThemeIndex}
                  onChange={(e) => setSelectedThemeIndex(e.target.value)}
                >
                  <option key={-1} value={-1}></option>
                  {state.savedThemes.map((item, index) => (
                    <option key={index} value={index}>
                      {item[0]}
                    </option>
                  ))}
                </select>
              </div>
              <div style={buttonContainerStyle}>
                <button
                  onClick={() => {
                    updateTheme(selectedThemeIndex);
                    setChangesMade(true);
                  }}
                  style={buttonStyle}
                >
                  <p>
                    {"Update Theme" +
                      (themeEditsMade && selectedThemeIndex >= 0 ? "*" : "")}
                  </p>
                </button>
                <button
                  onClick={() => {
                    createTheme();
                    setChangesMade(true);
                  }}
                  style={buttonStyle}
                >
                  <p>Create Theme</p>
                </button>
                <button
                  onClick={() => {
                    deleteTheme(selectedThemeIndex);
                    setChangesMade(true);
                  }}
                  style={buttonStyle}
                >
                  <p>Delete Theme</p>
                </button>
              </div>
              <div style={customThemeContainerStyle}>
                <div style={{ width: "100px" }}>
                  <label style={profileText} htmlFor="backgroundColorPicker">
                    Background
                  </label>
                  <br></br>
                  <input
                    style={buttonStyle}
                    type="color"
                    id="backgroundColorPicker"
                    onChange={(e) => {
                      updateColor("background", e.target.value);
                    }}
                    value={state.colorBackground}
                  ></input>
                </div>
                <div style={{ width: "100px" }}>
                  <label style={profileText}>Text</label>
                  <br></br>
                  <input
                    style={buttonStyle}
                    type="color"
                    id="textColorPicker"
                    onChange={(e) => {
                      updateColor("text", e.target.value);
                    }}
                    value={state.colorText}
                  ></input>
                </div>
                <div style={{ width: "100px" }}>
                  <label style={profileText} htmlFor="borderColorPicker">
                    Border
                  </label>
                  <br></br>
                  <input
                    style={buttonStyle}
                    type="color"
                    id="borderColorPicker"
                    onChange={(e) => {
                      updateColor("border", e.target.value);
                    }}
                    value={state.colorBorder}
                  ></input>
                </div>
                <div style={{ width: "100px" }}>
                  <label style={profileText} htmlFor="accentColorPicker">
                    Accent
                  </label>
                  <br></br>
                  <input
                    style={buttonStyle}
                    type="color"
                    id="accentColorPicker"
                    onChange={(e) => {
                      updateColor("accent", e.target.value);
                    }}
                    value={state.colorAccent}
                  ></input>
                </div>
              </div>
              <div style={textFieldContainerStyle}>
                <label style={profileText}>Background Image (URL)</label>
                <input
                  id="custom-background"
                  type="text"
                  style={textFieldStyle}
                  value={state.backgroundImage}
                  onChange={(e) => {
                    updateBackgroundImage(e.target.value);
                  }}
                ></input>
                <br></br>
              </div>
            </div>
            <div style={sectionContainerStyle}>
                <button
                  onClick={handleLogout}
                  style={{
                    ...buttonStyle,
                    cursor: "pointer", // Add this to show it's clickable
                    width: "calc(100% - 300px)",
                    position: "absolute",
                    top: "120px",
                    right: "20px",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                    Logout
                </button>
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
