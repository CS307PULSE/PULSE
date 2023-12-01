import React, { Component } from 'react';
import Navbar from './NavBar';
import MatchCardUser from './MatchCardUser';
import MatchCardSong from './MatchCardSong';
import axios from 'axios';




class MatchIt extends Component {
  
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

  onSwipeLeft = async (userId) => {
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

  onSwipeRight = async (userId) => {
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


  render() {
    const { currentPage, nextUserData, loading, loadingSong } = this.state;

    const topButtonStyle = {
      position: 'absolute',
      top: '65px',
      right: 0,
      margin: '10px',
      backgroundColor: '#2ecc71',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
    };

    const bottomButtonStyle = {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: '#2ecc71',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
    };

    const centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    const viewLikedButtonText =
      currentPage === 'user' ? 'View Liked User' : 'View Liked Song';

    return (
      <div>
        <Navbar />
        <div style={{ paddingLeft: '10px' }}>
          <h2>{currentPage === 'user' ? 'User Page' : 'Song Page'}</h2>
          <div>
            <button
              className="toggle-button"
              onClick={this.handleToggle}
              style={topButtonStyle}
            >
              {currentPage === 'user'
                ? 'Go to Song Page'
                : 'Go to User Page'}
            </button>
          </div>
          {currentPage === 'user' && (
          <div style={centerStyle}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <MatchCardUser onSwipeLeft={this.onSwipeLeft} onSwipeRight={this.onSwipeRight} data={nextUserData} handleViewLiked={""} />
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
            <button
              className="view-liked-button"
              onClick={this.handleViewLiked}
              style={bottomButtonStyle}
            >
              {viewLikedButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default MatchIt;
