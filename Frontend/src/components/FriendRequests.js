import React, { useState, useEffect } from "react";
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
    document.title = "PULSE - Friends";
    fetchFriendRequestsData();
  }, []);
  

  const fetchFriendRequestsData = async () => {
    try {
      const requestResponse = await axios.get('/api/friends/get_requests', { withCredentials: true });
      setRequestsData(requestResponse.data);
    } catch (e) {
      console.log("Requests fetch failed: " + e);
      setRequestsData([]); // Set an empty array or handle the error accordingly
    }
  };

  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };

  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    padding: "20px 40px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.colorBorder,
    borderRadius: "10px",
    cursor: "pointer",
    margin: "5px",
    width: "100%",
    textAlign: "center",
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  };

  const friendRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10vw",
    marginBottom: "16px",
    alignItems: "center",
    textAlign: "center",
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
              <div className="center">
                <button style={{ ...buttonStyle, textDecoration: 'none' }} onClick={() => {friendRequestChoice(friend.spotify_id, false).then(data => setRequestsData(data))}}>
                  Deny
                </button>
                <button style={{ ...buttonStyle, textDecoration: 'none' }} onClick={() => {friendRequestChoice(friend.spotify_id, true).then(data => setRequestsData(data))}}>
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
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={buttonContainerStyle}>
          <Link to="/friends" style={{ ...buttonStyle, textDecoration: 'none' }}>Back</Link>
        </div>
        {requestsData ? (requestsData.length > 0 ? renderRequestRows() : noRequestsMessage) : noRequestsMessage}
      </div>
      <div className="footer"><Playback /></div>
    </div>
  );
};

export default FriendRequests;