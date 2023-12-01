import React, { useState } from "react";
import { Link } from "react-router-dom";
import Friend from './Friend';
import Navbar from "./NavBar";
import Playback from "./Playback";
import TextSize from "../theme/TextSize";
import axios from "axios";
import { useAppContext } from "./Context";

const FriendRequests = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize);

  const [requestsData, setRequestsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/friends/get_requests", {
          withCredentials: true,
        });
        setRequestsData(response.data);
      } catch (error) {
        console.log("Friend requests fetch failed: " + error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run the effect only once during component mount

  const bodyStyle = {
    backgroundColor: state.colorBackground
  };
  
  const contentStyle = {
    flex: 1, // Ensure content takes available space
    padding: "16px",
    overflow: "auto",
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
    alignItems: "center", // Align items vertically in the center
    textAlign: "center", // Center text horizontally
  };
  
  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center", // Center buttons horizontally
    marginBottom: "16px",
  };

  async function friendRequestChoice(spotify_id, choice) {
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    const response = await axiosInstance.post(
      "/api/friends/friend_request_choice",
      { spotify_id: spotify_id,
        accepted: choice}
    );
    const data = response.data;
    console.log("Friend request accepted: " + choice + "___" + spotify_id);
    return data;
  }

  const renderRequestRows = () => {
    const rows = [];
    console.log(requestsData);
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
                status={friend.status}
                publicColorText={friend.textColor}
                publicColorBackground={friend.backgroundColor}
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

  async function friendRequestChoice(spotify_id, choice) {
    const axiosInstance = axios.create({
      withCredentials: true,
    });
    try {
      const response = await axiosInstance.post(
        "/api/friends/friend_request_choice",
        { spotify_id: spotify_id, accepted: choice }
      );
      setRequestsData(response.data);
      console.log("Friend request accepted: " + choice + "___" + spotify_id);
    } catch (error) {
      console.log("Friend request choice failed: " + error);
    }
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={buttonContainerStyle}>
          <Link to="/friends" style={{ ...buttonStyle, textDecoration: 'none' }}>Back</Link>
        </div>
        {requestsData.length > 0 ? renderRequestRows() : noRequestsMessage}
      </div>
      <div className="footer"><Playback /></div>
    </div>
  );
};

export default FriendRequests;