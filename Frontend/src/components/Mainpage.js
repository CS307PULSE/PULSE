import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Card from "./Card";
import FriendsCard from "./FriendsCard";
import SongPlayer from "./SongPlayer";
import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors";
import axios from "axios";

const textSizes = TextSize(1); //Obtain text size values
const themeColors = Colors(0); //Obtain color values

const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  overflow: "auto",
};

const cardContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-around",
  width: "75%", // Set width to 75% of the container
};

const cardStyle = {
  marginBottom: "20px", // Add some bottom margin for spacing
  padding: "20px",
  textAlign: "center",
  fontFamily: "'Poppins', sans-serif",
};

const cardContent = {
  color: themeColors.text,
  fontSize: textSizes.body,
  fontFamily: "'Poppins', sans-serif",
};

const buttonContainerStyle = {
  display: "flex",
  flexDirection: "column", // Stack buttons in a column
  alignItems: "center", // Center buttons horizontally
  marginTop: "10px", // Space between cards and buttons
};

const buttonStyle = {
  backgroundColor: themeColors.background,
  color: themeColors.text,
  padding: "8px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: themeColors.text,
  borderRadius: "10px",
  cursor: "pointer",
  margin: "5px", // Small space between buttons
  width: "90%",
};

const friendContainerStyle = {
  position: "fixed", // Fixed position so it stays on the right
  top: 100,
  right: 0,
  width: "20%", // Take up 20% of the viewport width
  height: "900", // Take up the full height
  backgroundColor: themeColors.backgorund, // Add background color for the friend component
};

const searchContainerStyle = {
  display: "flex",
  marginLeft: "230px",
  // justifyContent: 'center',
  marginBottom: "20px",
};

const searchInputStyle = {
  padding: "8px",
  width: "50%",
};

function Mainpage() {
  function StatsCardComp() {
    //Data to display on stats card
    const [topArtists, setTopArtists] = useState();
    const [topSongs, setTopSongs] = useState();
    const [followers, setFollowers] = useState();
    const [statsDone, setStatsDone] = useState(false);
    useEffect(() => {
      const fetchData = async () => {
        const response = await axios.get(
          "http://127.0.0.1:5000/statistics/shortened",
          {
            withCredentials: true,
          }
        );
        console.log("response to stats card");
        console.log(response);
        const data = response.data;
        try {
          setTopArtists(JSON.parse(data.top_artists));
        } catch (e) {
          console.log(e);
          console.log("Top Artist empty");
        }

        try {
          setTopSongs(JSON.parse(data.top_songs));
        } catch (e) {
          console.log("Top Song empty");
        }
        if (data.follower_data === "") {
          console.log("Followers empty");
        } else {
          const dateObjects = Object.keys(data.follower_data);
          const lastObj =
            data.follower_data[dateObjects[dateObjects.length - 1]];
          console.log(dateObjects[dateObjects.length - 1]);
          setFollowers(lastObj);
        }
        setStatsDone(true);
      };

      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!statsDone) {
      return <p>Loading</p>;
    }
    return (
      <>
        <p style={cardContent}>
          Favorite artist of all time: {topArtists[0][0].name}
        </p>
        <p style={cardContent}>
          Favorite artist recently: {topArtists[2][0].name}
        </p>
        <p style={cardContent}>
          Favorite song of all time: {topSongs[0][0].name}
        </p>
        <p style={cardContent}>Favorite song recently: {topSongs[2][0].name}</p>
        <p style={cardContent}>You have {followers} followers</p>
      </>
    );
  }

  return (
    <div style={bodyStyle}>
      <Navbar />
      <div style={{ padding: "5px" }} />
      <div style={searchContainerStyle}>
        <input type="text" placeholder="Search..." style={searchInputStyle} />
      </div>
      <div style={cardContainerStyle}>
        <Card headerText="STATISTICS" style={cardStyle}>
          {StatsCardComp()}
        </Card>
        <Card headerText="DJ MIXER" style={cardStyle}>
          <p style={cardContent}>This is the content of Card 2.</p>
        </Card>
      </div>
      <div style={{ padding: "20px" }} />
      <div style={cardContainerStyle}>
        <Card headerText="GAMES" style={cardStyle}>
          <p style={cardContent}>
            <div style={buttonContainerStyle}>
              {/* Use Link instead of button, and provide the to prop with the dynamic URL */}
              <Link
                to="/game/guess-the-song"
                style={{
                  ...buttonStyle,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                GUESS THE SONG
              </Link>
              <Link
                to="/game/guess-the-artist"
                style={{
                  ...buttonStyle,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                GUESS THE ARTIST
              </Link>
              <Link
                to="/game/guess-who-listens"
                style={{
                  ...buttonStyle,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                GUESS WHO LISTENS TO THE SONG
              </Link>
              <Link
                to="/game/guess-the-lyric"
                style={{
                  ...buttonStyle,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                GUESS THE NEXT LYRIC
              </Link>
              <Link
                to="/game/heads-up"
                style={{
                  ...buttonStyle,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                HEADS UP
              </Link>
            </div>
          </p>
        </Card>
        <Card headerText="UPLOADER" style={cardStyle}>
          <p style={cardContent}>ENTER LOCAL FILE PATH:</p>
        </Card>
      </div>
      {/* Define routes for each game */}
      <div style={friendContainerStyle}>
        <FriendsCard />
      </div>

      <SongPlayer />
    </div>
  );
}

export default Mainpage;
