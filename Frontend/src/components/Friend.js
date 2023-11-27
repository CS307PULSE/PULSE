import React from 'react';

const Friend = ({ name, photoFilename, favoriteSong, status, publicColorText, publicColorBackground }) => {
  if (!photoFilename || typeof photoFilename !== 'string') {
    return (
      <div className="friend-card">
        <p className="error-message">Invalid image URL</p>
      </div>
    );
  }

  const iconContainerStyle = {
    width: '100px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  };

  const iconPictureStyle = {
    width: '80px', // Adjust the width as needed
    height: '80px', // Adjust the height as needed
    borderRadius: '50%',
    margin: '0',
    border: "3px solid " + publicColorBackground
  };

  const textContainer = {
    textAlign: 'center',
    marginTop: '5px',
    backgroundColor: publicColorBackground,
    borderRadius: "10px",
    padding: "10px"
  }

  return (
    <div className="friend-card">
      <div style={iconContainerStyle}>
        <img style={iconPictureStyle} src={photoFilename} alt={`${name}'s Photo`} />
      </div>
      <div className="friend-info" style={textContainer}>
        <h2 className="friend-name" style={{ margin: '5px 0', color: publicColorText }}>{name}</h2>
        <p className="favorite-song" style={{ margin: '0', color: publicColorText }}>Favorite Song: {favoriteSong}</p>
        <p className="status" style={{ margin: '0', color: publicColorText }}>Status: {status}</p>
      </div>
    </div>
  );
};

export default Friend;
