import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import Navbar from "./NavBar";
import SongPlayer from "./SongPlayer";
import { useState } from "react";

const ParameterRecommendations = () => {  
    const { state, dispatch } = useAppContext();
    const textSizes = TextSize(state.settingTextSize); //Obtain text size values
    
    const [parameters, setParameters] = useState([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    
    const bodyStyle = {
        backgroundColor: state.colorBackground,
        backgroundImage: "url('" + state.backgroundImage + "')",
        backgroundSize: "cover", //Adjust the image size to cover the element
        backgroundRepeat: "no-repeat", //Prevent image repetition
        backgroundAttachment: "fixed", //Keep the background fixed
    };
    const sliderStyle = {
        width: '20%',
        color: state.colorText
    }
    const updateParameter = (newValue, index) => {
        var updatedValues = [...parameters];
        updatedValues[index] = newValue;
        setParameters(updatedValues);
    };
    const addElement = (element) => {
        setParameters([...parameters, element]);
    };

    return (
    <div class="wrapper">
        <div class="header"><Navbar /></div>
        <div class="content" style={bodyStyle}>
        
            <button onClick={() => addElement(0.5)}>Add Element</button>
            {parameters.map((value, index) => (
                <div key={index}> 
                    <input style={sliderStyle} type="range" id="mySlider" min="0" max="1" value={value} step="0.05" onChange={(e) => {updateParameter(e.target.value, index)}}></input>
                    <span>Value: {value}</span>
                </div>
            ))}
        
        </div>
        <div class="footer"><SongPlayer /></div>
    </div>
    );
  };
  
  export default ParameterRecommendations;
  