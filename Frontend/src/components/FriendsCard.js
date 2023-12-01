import React, { useState, useEffect } from 'react';
import Friend from './Friend'; 
import { Link } from "react-router-dom";
import { useAppContext } from './Context';
import TextSize from "../theme/TextSize";
import axios from 'axios';


const FriendsCard = ({}) => {
  const { state, dispatch } = useAppContext();
  const [friendsData, setFriendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const textSizes = TextSize(1); // Obtain text size values
  

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const friendsResponse = await axios.get(
          "/api/friends/get_friends",
          { withCredentials: true }
        );
        setFriendsData(friendsResponse.data);
      } catch (e) {
        console.log("Friends fetch failed: " + e);
        setFriendsData([]); // Set an empty array or handle the error accordingly
      }
    };

    fetchFriendsData();
    setLoading(false)
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

  const noFriendsMessage = (
    <img style={{ width: "100%", height: "100%" }} src={"https://i.imgflip.com/7bw89a.jpg"} alt="No friends" />
  );

const loadingTextStyle = {
    color: state.colorText,
    fontSize: textSizes.header2,
    fontStyle: "normal",
    fontFamily: "'Poppins', sans-serif",
    margin: "20px",
    fontStyle: "italic"
  };

  const loadingText =(  <div style={{textAlign: "center"}}>
  <p style={loadingTextStyle}>Loading...</p>
</div>);

  const renderFriends = () => {
    return friendsData.map((friend, index) => (
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
    ));
  };

  return (
    <div style={cardContainerStyle}>
      <Link to="/friends">
        <div style={header}>FRIENDS</div>
      </Link>

      <div className="friend-list">
        {loading ? loadingText : (friendsData && friendsData.length > 0 ? renderFriends() : noFriendsMessage)}
      </div>
    </div>
  );
};

export default FriendsCard;
