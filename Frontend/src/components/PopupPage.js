import React from "react";

const PopupPage = ({ handleClose, currentPage, data }) => {
  const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
    zIndex: "999",
  };

  return (
    <div style={popupStyle}>
      <h2>Liked {currentPage === 'user' ? 'Users' : 'Songs'}</h2>
      {currentPage === 'user' ? (
        // Render user-specific content
        data.map((item, index) => (
          <p key={index}>{item.name}</p>
        ))
      ) : (
        // Render song-specific content
        data.map((item, index) => (
          <div key={index}>
            <p>{item.name}</p>
            {/* Add additional song-specific content rendering here */}
          </div>
        ))
      )}
      <button onClick={handleClose}>Close</button>
    </div>
  );
};

export default PopupPage;
