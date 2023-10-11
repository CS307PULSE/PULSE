import React from 'react';
import styled from 'styled-components';

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize("medium"); //Obtain text size values
const themeColors = Colors("dark"); //Obtain color values

// Styled components
const CardContainer = styled.div`
  border: 1px solid ${themeColors.border};
  overflow: hidden;
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
