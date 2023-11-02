import React, { useState, useEffect } from "react";
import Friend from './Friend';
import Navbar from "./NavBar";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";
import { useAppContext } from "./Context";
import axios from "axios";
import { Link } from "react-router-dom";

var initialFriendData;
try {
  var friendResponse = await axios.get("http://127.0.0.1:5000/friends/get_friends", {withCredentials: true});
  initialFriendData = friendResponse.data;
} catch (e) {
  console.log("Friends fetch failed: " + e);
  initialFriendData = [[]];
}

const Friends = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values
  
  const bodyStyle = {
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
    margin: 0,
    padding: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  useEffect(() => {
    document.title = "PULSE - Friends";
  }, []);

  const contentStyle = {
    flex: 1, // Ensure content takes available space
    padding: "16px",
    overflow: "auto",
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  };

  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    padding: "20px 40px", // Increase the padding for taller buttons
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.colorBorder,
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
  };

  const [friendsData, setFriendsData] = useState(initialFriendData); 

  async function removeFriend(spotify_id) {
    console.log("friend to be removed is sent to dane:" + spotify_id)
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "http://127.0.0.1:5000/friends/remove_friend",
      { spotify_id: spotify_id }
    );
    const data = response.data;
    console.log("Friend removed: " + spotify_id);
    return data;
  }

  const renderFriendRows = () => {
    const rows = [];
    for (let i = 0; i < friendsData.length; i += 5) {
      const friendsInRow = friendsData.slice(i, i + 5);
      rows.push(
        <div key={i} style={friendRowStyle}>
          {friendsInRow.map((friend, index) => (
            <div key={friend.name + index}>
              <Friend
                name={friend.name}
                photoFilename={friend.photoUri}
                favoriteSong={friend.favoriteSong}
              />
              <div class = "center">
                <button style={{ ...buttonStyle, textDecoration: 'none' }} onClick={() => {removeFriend(friend.spotify_id).then(data => setFriendsData(data))}}>
                  Remove Friend
                </button>
              </div>
            </div>
      ))}
        </div>
      );
    }
    return rows;
  };

  const noFriendsMessage = (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <p>You have no friends ;-; Click "add friends" to add friends</p>
    </div>
  );
  const removeFriendsMessage = (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <p>Click on a friend to remove them as a friend</p>
    </div>
  );

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={contentStyle}>
        <div style={buttonContainerStyle}>
          <Link to="/Friends/addFriends" style={{ ...buttonStyle, textDecoration: 'none' }}>Add Friends</Link>
          <Link to="/Friends/friendRequests" style={{ ...buttonStyle, textDecoration: 'none' }}>Friend Requests</Link>
        </div>
        {removeFriendsMessage}
        {friendsData ? (friendsData.length > 0 ? renderFriendRows() : noFriendsMessage) : noFriendsMessage}
      </div>
    </div>
  );
};





export default Friends;
