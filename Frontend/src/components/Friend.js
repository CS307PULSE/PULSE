import React from 'react';

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
};

const Friend = ({ name, photoFilename, favoriteSong }) => {
  if (!photoFilename || typeof photoFilename !== 'string') {
    return (
      <div className="friend-card">
        <p className="error-message">Invalid image URL</p>
      </div>
    );
  }

  return (
    <div className="friend-card">
      <div style={iconContainerStyle}>
        <img style={iconPictureStyle} src={photoFilename} alt={`${name}'s Photo`} />
      </div>
      <div className="friend-info" style={{ textAlign: 'center', marginTop: '5px' }}>
        <h2 className="friend-name" style={{ margin: '5px 0' }}>{name}</h2>
        <p className="favorite-song" style={{ margin: '0' }}>Favorite Song: {favoriteSong}</p>
      </div>
    </div>
  );
};

export default Friend;
