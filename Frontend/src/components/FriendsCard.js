import React, { useState, useEffect } from 'react';
import Friend from './Friend'; 
import { Link } from "react-router-dom";
import { useAppContext } from './Context';
import TextSize from "../theme/TextSize";
import axios from 'axios';

var friendData;
try {
  var friendResponse = await axios.get(
    "/api/friends/get_friends",
    { withCredentials: true }
  );
  friendData = friendResponse.data;
} catch (e) {
  console.log("Friends fetch failed: " + e);
  friendData = [[]];
}




const FriendsCard = ({}) => {
  const { state, dispatch } = useAppContext();
  const [friendData, setFriendData] = useState([]);

  const textSizes = TextSize(1); // Obtain text size values
  

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const friendResponse = await axios.get(
          "/api/friends/get_friends",
          { withCredentials: true }
        );
        setFriendData(friendResponse.data);
      } catch (e) {
        console.log("Friends fetch failed: " + e);
        setFriendData([]); // Set an empty array or handle the error accordingly
      }
    };

    fetchFriendsData();
  }, []); // Empty dependency array ensures that the effect runs only once on mount


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
      <Link to="/friends">
        <div style={header}>FRIENDS</div>
      </Link>

      <div className="friend-list">
        {friendData.map((friend, index) => (
          <div style={{ marginBottom: "20px" }} key={index}>
            <Friend
              name={friend.name}
              photoFilename={friend.photoUri}
              favoriteSong={friend.favoriteSong}
              status={friend.status}
              publicColorText={friend.textColor}
              publicColorBackground={friend.backgroundColor}
            />
          </div>
        ))}
        {friendData.length === 0 && (
          <img style={{ width: "100%", height: "100%" }} src={"https://i.imgflip.com/7bw89a.jpg"} alt="No friends" />
        )}
      </div>
    </div>
  );
};

export default FriendsCard;
