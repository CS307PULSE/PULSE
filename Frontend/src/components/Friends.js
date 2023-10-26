import React from "react";
import Friend from './Friend';
import Navbar from "./NavBar";
import Colors from "../theme/Colors";
import { Link } from "react-router-dom";
import TextSize from "../theme/TextSize";
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


/*  UNCOMMENT FOR CONNECTING TO BACKEND
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
*/

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

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "16px",
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
};

const Friends = () => {
  //DELETE WHEN CONNECTING TO BACKEND
  const friendData = [
    {
      name: 'John Doe',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Bohemian Rhapsody',
    },
    {
      name: 'Jane Smith',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      spotify_id: 'test',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    // Add more friend data as needed
  ];
  
  async function removeFriend(spotify_id) {
    console.log("Friend removed: " + spotify_id)
    alert("Friend removed!");
    return
    /* const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "http://127.0.0.1:5000/friends/friend_removal",
      { removal: sentRemoval }
    );
    const data = response.data;
    console.log("Friend removed: " + sentRemoval);
    return data;
    */
  }

  const renderFriendRows = () => {
    const rows = [];
    for (let i = 0; i < friendData.length; i += 5) {
      const friendsInRow = friendData.slice(i, i + 5);
      rows.push(
        <div key={i} style={friendRowStyle}>
          {friendsInRow.map((friend, index) => (
            <span
              data-tooltip-id="my-tooltip"
              data-tooltip-content={
                friend.name
              }
              onClick={() => {removeFriend(friend.spotify_id);
                window.location.reload();}}
              style={{ cursor: "pointer" }}
              key={friend.name + index}
            >
            <Friend
              name={friend.name}
              photoFilename={friend.photoUri}
              favoriteSong={friend.favoriteSong}
            />
        </span>
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
        {friendData ? (friendData.length > 0 ? renderFriendRows() : noFriendsMessage) : noFriendsMessage}
      </div>
    </div>
  );
};





export default Friends;
