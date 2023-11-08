import React, { useEffect, useState } from "react";
import axios from "axios";

import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";

var textSizeSetting, themeSetting;
try {
  var textSizeResponse = await axios.get(
    "http://127.0.0.1:5000/profile/get_text_size",
    { withCredentials: true }
  );
  textSizeSetting = textSizeResponse.data;
  var themeResponse = await axios.get("http://127.0.0.1:5000/profile/get_theme", {
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

const cardContent = {
  color: themeColors.text,
  fontSize: textSizes.body,
  fontFamily: "'Poppins', sans-serif",
};

//Update follower data
async function updateFollowers() {
  const response = await axios.get("http://127.0.0.1:5000/stats/update_followers", {
    withCredentials: true,
  });
  const data = response.data;
  console.log("Followers response:");
  console.log(response);
  return data;
}

export default function StatsCard() {
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
        const lastObj = data.follower_data[dateObjects[dateObjects.length - 1]];
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
        <p style={cardContent}>Favorite song recently: {topSongs[0][0].name}</p>
        <p style={cardContent}>You have {followers} followers</p>
      </>
    );
  } catch (e) {
    console.log(e);
    return <p>Try refreshing, data was bad, sorry!</p>;
  }
}
