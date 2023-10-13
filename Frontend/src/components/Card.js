import React from 'react';
import styled from 'styled-components';

import { pulseColors } from "../theme/Colors";
import axios from "axios";

import Colors from "../theme/Colors"; 
import TextSize from "../theme/TextSize";

var textSizeSetting, themeSetting;
try {
    var textSizeResponse = await axios.get("http://127.0.0.1:5000/get_text_size", {withCredentials: true});
    textSizeSetting = textSizeResponse.data;
    console.log("Profile Text Size Setting: " + textSizeSetting);

    var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {withCredentials: true});
    themeSetting = themeResponse.data;
    console.log("Profile Theme Setting: " + textSizeSetting);
} catch (e) {
    console.log("Formatting settings fetch failed: " + e);
    textSizeSetting = 1;
    themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

// Styled components
const CardContainer = styled.div`
  border: 1px solid ${themeColors.border};
  overflow: auto;
`;

const Header = styled.div`
  background-color: ${themeColors.green}; // Set background color to green
  color: ${themeColors.black}; // Set text color to black
  text-align: center;
  font-family: 'Poppins', sans-serif;
  padding: 10px;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  position: sticky;
  top: 0;
`;

const Content = styled.div `
  color: ${themeColors.white};
  font-family: Rhodium Libre;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-transform: uppercase;
  padding: 16px;
`;


const Card = ({ headerText, children, width = "500px", height = "300px"}) => {
  return (
    <CardContainer style={{width:width, height:height}}>
      <Header>{headerText}</Header>
      <Content>{children}</Content>
    </CardContainer>
  );
}

export default Card;
