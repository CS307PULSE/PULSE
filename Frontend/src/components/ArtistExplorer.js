import React, { useEffect, useState } from "react";
import Navbar from "./NavBar";
import Playback from "./Playback";
import TextSize from "../theme/TextSize";
import { useAppContext } from "./Context";
import { hexToRGBA } from "../theme/Colors";
import axios from "axios";
import { Link } from "react-router-dom";
import ItemList from "./ItemList";
import { searchSpotify, playItem } from "./Playback";
import { getImage } from "./ItemList";
import { countryList } from "../theme/Emotions";

export async function getArtistTopSongs(artist, country = "US") {
  if (!artist) { return; }
  const axiosInstance = axios.create({ withCredentials: true });
  const response = await axiosInstance.post("/api/info/get_artists_top_songs", {artist_id: artist.id, country: country});
  return response.data.tracks;
}
export async function getRelatedArtists(artist) {
  if (!artist) { return; }
  const axiosInstance = axios.create({ withCredentials: true });
  const response = await axiosInstance.post("/api/info/related_artists", {artist_id: artist.id});
  return response.data.artists;
}
export function checkInListByID(checkItem, list) {
  if (!list || !checkItem) { return false; }
  try {
    return list.some(item => item.id == checkItem.id);
  } catch (e) {
    return false;
  }
  
} 

const ArtistExplorer = () => {
  const { state, dispatch } = useAppContext();
  const textSizes = TextSize(state.settingTextSize); //Obtain text size values

  const [syncValue, setSyncValue] = useState(Date.now());
  const [selectedArtistIndex, setSelectedArtistIndex] = useState(-1);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [artistSearchResults, setArtistSearchResults] = useState([]);
  const [artistListMode, setArtistListMode] = useState("followed");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [listedSongs, setListedSongs] = useState([]);
  const [topSongsCountry, setTopSongsCountry] = useState("US");
  const [relatedArtists, setRelatedArtists] = useState([]);

  useEffect(() => {
    (async () => {
      setListedSongs("loading");
      setRelatedArtists("loading");
      const [artistTopSongs, relatedArtists] = await Promise.all(
        [getArtistTopSongs(currentArtist, topSongsCountry), getRelatedArtists(currentArtist)]);
      setListedSongs(artistTopSongs);
      setRelatedArtists(relatedArtists);
    })();
  }, [currentArtist]);
  useEffect(() => {
    setSelectedArtistIndex(-1);
  }, [artistListMode]);
  useEffect(() => {
    (async () => {
      setListedSongs("loading");
      setListedSongs(await getArtistTopSongs(currentArtist, topSongsCountry));
    })();
  }, [topSongsCountry]);

  async function searchForArtists(searchString) {
    setArtistSearchResults("loading");
    var data = await searchSpotify(searchString, "artist");
    setArtistSearchResults(data);
  }
  async function getFollowedArtists() {
    setFollowedArtists("loading");
    var response = await axios.get("/api/info/get_followed_artists", { withCredentials: true });
    setFollowedArtists(response.data);
  }
  useEffect(() => {
    getFollowedArtists();
  }, [])
  async function setFollowArtist(artist, state) {
    if (!artist) { return; }
    // setFollowedArtists("loading");
    console.log(artist);
    console.log(state);
    const action = state ? "follow_artist" : "unfollow_artist";
    const axiosInstance = axios.create({ withCredentials: true });
    const response = await axiosInstance.post("/api/info/" + action, {artist_id: artist.id});
    getFollowedArtists();
    // console.log(response.data);
    // setFollowedArtists(response.data);
  }
  function renderArtistInfo(artist) {
    if (!artist) {
      return ("");
    } else {
      return (
        <div>
          <img style={imageStyle} src={getImage(artist)}></img>
          <p style={{...headerTextStyle, 
            fontSize: "40px", top: "20px", left: "160px", position: "absolute"
          }}>{artist.name}</p>
          <button style={{...buttonStyle, position: "absolute", width: "200px", right: "20px"}}
            onClick={() => setFollowArtist(currentArtist, !checkInListByID(currentArtist, followedArtists))}
          >{!checkInListByID(currentArtist, followedArtists) ? "Follow " : "Unfollow"}</button>
          <div>
            <p style={textStyle}>{"Genres: " + artist.genres.join(', ')}</p>
            <p style={textStyle}>{"Followers: " + artist.followers.total}</p>
            <span style={textStyle}>{"Popularity: " + artist.popularity + "%"}</span>
          </div>
        </div>
      );
    }
  }

  const images = {
    expandButton: "https://www.svgrepo.com/show/93813/up-arrow.svg",
    searchButton: "https://cdn-icons-png.flaticon.com/256/3917/3917132.png",
    followedButton: "https://cdn-icons-png.flaticon.com/512/105/105220.png"
  };
  const bodyStyle = {
    backgroundColor: state.colorBackground,
    backgroundImage: "url('" + state.backgroundImage + "')",
    backgroundSize: "cover", //Adjust the image size to cover the element
    backgroundRepeat: "no-repeat", //Prevent image repetition
    backgroundAttachment: "fixed", //Keep the background fixed
  };
  const textStyle = {
    color: state.colorText,
    fontSize: textSizes.body,
    margin: "5px"
  };
  const headerTextStyle = {
    color: state.colorText,
    fontFamily: "'Poppins', sans-serif",
    fontSize: textSizes.header3,
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal"
  };
  const buttonContainerStyle = {
    display: 'flex',
    alignItems: 'center', // Center buttons horizontally
    marginTop: '5px', // Space between cards and buttons
    width: "100%"
  };

  const buttonStyle = {
    backgroundColor: state.colorBackground,
    color: state.colorText,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: state.colorBorder,
    borderRadius: '10px',
    cursor: 'pointer',
    margin: '5px',
    padding: '0px 10px 0px 10px',
    width: '100%',
    height: "50px",
    fontSize: textSizes.body
  };
  const textFieldContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "10px",
    height: "40px"
  }
  
  const sectionContainerStyle = {
      backgroundColor: hexToRGBA(state.colorBackground, 0.5),
      width: "calc(100% - 60px)",
      // height: "calc(100% - 100px)",
      padding: "20px",
      margin: "20px",
      position: "relative",
      overflow: "auto"
  }
  const imageStyle = {
    width: "100px",
    height: "100px",
    margin: "10px"
  }

  return (
    <div className="wrapper">
      <div className="header"><Navbar /></div>
      <div className="content" style={bodyStyle}>
        <div style={{display: "flex"}}>
        <div style={{width:"400px"}}> {/* Column 1 */}
          <div style={{...sectionContainerStyle, overflowY: "scroll"}}>
            {(() => {
              switch (artistListMode) {
                case "followed":
                  return (<>
                    <p style={headerTextStyle}>Followed Artists</p>
                    <img onClick={() => {setArtistListMode("search")}} style={{height: "40px", position: "absolute", top: "20px", right: "70px"}} src={images.searchButton}></img>
                    <img onClick={() => {setArtistListMode("followed")}} style={{height: "40px", position: "absolute", top: "20px", right: "15px"}} src={images.followedButton}></img>
                    <ItemList
                      data = {followedArtists}
                      selectedIndex = {selectedArtistIndex}
                      onClick = {(index) => {setSelectedArtistIndex(index); setCurrentArtist(followedArtists[index]);}}
                    />
                  </>);
                case "search":
                  return (<>
                    <p style={headerTextStyle}>Artist Search</p>
                    <img onClick={() => {setArtistListMode("search")}} style={{height: "40px", position: "absolute", top: "20px", right: "70px"}} src={images.searchButton}></img>
                    <img onClick={() => {setArtistListMode("followed"); getFollowedArtists();}} style={{height: "40px", position: "absolute", top: "20px", right: "15px"}} src={images.followedButton}></img>
                    <div style={buttonContainerStyle}>
                      <input type="text" style={buttonStyle} value={searchString}
                        onChange={e => {setSearchString(e.target.value)}}
                        onKeyDown={(e) => {if (e.key == 'Enter') {searchForArtists(searchString)}}}></input>
                      <button style={{...buttonStyle, width: "30%"}} onClick={() => {searchForArtists(searchString)}}>Search</button>
                    </div>
                    <ItemList
                      data = {artistSearchResults}
                      selectedIndex = {selectedArtistIndex}
                      onClick = {(index) => {setSelectedArtistIndex(index); setCurrentArtist(artistSearchResults[index]);}}
                    />
                  </>);
              }
            })()}
          </div>
        </div>
        <div style={{width:"calc(100% - 460px)"}}> {/* Column 2 */}
          <div style={sectionContainerStyle}>
            {renderArtistInfo(currentArtist)}
          </div>
          <div style={{display:"flex"}}>
            <div style={{...sectionContainerStyle, width: "50%", height: "500px"}}>
              <p style={headerTextStyle}>Top Songs</p>
              <select style={{...buttonStyle, width: "max(calc(100% - 180px), 70px)", position: "absolute", top: "20px", right: "10px"}}
                value={topSongsCountry} onChange={(e) => setTopSongsCountry(e.target.value)}>
                {countryList.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
              <ItemList
                data = {listedSongs}
                onClick = {(index) => playItem(listedSongs[index], () => setSyncValue(Date.now()))}
              />
            </div>
            <div style={{...sectionContainerStyle, width: "50%", height: "500px"}}>
              <p style={headerTextStyle}>Related Artists</p>
              <ItemList
                data = {relatedArtists}
                onClick = {(index) => setCurrentArtist(relatedArtists[index])}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="footer"><Playback syncTrigger={syncValue}/></div>
    </div>
  );
};

export default ArtistExplorer;
