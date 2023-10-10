import React from 'react';
import styled from 'styled-components';

// Styled components
const CardContainer = styled.div`
  border: 1px solid #FFF;
  overflow: hidden;
  width: 500px;
  height: 650px;
`;

const Header = styled.div`
  background-color: #6EEB4D; // Set background color to green
  color: black; // Set text color to green
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  padding:10px;
  text-transform: uppercase;
`;

const Content = styled.div`
color: #FFF;
font-family: Rhodium Libre;
font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: normal;
text-transform: uppercase;
  padding: 16px;
`;

const FriendsCard = ({children }) => {
    return (
      <CardContainer>
        <Header>FRIENDS</Header>
        <Content>{children}</Content>
      </CardContainer>
    );
  }
  
  export default FriendsCard;