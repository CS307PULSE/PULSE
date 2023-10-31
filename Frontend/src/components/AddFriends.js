import React, { useState } from "react";
import Navbar from "./NavBar";
import Friend from './Friend'; 
import Colors from "../theme/Colors";
import { Link } from "react-router-dom";
import TextSize from "../theme/TextSize";
import styled from 'styled-components';
import axios from "axios";


var textSizeSetting, themeSetting;
try {
  var textSizeResponse = await axios.get(
    "http://127.0.0.1:5000/get_text_size",
    { withCredentials: true }
  );
  textSizeSetting = textSizeResponse.data;
  var themeResponse = await axios.get("http://127.0.0.1:5000/get_theme", {
    withCredentials: true,
  });
  themeSetting = themeResponse.data;
} catch (e) {
  console.log("Formatting settings fetch failed: " + e);
  textSizeSetting = 1;
  themeSetting = 0;
}
const themeColors = Colors(themeSetting); //Obtain color values
const textSizes = TextSize(textSizeSetting); //Obtain text size values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const contentStyle = {
  flex: 1, // Ensure content takes available space
  padding: "16px",
  overflow: "auto",
};

const friendRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", // Adjust column width as needed
  gap: "10vw", // Adjust the gap between friends
  marginBottom: "16px", // Add vertical space between rows
  alignItems: "center", // Align items vertically in the center
  textAlign: "center", // Center text horizontally
};

const friendContainerStyle = {
  position: "fixed",
  top: 100,
  right: 0,
  width: "20%",
  height: "900",
  backgroundColor: themeColors.background,
};

// Add margin to each Friend component for spacing
const FriendContainer = styled.div`
  margin-bottom: 20px; /* Adjust the margin as needed for spacing */
`;

const buttonStyle = {
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: "20px 40px", // Increase the padding for taller buttons
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: themeColors.text,
  borderRadius: "10px",
  cursor: "pointer",
  margin: "5px",
  width: "100%", // Adjust the width to take up the entire space available
  textAlign: "center", // Center the text horizontally
};

const searchContainerStyle = {
  display: "flex",
  marginLeft: "30px",
  // justifyContent: 'center',
  marginBottom: "20px",
};

const searchInputStyle = {
  padding: "8px",
  width: "75%",
  display: "flex-grow",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "16px",
};




async function sendAndFetchRelevantUsers(searchedUser) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/friends/add_friends_search",
    { query: searchedUser }
  );
  const data = response.data;
  console.log("Searched for user: " + response);
  return data
}


const AddFriends = () => {
  const [recievedRelevantUsers, setRecievedRelevantUsers] = useState();
  const [searchUserValue, setSearchUserValue] = useState();
  
  async function sendFriendRequest(spotify_id) {
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "http://127.0.0.1:5000/friends/friend_request",
      { request: spotify_id }
    );
    const data = response.data;
    console.log("Sent friend request to: " + spotify_id);
    return data;
  }

  function userSearch(recievedUsers) {
    console.log(recievedUsers);
    if (recievedUsers !== undefined) {
      return <div  style={friendRowStyle}>
        {recievedUsers.map((friend, index) => (
          <div key={friend.name + index}>
            <Friend
              name={friend.name}
              photoFilename={friend.photoUri}
              favoriteSong={friend.favoriteSong}
            />
            <div className = "center">
              <button style={{ ...buttonStyle, textDecoration: 'none' }}   onClick={() => sendFriendRequest(friend.spotify_id)}>
                Send Friend Request
              </button>
            </div>
          </div>
        ))}
        </div>
    } else {
      return 
    }
  }

  const getUserSearch = async () => {
    if (searchUserValue !== null && searchUserValue !== undefined) {
      console.log("searching for " + searchUserValue);
      sendAndFetchRelevantUsers(searchUserValue).then((data) => {
        if (data !== null && data !== undefined) {
          setRecievedRelevantUsers(data);
        } else {
          alert("User does not exist")
        }
      });
    } else {
      alert("Please enter a username in search bar before getting recommendations!");
    }
  };

  const changeSearchUserValue = (e) => {
    setSearchUserValue(e.target.value);
  };
  
  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style ={contentStyle}>
        <div style={buttonContainerStyle}>
            <Link to="/friends" style={{ ...buttonStyle, textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Search for users..."
            style={searchInputStyle}
            value={searchUserValue}
            onChange={changeSearchUserValue}
          />
          <button
            style={{ ...buttonStyle, textDecoration: "none" }}
            onClick={() => getUserSearch()}
          >
            Search
          </button>
          
        </div>
        {userSearch(recievedRelevantUsers)}
      </div>
    </div>
  );
};

export default AddFriends;