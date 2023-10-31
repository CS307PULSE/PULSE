import React, { useState } from "react";
import { Link } from "react-router-dom";
import Friend from './Friend';
import Navbar from "./NavBar";
import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";
import axios from "axios";

var textSizeSetting, themeSetting, initialRequestsData;
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
  var requestsResponse = await axios.get("http://127.0.0.1:5000/get_requests", {
    withCredentials: true,
  });
  initialRequestsData = requestsResponse.data;
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

const friendRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", // Adjust column width as needed
  gap: "10vw", // Adjust the gap between friends
  marginBottom: "16px", // Add vertical space between rows
  alignItems: "center", // Align items vertically in the center
  textAlign: "center", // Center text horizontally
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center", // Center buttons horizontally
  marginBottom: "16px",
};




const FriendRequests = () => {
  // should be useState(requestsData) when connecting to backend
  const [requestsData, setRequestsData] = useState(initialRequestsData)  
  
  async function friendRequestChoice(spotify_id, choice) {
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "http://127.0.0.1:5000/friends/friend_request_choice",
      { spotify_id: spotify_id,
        accepted: choice}
    );
    const data = response.data;
    console.log("Friend request accepted: " + choice + "___" + spotify_id);
    return data;
  }

  const renderRequestRows = () => {
    const rows = [];
    for (let i = 0; i < requestsData.length; i += 5) {
      const requestsInRow = requestsData.slice(i, i + 5);
      rows.push(
        <div key={i} style={friendRowStyle}>
          {requestsInRow.map((friend, index) => (
            <div key={friend.name + index}>
              <Friend
                name={friend.name}
                photoFilename={friend.photoUri}
                favoriteSong={friend.favoriteSong}
              />
              <div class = "center">
                <button style={{ ...buttonStyle, textDecoration: 'none' }} onClick={() => friendRequestChoice(friend.spotify_id, false).then(data => setRequestsData(data))}>
                  Deny
                </button>
                <button style={{ ...buttonStyle, textDecoration: 'none' }} onClick={() => friendRequestChoice(friend.spotify_id, true).then(data => setRequestsData(data))}>
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return rows;
  };

  const noRequestsMessage = (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <p>You have no pending friend requests</p>
    </div>
  );

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style ={contentStyle}>
        <div style={buttonContainerStyle}>
            <Link to="/friends" style={{ ...buttonStyle, textDecoration: 'none' }}>Back</Link>
        </div>
      {requestsData ? (requestsData.length > 0 ? renderRequestRows() : noRequestsMessage) : noRequestsMessage}
      </div>
    </div>
  );
};

export default FriendRequests;