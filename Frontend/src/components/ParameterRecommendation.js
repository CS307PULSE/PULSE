import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import Navbar from "./NavBar";
import Playback from "./Playback";
import { useState, useEffect } from "react";
import { hexToRGBA } from "../theme/Colors";
import { parameterInfo, presetEmotions } from "../theme/Emotions";
import axios from "axios";
import { genreList, parseParameters } from "../theme/Emotions";
import ItemList from "./ItemList";
import { getPlaylists } from "./PlaylistManager";

const ParameterRecommendations = () => {  
    const { state, dispatch } = useAppContext();
    const textSizes = TextSize(state.settingTextSize); //Obtain text size values

    const [parameters, setParameters] = useState([0.5,0.5,0.5,0.5,5,0.5,0.5,-7,1,0.5,120,0.5]);
    const [emotions, setEmotions] = useState([]);
    const [selectedEmotionIndex, setSelectedEmotionIndex] = useState(-1);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);
    const [emotionName, setEmotionName] = useState("New Emotion");
    const [derivedEmotionName, setDerivedEmotionName] = useState("New Derived Emotion");
    const [genreSelection, setGenreSelection] = useState(genreList[0]);
    const [songRecommendations, setSongRecommendations] = useState([]);

    function updateParameter(newValue, index) {
        var updatedValues = [...parameters];
        updatedValues[index] = newValue;
        setParameters(updatedValues);
        if(selectedEmotionIndex >= 0) {
            if (selectedEmotionIndex < presetEmotions.length) {
                setSelectedEmotionIndex(-1);
                setEmotionName(emotionName + " (edited)");
            } else {
                const tempEmotions = emotions;
                tempEmotions[selectedEmotionIndex].parameters = updatedValues;
                setEmotions(tempEmotions);
            }
        }
    };
    useEffect(() => {
        if (selectedEmotionIndex >= 3) {
            const tempEmotions = emotions;
            tempEmotions[selectedEmotionIndex].name = emotionName;
            setEmotions(tempEmotions);
        }
    }, [emotionName])
    function retrieveEmotion(index) {
        setSelectedEmotionIndex(index);
        setEmotionName("New Emotion");
        try {
            if (index >= 0) {
                setEmotionName(emotions[index].name);
                setParameters(emotions[index].parameters);
            }
        } catch (e) {
            console.error("Error retrieving emotion: " + e);
        }
    }
    async function createEmotion(newName, newParameters) {
        var newEmotion = {name: newName, parameters: newParameters};
        var tempEmotions = emotions;
        tempEmotions.push(newEmotion);
        setEmotions(tempEmotions);
        setSelectedEmotionIndex(emotions.length - 1);
        setEmotionName(newName);
        setParameters(await newParameters);
        saveEmotions(emotions.slice(presetEmotions.length));
    }
    function deleteEmotion(index) {
        try {
            if (index >= presetEmotions.length) {
                setSelectedEmotionIndex(-1);
                var tempEmotions = emotions;
                tempEmotions.splice(index, 1);
                setEmotions(tempEmotions);
            }
        } catch (e) {
            console.error("Error deleting  emotion: " + e);
        }
    }
    function getSongImage(track) {
        const image = track.album.images[0];
        if (image) {
          return image.url;
        } else {
          return "https://iaaglobal.s3.amazonaws.com/bulk_images/no-image.png";
        }
    }
    useEffect(() => {
        (async () => {
            setPlaylists("loading");
            const parsedPlaylists = await getPlaylists();
            setPlaylists(parsedPlaylists);
        })();
    }, []);
    async function getEmotions() {
        try {
            const response = await axios.get("/api/emotion/pull_emotions", {withCredentials: true});
            const data = response.data;
            const newEmotions = data.map(item => ({name: item.name, parameters: parseParameters(item.parameters)})); 
            setEmotions([...presetEmotions, ...newEmotions]);
        } catch (e) {
            console.log(e);
            setEmotions(presetEmotions);
        }
    }
    async function saveEmotions(data) {
        const emotions = (await data).map(item => ({
            name: item.name, 
            parameters: ({
                target_energy: item.parameters[0],
                target_popularity: item.parameters[1],
                target_acousticness: item.parameters[2],
                target_danceability: item.parameters[3],
                target_duration_ms: item.parameters[4],
                target_instrumentalness: item.parameters[5],
                target_liveness: item.parameters[6],
                target_loudness: item.parameters[7],
                target_mode: item.parameters[8],
                target_speechiness: item.parameters[9],
                target_tempo: item.parameters[10],
                target_valence: item.parameters[11]
            })
        }));
        const axiosInstance = axios.create({withCredentials: true});
        const response = await axiosInstance.post("/api/emotion/save_emotions", {emotions: emotions});
        return response.data;
    }
    useEffect(() => {
        getEmotions();
    }, []);
    async function derivePlaylistEmotion(playlistID) {
        const axiosInstance = axios.create({withCredentials: true});
        const response = await axiosInstance.post("/api/recommendations/get_playlist_dict", {playlist: playlistID});
        const data = response.data;
        const newParameters = parseParameters(data);
        return newParameters;
    }
    async function handleDeriveEmotion() {
        if (!playlists) { return; }
        try {
            createEmotion(derivedEmotionName, await derivePlaylistEmotion(playlists[selectedPlaylistIndex].id))
        } catch (e) { console.log(e); }
    }
    async function getEmotionRecommendations(name, parameters, genre) {
        const axiosInstance = axios.create({withCredentials: true});
        const response = await axiosInstance.post("/api/recommendations/get_songs_from_dict", {parameters: [name, ...parameters], genre: genre});
        setSongRecommendations(response.data);
    }
    
    const bodyStyle = {
        backgroundColor: state.colorBackground,
        backgroundImage: "url('" + state.backgroundImage + "')",
        backgroundSize: "cover", //Adjust the image size to cover the element
        backgroundRepeat: "no-repeat", //Prevent image repetition
        backgroundAttachment: "fixed", //Keep the background fixed
    };
    const textStyle = {
        color: state.colorText,
        fontSize: textSizes.body,
        fontStyle: "normal",
        fontFamily: "'Poppins', sans-serif",
        margin: "5px"
    };
    const headerTextStyle = {
        color: state.colorText,
        fontFamily: "'Poppins', sans-serif",
        fontSize: textSizes.header3,
        fontStyle: "normal",
        fontWeight: 600,
        lineHeight: "normal"
    };
    const sectionContainerStyle = {
        backgroundColor: hexToRGBA(state.colorBackground, 0.5),
        width: "600px",
        padding: "20px",
        margin: "20px",
        position: "relative",
        overflow: "auto"
    }
    const selectionDisplayStyle = {
      backgroundColor: state.colorBackground,
      width: "100% - 20px",
      margin: "10px",
      display: "flex",
      alignItems: "center",
      overflow: "auto",
      border: "1px solid " + state.colorBorder,
      borderRadius: "5px"
    }
    const imageStyle = {
      width: "40px",
      height: "40px",
      margin: "10px"
    }
    const sliderStyle = {
        width: "300px",
        height: "10px",
        appearance: "none",
        background: state.colorBackground,
        outline: "none", 
        border: "none",
        borderRadius: "0px"
    }
    const sliderTextStyle = {
        display: "inline-block",
        margin: "10px",
        color: state.colorText
    }
    const sliderRowStyle = {
        height: "30px",
        display: "flex",
        alignItems: "center",
    }
    const buttonContainerStyle = {
        display: 'flex',
        alignItems: 'center', // Center buttons horizontally
        marginTop: '5px', // Space between cards and buttons
        width: "600px"
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
    

    return (
    <div className="wrapper">
        <div className="header"><Navbar /></div>
        <div className="content" style={bodyStyle}>
            <div style={{display: "flex"}}>
            <div>
                <div style={sectionContainerStyle}>
                    <p style={headerTextStyle}>Manage Emotions</p>
                    <div style={buttonContainerStyle}>
                        <label style={textStyle}>Emotion Name</label>
                        <input id="emotion-name" type="text" style={buttonStyle} value={emotionName} onChange={e => {setEmotionName(e.target.value)}}></input>
                    </div>
                    <div style={{...buttonContainerStyle, width: "100%"}}>
                        <select style={buttonStyle} id="selectEmotion" value={selectedEmotionIndex} onChange={(e) => {retrieveEmotion(e.target.value)}}>
                            <option key={-1} value={-1}>Custom Emotion</option>
                            {emotions.map((item, index) => (
                                <option key={index} value={index}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => {createEmotion("New Emotion", parameters)}} style={buttonStyle}><p>Create</p></button>
                        <button onClick={() => {deleteEmotion(selectedEmotionIndex)}} style={buttonStyle}><p>Delete</p></button>
                    </div>
                    {parameterInfo.map((item, index) => (
                        <div style={sliderRowStyle} key={index}>
                            <span style={{...sliderTextStyle, textAlign: "right", width: "150px"}}>{item.name}</span>
                            <input style={sliderStyle} type="range" id="mySlider" min={item.min} max={item.max} step={item.step} 
                                value={parameters[index]} onChange={(e) => {updateParameter(e.target.value, index)}}></input>
                            <span style={{...sliderTextStyle, textAlign: "left", width: "100px"}}>Value: {parameters[index]}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div style={{...sectionContainerStyle, height: "400px"}}>
                    <p style={headerTextStyle}>Emotion Recommendations</p>
                    <div style={buttonContainerStyle}>
                        <label style={textStyle}>Genre </label>
                        <select style={buttonStyle} value={genreSelection} onChange={(e) => setGenreSelection(e.target.value)}>
                        {genreList.map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                        </select>
                    </div>
                    <div style={buttonContainerStyle}>
                        <button style={buttonStyle} onClick={() => {
                            getEmotionRecommendations(emotionName, parameters, genreSelection)
                        }}>Get [{emotionName}] Recommendations from [{genreSelection}]</button>
                    </div>
                    {songRecommendations.length > 0 && songRecommendations.map((item, index) => (
                        <div key={index} style={selectionDisplayStyle}>
                            <img style={imageStyle} src={getSongImage(item)}></img>
                            <div>
                                <p style={textStyle}>{item.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{...sectionContainerStyle, height: "400px"}}>
                    <p style={headerTextStyle}>Derive Emotions</p>
                    <div style={buttonContainerStyle}>
                        <input type="text" style={buttonStyle} value={derivedEmotionName} onChange={e => {setDerivedEmotionName(e.target.value)}}></input>
                        <button style={{...buttonStyle, width: "200px"}} 
                            onClick={() => {handleDeriveEmotion()}}>Derive Emotion</button>
                    </div>
                    <ItemList 
                        type="playlists" data={playlists} 
                        selectedIndex={selectedPlaylistIndex} onClick={setSelectedPlaylistIndex}
                        buttons={[]}
                    />
                </div>
            </div>
            </div>
        </div>
        <div className="footer"><Playback /></div>
    </div>
    );
  };
  
  export default ParameterRecommendations;
  