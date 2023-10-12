import React from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize(1); //Obtain text size values
const themeColors = Colors("dark"); //Obtain color values

// Styled components
const CardContainer = styled.div`
  border: 1px solid ${themeColors.white};
  overflow: hidden;
  width: 500px;
  height: 650px;
`;

const Header = styled.div`
  background-color: ${themeColors.green}; // Set background color to green
  color: black; // Set text color to green
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  padding:10px;
  text-transform: uppercase;
`;

const Content = styled.div`
color: ${themeColors.white};
font-family: Rhodium Libre;
font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: normal;
text-transform: uppercase;
  padding: 16px;
`;
const StyledLink = styled(Link)`
  text-decoration: none; /* Remove underline */
  color: inherit; /* Inherit text color */
`;

const FriendsCard = ({children }) => {
    return (
      <CardContainer>
        <StyledLink to="/friends">
        <Header>FRIENDS</Header>
      </StyledLink>
        <Content>{children}</Content>
      </CardContainer>
    );
  }
  
  export default FriendsCard;