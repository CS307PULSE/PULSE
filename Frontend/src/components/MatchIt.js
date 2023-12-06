import React, { Component } from 'react';
import { useState } from 'react';
import Navbar from './NavBar';
import MatchCardUser from './MatchCardUser';
import MatchCardSong from './MatchCardSong';
import axios from 'axios';
import PopupPage from './PopupPage';
import Playback from './Playback';
import { Link } from 'react-router-dom';
class MatchIt extends Component {
 // const { states, dispatch } = useAppContext();

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 'user',
      nextUserData: null,
      nextSongData: null,
      loading: true, // Added loading state
      loadingSong: true, // Added loadingSong state
      userId: null, // Added userId state
      songId: null, // Added songId state
      likedUsers: null,
      likedSongs: null,
      showPopup: false,
    };
  }

  // the stuff for the user section of this page 
  componentDidMount() {
    this.getNextUser();
    this.getNextSong();
  }

  getNextUser = async () => {
    try {
      const response = await axios.get("/api/user_matcher/get_next_user", {
        withCredentials: true,
      });

      const { data: nextUserData } = response;
      const {  id, name, image,  song, status, text_color, backgound_color } = nextUserData;

      console.log("Next User Data:", nextUserData);

      // Set the next user data and update loading state
      this.setState({ nextUserData, loading: false, userId: id });
    } catch (error) {
      console.error("Error fetching next user:", error);
      // Handle the error as needed and update loading state
      this.setState({ loading: false});
    }
  };

  handleToggle = () => {
    this.setState((prevState) => ({
      currentPage: prevState.currentPage === 'user' ? 'songs' : 'user',
    }));
  };

  getNextSong = async () => {
    try {
      const response = await axios.get("/api/song_matcher/get_next_song", {
        withCredentials: true,
      });
      const { data: nextSongData } = response;
    
      console.log("Next Song Data:", nextSongData);

      // Set the next song data and update loading state
      this.setState({ nextSongData, loadingSong: false , songId : JSON.stringify(nextSongData) });
    } catch (error) {
      console.error("Error fetching next song:", error);
      // Handle the error as needed and update loading state
      this.setState({ loadingSong: false });
    }
  };

  onSwipeLeft = async () => {
    const { userId } = this.state;
    console.log("UserID:" + userId)
    console.log("Swiped Left!");

    try {
      // Call the backend swipe_left endpoint
      await axios.post("/api/user_matcher/swipe_left", {
        user: userId,
      }, {
        withCredentials: true,
      });
      // Recall the get user data function to update the next user data
      await this.getNextUser();
    } catch (error) {
      console.error("Error swiping left:", error);
      // Handle the error as needed
    }
  };

  onSwipeRight = async () => {
     const { userId } = this.state;
    console.log("Swiped Right!");
    // Add your custom logic here
    try {
      // Call the backend swipe_left endpoint
      await axios.post("/api/user_matcher/swipe_right", {
        user: userId,
      }, {
        withCredentials: true,
      });

      // Recall the get user data function to update the next user data
      await this.getNextUser();
    } catch (error) {
      console.error("Error swiping right:", error);
      // Handle the error as needed
    }
  };

  onSwipeLeftSong = async () => {
    console.log("Swiped Left!");
    const { songId } = this.state;
    try {
      const parsedSongId = JSON.parse(songId); 
      // Call the backend swipe_left endpoint
      await axios.post("/api/song_matcher/swipe_left", {
        song: parsedSongId,
      }, {
        withCredentials: true,
      });
      // Recall the get user data function to update the next user data
      await this.getNextSong();
    } catch (error) {
      console.error("Error swiping left:", error);
      // Handle the error as needed
    }
  };

  onSwipeRightSong = async () => {
    console.log("Swiped Right!");
    const { songId } = this.state;
    try {
      const parsedSongId = JSON.parse(songId); 
      // Call the backend swipe_left endpoint
      await axios.post("/api/song_matcher/swipe_right", {
        song: parsedSongId,
      }, {
        withCredentials: true,
      });
      // Recall the get user data function to update the next user data
      await this.getNextSong();
    } catch (error) {
      console.error("Error swiping right:", error);
      // Handle the error as needed
    }
  };

  handleClosePopup = () => {
    // Placeholder function for handling popup close
    this.setState({ showPopup: false });
  };

  handleViewLiked = () => {
    const { currentPage } = this.state;

    if (currentPage === 'user') {
      this.viewLikedUsers();

    } else {
      this.viewLikedSongs();

    }
  };

  viewLikedUsers = async () => {
    // Add logic for viewing liked users
    console.log("View Liked Users");

    try {
      // Call the backend view_swiped_users endpoint using GET method
      const response = await axios.get("/api/user_matcher/view_swiped_users", {
        withCredentials: true,
      });

      // Handle the response data and update the state
      const { data: likedUsers } = response;
      console.log("Liked Users:", likedUsers);

      this.setState({ likedUsers , showPopup: true});
    } catch (error) {
      console.error("Error viewing liked users:", error);
      // Handle the error as needed
    }
  };


  viewLikedSongs = async() => {
    // Add logic for viewing liked songs
    console.log("View Liked Songs");
    // Add any additional logic or API calls needed for viewing liked songs
    try {
      // Call the backend view_swiped_users endpoint using GET method
      const response = await axios.get("/api/song_matcher/view_swiped_songs", {
        withCredentials: true,
      });
      console.log(response);

      // Handle the response data and update the state
      const { data: likedSongs } = response;
      console.log("Liked Songs:", likedSongs);

      this.setState({ likedSongs, showPopup: true});
    } catch (error) {
      console.error("Error viewing liked users:", error);
      // Handle the error as needed
    }
  };

  render() {
    const { currentPage, nextUserData, loading, loadingSong } = this.state;

    const topButtonStyle = {
      position: 'absolute',
      top: '10px',
      right: 0,
      margin: '10px',
      backgroundColor: '#6EEB4D',
      color: 'black',
      border: 'none',
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      borderRadius: '20px',
      transition: 'color 0.3s ease-in-out', // Add transition for smooth color change
      ':hover': {
        color: 'white',
      },
    };
    
    const bottomButtonStyle = {
      position: 'fixed',
      right: '10px',
      bottom: '70px',
      backgroundColor: '#6EEB4D',
      color: 'black',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      borderRadius: '20px',
      padding:'10px 20px',
      transition: 'color 0.3s ease-in-out', // Add transition for smooth color change
      ':hover': {
        color: 'white',
      },
    };

    const centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    const HeaderStyle = {
      display: "flex",
      justifyContent: 'center',
      fontWeight: 700,
      alignItems: 'center',
      color: "white",
      textTransform: 'uppercase',
      fontFamily: "'Poppins', sans-serif",
      textDecoration: 'none',
      margin: '10px 10px',
      padding: '5px',
      width: "160px",
      height: "25px",
      borderRadius: 20,
      whiteSpace: "nowrap"
    };
    
    // const buttonStyle = {
    //   backgroundColor: state.colorBackground,
    //   color: state.colorText,
    //   borderWidth: '1px',
    //   borderStyle: 'solid',
    //   borderColor: state.colorBorder,
    //   borderRadius: '10px',
    //   cursor: 'pointer',
    //   margin: '5px',
    //   padding: '0px 10px 0px 10px',
    //   width: '100%',
    //   height: "50px",
    //   fontSize: textSizes.body
    // };

    const viewLikedButtonText =
      currentPage === 'user' ? 'View Liked User' : 'View Liked Song';

    return (
      <div className="wrapper" style={{background:"black", height: "100vh" }}>
        <div className="header"><Navbar /></div>
        <div className="content" style={{ paddingLeft: '10px'}}>
          <h2 style={HeaderStyle}>{currentPage === 'user' ? 'User Matcher' : 'Song Matcher'}</h2>
          <p style={{color: "white"}}>{
            currentPage === 'user' ? 'Match with other users based on the genres you listen to! Add users you match with as friends to be able to see the songs and artists they listen to.' : 'Match with songs based on your listening preferences! As you swipe left or right your preferences will dynamically update to recommend you songs that better reflect your tastes.'}</p>
          <div>
            <button
              className="toggle-button"
              onClick={this.handleToggle}
              style={topButtonStyle}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'black'}
            >
              {currentPage === 'user'
                ? 'Go to Song Match'
                : 'Go to User Match'}
            </button>
          </div>
          {currentPage === 'user' && (
          <div style={centerStyle}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <MatchCardUser onSwipeLeft={this.onSwipeLeft} onSwipeRight={this.onSwipeRight} data={nextUserData} />
            )}
          </div>
        )}
        {currentPage !== 'user' && (
          <div style={centerStyle}>
            {loadingSong ? (
              <p>Loading...</p>
            ) : (
              <MatchCardSong onSwipeLeft={this.onSwipeLeftSong} onSwipeRight={this.onSwipeRightSong} data={this.state.nextSongData} />
            )}
          </div>
        )}
       
       
          <div>
          {this.state.showPopup ? (
           <PopupPage
           handleClose={this.handleClosePopup}
           currentPage={this.state.currentPage}
           data={this.state.currentPage === 'user' ? this.state.likedUsers : this.state.likedSongs}
         />
         
          ) : (
            <div>
            {currentPage !== 'user' && (
              <button
                className="view-liked-button"
                style={bottomButtonStyle}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'black'}
              >
                <Link to="/view-liked-songs" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {viewLikedButtonText}
                </Link>
              </button>
            )}
             </div>           
          )}
          </div>
        </div>
        <div className="footer"><Playback/></div>
      </div>
    );
  }
}

export default MatchIt;
