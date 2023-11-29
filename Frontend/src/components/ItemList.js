import React from 'react';
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from '../theme/Colors';

//Buttons is an array of {text, width, onClick function}
const ItemList = ({ type, data, buttons, selectedIndex = -1, onClick = (index) => {} }) => {  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values
  
  const itemDisplayStyle = {
    backgroundColor: state.colorBackground,
    width: "100% - 20px",
    margin: "10px",
    display: "flex",
    alignItems: "center",
    overflow: "auto",
    border: "1px solid " + state.colorBorder,
    borderRadius: "10px"
  }
  const textStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif",
    margin: "5px"
  };
  const imageStyle = {
    width: "40px",
    height: "40px",
    margin: "10px"
  }
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
  const loadingTextStyle = {
    color: state.colorText,
    fontSize: textSizes.header2,
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif",
    margin: "20px",
    fontStyle: "italic"
  };

  function getImage(index) {
    if (!data[index]) { //Return null if index is invalid
      return null;
    }
    var image = null;
    switch (type) {
      case "song" : image = data[index].album.images[0]; break;
      // case "albums": image = 0; break;
      // case "artists": image = 0; break;
      case "playlist": image = data[index].images[0]; break;
    }
    if (image) {
      return image.url;
    } else {
      return "https://iaaglobal.s3.amazonaws.com/bulk_images/no-image.png";
    }
  }
  function renderButtons(item) {
    if (!buttons) {
      return "";
    }
    return buttons.map((button, index) => (
      <div key={index}>
        <button style={{...buttonStyle, width: button.width, fontSize: button.size}} 
          onClick={() => {button.onClick(item)}}>{button.value}</button>
        {/* {type == "image" ? <img style={{width: button.width}} onClick={() => {button.onClick(item)}} src={button.value}></img> : ""} */}
      </div>
    ));
  }
  if (data == "loading") {
    return (
      <div style={{textAlign: "center"}}>
        <p style={loadingTextStyle}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {data && data.map((item, index) => (
        (() => {
          if (!item) {
            return ("");
          } 
          switch (type) {
            case "playlist":
              return (
                <div key={index} style={{...itemDisplayStyle, 
                  border: (index == selectedIndex ?  "5px" : "1px") + " solid " + (index == selectedIndex ? state.colorAccent : state.colorBorder)}} 
                  onClick={() => {onClick(index)}}>
                  {renderButtons(item)}
                  <img style={imageStyle} src={getImage(index)}></img>
                  <div>
                    <p style={textStyle}>{item.name}</p>
                  </div>
                </div>
              );
            case "song":
              return (
                <div key={index} style={{...itemDisplayStyle, 
                  border: (index == selectedIndex ?  "5px" : "1px") + " solid " + (index == selectedIndex ? state.colorAccent : state.colorBorder)}} 
                  onClick={() => {onClick(index)}}>
                  {renderButtons(item)}
                  <img style={imageStyle} src={getImage(index)}></img>
                  <div>
                    <p style={textStyle}>{item.name}</p>
                    <p style={textStyle}>{item.artists[0].name}</p>
                  </div>
                </div>
              );
            case "album":
              
            case "artist":

            case "episode":

            case "show":
          }
        })()
      ))}
    </div>
  );
};

export default ItemList;
