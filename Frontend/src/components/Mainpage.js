import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Card from "./Card";
import FriendsCard from "./FriendsCard";
import SongPlayer from "./SongPlayer";
import { useAppContext } from "./Context"
import StatsCard from "./StatsCard";
import ChatbotButton from "./ChatBotButton";
import axios from "axios";
import TextSize from "../theme/TextSize";
import { hexToRGBA } from "../theme/Colors";

function Mainpage() {

  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values
  
  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
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
    color: state.colorText,
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
    backgroundColor: state.colorBackground,
    color: state.colorText,
    padding: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.colorBorder,
    borderRadius: "10px",
    cursor: "pointer",
    margin: "5px", // Small space between buttons
    width: "90%",
  };
  const friendContainerStyle = {
    position: "fixed",
    top: 100,
    right: 0,
    width: "20%",
    height: "900",
    backgroundColor: hexToRGBA(state.colorBackground, 0.5),
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
  
  //Update follower data
  async function updateFollowers() {
    const response = await axios.get("http://127.0.0.1:5000/update_followers", {
      withCredentials: true,
    });
    const data = response.data;
    console.log("Followers response:");
    console.log(response);
    return data;
  }
  
  const handleChatbotClick = () => {
    // Logic to open chatbot goes here
    alert('Chatbot clicked!');
  };

  function StatsCardComp() {
    //Data to display on stats card
    const [topArtists, setTopArtists] = useState();
    const [topSongs, setTopSongs] = useState();
    const [followers, setFollowers] = useState();
    const [statsDone, setStatsDone] = useState(false);

    useEffect(() => {
      updateFollowers();
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
    try {
      return (
        <>
          <p style={cardContent}>
            Favorite artist of all time: {topArtists[2][0].name}
          </p>
          <p style={cardContent}>
            Favorite artist recently: {topArtists[0][0].name}
          </p>
          <p style={cardContent}>
            Favorite song of all time: {topSongs[2][0].name}
          </p>
          <p style={cardContent}>
            Favorite song recently: {topSongs[0][0].name}
          </p>
          <p style={cardContent}>You have {followers} followers</p>
        </>
      );
    } catch (e) {
      console.log(e);
      return <p>Try refreshing, data was bad, sorry!</p>;
    }
  }

  const handleChatbotClick = () => {
    alert("Chatbot clicked!");
  };
  useEffect(() => {
    document.title = "PULSE - Dashboard";
  }, []);

  return (
    <div class="wrapper">
      <div class="header"><Navbar /></div>
      <div class="content" style={bodyStyle}>
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
        <ChatbotButton/>
        <div style={friendContainerStyle}>
          <FriendsCard />
        </div>
      </div>
      <div class="footer"><SongPlayer /></div>
    </div>
  );
}

export default Mainpage;
