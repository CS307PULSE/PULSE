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

const textSizes = TextSize(1); //Obtain text size values
const friendsList = friendData;

const NoFriends = () => {
  if (friendData.length == 0) {
    return (
      <img style={{width: "100%", height: "100%"}} src={"https://i.imgflip.com/7bw89a.jpg"}></img>
    )
  }
}

const FriendsCard = ({}) => {
  const { state, dispatch } = useAppContext();

  const cardContainerStyle = {
    border: "1px solid " + state.colorBorder,
    overflowY: "auto",
    maxWidth: "500px",
    width: "100%",
    height: "100%",
    margin: "0 auto"
  };
  
  const header = {
    backgroundColor: state.colorAccent,
    top: 0,
    position: "sticky",
    color: state.colorText,
    fontFamily: "Poppins, sans-serif",
    fontSize: textSizes.header3,
    fontStyle: "normal",
    fontWeight: 700,
    padding: "10px",
    textTransform: "uppercase"
  };
  
  const content = {
    color: state.colorText,
    fontFamily: "Rhodium Libre",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textTransform: "uppercase",
    padding: "16px"
  };
  
  const styledLink = {
    position: "sticky",
    textDecoration: "none",
    color: "inherit"
  };
  return (
    <div style={cardContainerStyle}>
      <Link style={styledLink} to="/friends">
        <div style={header}>FRIENDS</div>
      </Link>
      
      <div className="friend-list">
        {friendData.map((friend, index) => (
          <div style={{marginBottom: "20px"}} key={index}>
            <Friend
              name={friend.name}
              photoFilename={friend.photoUri}
              favoriteSong={friend.favoriteSong}
            />
          </div>
        ))}
        {NoFriends()}
      </div>
    </div>
  );
}

export default FriendsCard;
