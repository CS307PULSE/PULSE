import React from 'react';
import Friend from './Friend'; 
import styled from 'styled-components';
import { Link } from "react-router-dom";
import { useAppContext } from './Context';
import TextSize from "../theme/TextSize";
import axios from 'axios';
import Colors from '../theme/Colors';

var friendData;

try {
  var friendResponse = await axios.get(
    "http://127.0.0.1:5000/friends/get_friends",
    { withCredentials: true }
  );
  friendData = friendResponse.data;
} catch (e) {
  console.log("Friends fetch failed: " + e);
  friendData = [[]];
}

const themeColors = Colors(0); //Obtain color values
const textSizes = TextSize(1); //Obtain text size values
const friendsList = friendData;

// Styled components
const CardContainer = styled.div`
  border: 1px solid ${themeColors.white};
  overflow-y: auto;
  max-width: 500px; /* Set a maximum width to limit the container size */
  width: 100%; /* Ensure the container takes available width */
  height: 650px;
  margin: 0 auto; /* Horizontally center the container */
`;

// Add margin to each Friend component for spacing
const FriendContainer = styled.div`
  margin-bottom: 20px; /* Adjust the margin as needed for spacing */
`;

const Header = styled.div`
  background-color: ${themeColors.green}; // Set background color to green
  top: 0;
  position: sticky;
  color: black; // Set text color to green
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  padding: 10px;
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
  position: sticky;
  text-decoration: none; /* Remove underline */
  color: inherit; /* Inherit text color */
`;


const FriendsCard = ({}) => {
    return (
      <CardContainer>
        <StyledLink to="/friends">
          <Header>FRIENDS</Header>
        </StyledLink>
        
        <div className="friend-list">
          {friendData.map((friend, index) => (
            <FriendContainer key={index}>
              <Friend
                name={friend.name}
                photoFilename={friend.photoUri}
                favoriteSong={friend.favoriteSong}
              />
            </FriendContainer>
          ))}
        </div>
      
      </CardContainer>
    );
  }
  
  export default FriendsCard;
