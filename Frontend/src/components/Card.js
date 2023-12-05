import React from "react";
import { useAppContext } from "./Context";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";

const Card = ({ headerText, children, width = "500px", height = "320px" }) => {
  const { state } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const cardContainerStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    border: "1px solid " + state.colorBorder,
    overflow: "auto",
    width: width,
    height: height,
    margin: "20px"
  };
  const headerStyle = {
    backgroundColor: state.colorAccent, // Set background color to green
    color: state.colorText, // Set text color to white
    textAlign: "center",
    padding: "10px",
    fontSize: textSizes.header3,
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "normal",
    position: "sticky",
    top: "0",
  };
  const contentStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
    padding: "20px"
  };

  return (
    <div style={cardContainerStyle}>
      <div style={headerStyle}>{headerText}</div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

export default Card;
