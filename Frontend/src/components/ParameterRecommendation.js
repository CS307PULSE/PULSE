import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import { useState } from "react";
import { hexToRGBA } from "../theme/Colors";

const ParameterRecommendations = () => {  
    const { state, dispatch } = useAppContext();
    const textSizes = TextSize(state.settingTextSize); //Obtain text size values
    
    const [parameters, setParameters] = useState([
        {value: 50, name: 'Energy', key: 'target_energy'},
        {value: 50, name: 'Popularity', key: 'target_popularity'},
        {value: 50, name: 'Acousticness', key: 'target_acousticness'},
        {value: 50, name: 'Danceability', key: 'target_danceability'},
        {value: 50, name: 'Duration (ms)', key: 'target_duration_ms'},
        {value: 50, name: 'Instrumentalness', key: 'target_instrumentalness'},
        {value: 50, name: 'Key', key: 'target_key'},
        {value: 50, name: 'Liveness', key: 'target_liveness'},
        {value: 50, name: 'Loudness', key: 'target_loudness'},
        {value: 50, name: 'Mode', key: 'target_mode'},
        {value: 50, name: 'Speechiness', key: 'target_speechiness'},
        {value: 50, name: 'Tempo', key: 'target_tempo'},
        {value: 50, name: 'Time Signature', key: 'target_time_signature'},
        {value: 50, name: 'Valence', key: 'target_valence'},
    ]);
    
    const bodyStyle = {
        backgroundColor: state.colorBackground,
        backgroundImage: "url('" + state.backgroundImage + "')",
        backgroundSize: "cover", //Adjust the image size to cover the element
        backgroundRepeat: "no-repeat", //Prevent image repetition
        backgroundAttachment: "fixed", //Keep the background fixed
    };
    const sliderContainerStyle = {
        backgroundColor: hexToRGBA(state.colorBackground, 0.5),
        width: "500px",
        position: "relative",
        left: "50%",
        transform: "translate(-50%, 0)",
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

    const updateParameter = (newValue, index) => {
        var updatedValues = [...parameters];
        updatedValues[index].value = newValue;
        setParameters(updatedValues);
    };
    const addElement = (element) => {
        setParameters([...parameters, element]);
    };

    return (
    <div class="wrapper">
        <div class="header"><Navbar /></div>
        <div class="content" style={bodyStyle}>
        
            <div style={sliderContainerStyle}>
                {parameters.map((item, index) => (
                    <div style={sliderRowStyle} key={index}>
                        <span style={{...sliderTextStyle, textAlign: "right", width: "150px"}}>{item.name}</span>
                        <input style={sliderStyle} type="range" id="mySlider" min="0" max="100" value={item.value} step="1" onChange={(e) => {updateParameter(e.target.value, index)}}></input>
                        <span style={{...sliderTextStyle, textAlign: "left", width: "100px"}}>Value: {item.value}</span>
                    </div>
                ))}
            </div>
        
        </div>
        <div class="footer"><SongPlayer /></div>
    </div>
    );
  };
  
  export default ParameterRecommendations;
  