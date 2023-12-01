// SongPage.js

import React from "react";
import MatchCard from "./MatchCardUser";
import axios from "axios";
import PopupPage from "./PopupPage"; 


const SongPage = ({
  onSwipeLeft,
  onSwipeRight,
  data,
  loading,
  handleViewLiked,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const centerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const bottomButtonStyle = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    backgroundColor: "#2ecc71",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  };




  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


  return (
    <div>
      <div style={centerStyle}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <MatchCard
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            data={data}
          />
        )}
      </div>
      
    </div>
  );
};

export default SongPage;
