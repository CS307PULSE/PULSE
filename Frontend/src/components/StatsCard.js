import React, { useEffect, useState } from "react";
import axios from "axios";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";

//Update follower data
async function updateFollowers() {
  const response = await axios.get("/api/statistics/update_followers", {
    withCredentials: true,
  });
  const data = response.data;
  console.log("Followers response:");
  console.log(response);
  return data;
}

export default function StatsCard() {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values
  
  const cardContent = {
    color: state.colorText,
    fontSize: textSizes.body,
  };

  //Data to display on stats card
  const [topArtists, setTopArtists] = useState();
  const [topSongs, setTopSongs] = useState();
  const [followers, setFollowers] = useState();
  const [statsDone, setStatsDone] = useState(false);
  useEffect(() => {
    updateFollowers();
    const fetchData = async () => {
      const response = await axios.get("/api/statistics/short", {
        withCredentials: true,
      });
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
    console.log(topArtists);
    return (
      <>
        <p style={cardContent}>
          Favorite artist of all time:{" "}
          {topArtists[2][0] ? topArtists[2][0].name : "None"}
        </p>
        <p style={cardContent}>
          Favorite artist recently:{" "}
          {topArtists[0][0] ? topArtists[0][0].name : "None"}
        </p>
        <p style={cardContent}>
          Favorite song of all time:{" "}
          {topSongs[2][0] ? topSongs[2][0].name : "None"}
        </p>
        <p style={cardContent}>
          Favorite song recently:{" "}
          {topSongs[0][0] ? topSongs[0][0].name : "None"}
        </p>
        <p style={cardContent}>You have {followers} followers</p>
      </>
    );
  } catch (e) {
    console.log(e);
    return <p>Try refreshing, data was bad, sorry!</p>;
  }
}
