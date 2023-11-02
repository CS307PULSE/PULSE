import React from 'react';
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from '../theme/Colors';

const Card = ({ headerText, children, width = "500px", height = "300px"}) => {  
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const cardContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    border: "1px solid " + state.colorBorder,
    overflow: "auto",
    width: width,
    height: height
  };
  const headerStyle = {
    backgroundColor: state.colorAccent, // Set background color to green
    color: state.colorText, // Set text color to white
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
    padding: "10px",
    fontSize: textSizes.header3,
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "normal",
    textTransform: "uppercase",
    position: "sticky",
    top: "0",
  };
  const contentStyle = {
    color: state.colorText,
    fontFamily: "Rhodium Libre",
    fontSize: textSizes.body,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "normal",
    textTransform: "uppercase",
    padding: "16px",
  };
  
  return (
    <div style={cardContainerStyle}>
      <div style={headerStyle}>{headerText}</div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

export default Card;
