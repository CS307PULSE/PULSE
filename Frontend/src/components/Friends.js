import React from "react";
import Friend from './Friend';
import Navbar from "./NavBar";
import Colors from "../theme/Colors";
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
  padding: "8px 16px",
  backgroundColor: themeColors.primary, // Adjust to your theme
  color: themeColors.white,
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const friendRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", // Adjust column width as needed
  gap: "10vw", // Adjust the gap between friends
  marginBottom: "16px", // Add vertical space between rows
};

const Friends = () => {
  const friendData = [
    {
      name: 'John Doe',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Bohemian Rhapsody',
    },
    {
      name: 'Jane Smith',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    {
      name: 'Jane Smith',
      photoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png',
      favoriteSong: 'Hotel California',
    },
    // Add more friend data as needed
  ];

  const renderFriendRows = () => {
    const rows = [];
    for (let i = 0; i < friendData.length; i += 5) {
      const friendsInRow = friendData.slice(i, i + 5);
      rows.push(
        <div key={i} style={friendRowStyle}>
          {friendsInRow.map((friend, index) => (
            <Friend
              key={index}
              name={friend.name}
              photoFilename={friend.photoUri}
              favoriteSong={friend.favoriteSong}
            />
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={contentStyle}>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle}>Requests</button>
          <button style={buttonStyle}>Add Friends</button>
        </div>
        {renderFriendRows()}
      </div>
    </div>
  );
};

export default Friends;
