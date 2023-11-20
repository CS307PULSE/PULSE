import React from 'react';
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from '../theme/Colors';

//Buttons is an array of {text, width, onClick function}
const ItemList = ({ type, data, selectedIndex, setSelectedIndex, buttons }) => {  
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
    borderRadius: "5px"
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

  function getImage(index) {
    var image = null;
    switch(type) {
      case "songs" : image = data[index].track.album.images[0];
      case "albums": image = 0;
      case "artists": image = 0;
      case "playlists": image = data[index].images[0];
    }
    if (image) {
      return image.url;
    } else {
      return "https://iaaglobal.s3.amazonaws.com/bulk_images/no-image.png";
    }
  }

  return (
    <div>
      {/* <p style={headerTextStyle}>Playlists</p> */}
      {data && data.map((item, index) => (
        (() => { 
          switch (type) {
            case "playlists":
              return (
                <div key={index} style={{...itemDisplayStyle, 
                  border: (index == selectedIndex ?  "5px" : "1px") + " solid " + (index == selectedIndex ? state.colorAccent : state.colorBorder)}} 
                  onClick={() => {setSelectedIndex(index)}}>
                  {() => {for (var i = 0; i < buttons.length; i++) {
                    return (
                      <div>
                        <button style={{...buttonStyle, width: buttons[i].width}} onClick={buttons[i].onClick(item)}>{buttons[i].text}</button>
                      </div>
                    );
                  }}}
                  <img style={imageStyle} src={getImage(index)}></img>
                  <div>
                    <p style={textStyle}>{item.name}</p>
                  </div>
                </div>
              );
            case "songs":
            case "albums":
            case "artists":
          }
        })()
      ))}
    </div>
  );
};

export default ItemList;
