import React from 'react';
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";

export function getImage(item, type) {
  if (!item) { //Return null if index is invalid
    return null;
  }
  var image = null;
  switch (type) {
    case "playlist": image = item.images[0]; break;
    case "track" : image = item.album.images[0]; break;
    case "album": image = item.images[0]; break;
    case "artist": image = item.images[0]; break;
    case "episode": image = item.images[0]; break;
    case "show": image = item.images[0]; break;
  }
  if (image) {
    return image.url;
  } else {
    return "https://iaaglobal.s3.amazonaws.com/bulk_images/no-image.png";
  }
}

//Buttons is an array of {text, width, onClick function}
const ItemList = ({ data, buttons, selectedIndex = -1, onClick = (index) => {} }) => {  
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

  function renderButtons(item) {
    if (!buttons) {
      return "";
    }
    return buttons.map((button, index) => (
      <div key={index}>
        <button style={{...buttonStyle, width: button.width, fontSize: button.size}} 
          onClick={(e) => {button.onClick(item); e.stopPropagation();}}>{button.value}</button>
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
          switch (item.type) {
            case "playlist":
              return (
                <div key={index} style={{...itemDisplayStyle, 
                  border: (index == selectedIndex ?  "5px" : "1px") + " solid " + (index == selectedIndex ? state.colorAccent : state.colorBorder)}} 
                  onClick={() => {onClick(index)}}>
                  {renderButtons(item)}
                  <img style={imageStyle} src={getImage(data[index], item.type)}></img>
                  <div>
                    <p style={textStyle}>{item.name}</p>
                  </div>
                </div>
              );
            case "track":
              return (
                <div key={index} style={{...itemDisplayStyle, 
                  border: (index == selectedIndex ?  "5px" : "1px") + " solid " + (index == selectedIndex ? state.colorAccent : state.colorBorder)}} 
                  onClick={() => {onClick(index)}}>
                  {renderButtons(item)}
                  <img style={imageStyle} src={getImage(data[index], item.type)}></img>
                  <div>
                    <p style={textStyle}>{item.name}</p>
                    <p style={textStyle}>{item.artists.map(artist => artist.name).join(', ')}</p>
                  </div>
                </div>
              );
            case "album":
              return (
                <div key={index} style={{...itemDisplayStyle, 
                  border: (index == selectedIndex ?  "5px" : "1px") + " solid " + (index == selectedIndex ? state.colorAccent : state.colorBorder)}} 
                  onClick={() => {onClick(index)}}>
                  {renderButtons(item)}
                  <img style={imageStyle} src={getImage(data[index], item.type)}></img>
                  <div>
                    <p style={textStyle}>{item.name}</p>
                    <p style={textStyle}>{item.artists.map(artist => artist.name).join(', ')}</p>
                  </div>
                </div>
              );
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
