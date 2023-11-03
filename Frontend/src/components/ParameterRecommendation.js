import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import { useState } from "react";
import { hexToRGBA } from "../theme/Colors";
import { parameterInfo, presetEmotions } from "../theme/Emotions";

const ParameterRecommendations = () => {  
    const { state, dispatch } = useAppContext();
    const textSizes = TextSize(state.settingTextSize); //Obtain text size values
    
    const [parameters, setParameters] = useState([0,0,0,0,0,0,0,0,0,0,0,0]);
    const [emotions, setEmotions] = useState([...presetEmotions]);
    const [selectedEmotionIndex, setSelectedEmotionIndex] = useState(-1);
    const [newEmotionName, setNewEmotionName] = useState("New Emotion");

    function updateParameter(newValue, index) {
        if(selectedEmotionIndex >= 0) {
            setSelectedEmotionIndex(-1);
            setNewEmotionName(newEmotionName + " (edited)");
        }
        var updatedValues = [...parameters];
        updatedValues[index] = newValue;
        setParameters(updatedValues);
    };
    function retrieveEmotion(index) {
        setSelectedEmotionIndex(index);
        setNewEmotionName("New Emotion");
        try {
            if (index >= 0) {
                setNewEmotionName(emotions[index].name);
                setParameters(emotions[index].parameters);
            }
        } catch (e) {
            console.error("Error retrieving emotion: " + e);
        }
    }
    function createEmotion(name, parameters) {
        var newEmotion = {name: name, parameters: parameters};
        var tempEmotions = emotions;
        tempEmotions.push(newEmotion);
        setEmotions(tempEmotions);
        setSelectedEmotionIndex(emotions.length - 1);
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
    
    const bodyStyle = {
        backgroundColor: state.colorBackground,
        backgroundImage: "url('" + state.backgroundImage + "')",
        backgroundSize: "cover", //Adjust the image size to cover the element
        backgroundRepeat: "no-repeat", //Prevent image repetition
        backgroundAttachment: "fixed", //Keep the background fixed
    };
    const textStyle = {
        color: state.colorText,
        fontSize: textSizes.body
    };
    const sliderContainerStyle = {
        backgroundColor: hexToRGBA(state.colorBackground, 0.5),
        width: "500px",
        position: "relative",
        left: "10%",
        padding: "20px"
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

    return (
    <div className="wrapper">
        <div className="header"><Navbar /></div>
        <div className="content" style={bodyStyle}>
            <div style={sliderContainerStyle}>
                <div style={textFieldContainerStyle}>
                    <label style={textStyle}>Emotion Name</label>
                    <input id="emotion-name" type="text" style={textFieldStyle} value={newEmotionName} onChange={e => {setNewEmotionName(e.target.value)}}></input>
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
                    <button onClick={() => {createEmotion(newEmotionName, parameters)}} style={buttonStyle}><p>Create</p></button>
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
        <div className="footer"><SongPlayer /></div>
    </div>
    );
  };
  
  export default ParameterRecommendations;
  