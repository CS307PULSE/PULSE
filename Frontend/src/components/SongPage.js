// SongPage.js

import React from "react";
import MatchCard from "./MatchCardUser";
import axios from "axios";

const SongPage = ({
  onSwipeLeft,
  onSwipeRight,
  data,
  loading,
  handleViewLiked,
}) => {
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

  const viewLikedButtonText = "View Liked Song";

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
      <div>
        <button
          className="view-liked-button"
          onClick={() => {
            handleViewLiked();
            console.log("Hey");
          }}
          style={bottomButtonStyle}
        >
          {viewLikedButtonText}
        </button>
      </div>
    </div>
  );
};

export default SongPage;
