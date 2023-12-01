import React from 'react';

const TogglePage = ({ currentPage, handleToggle }) => {
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

  return (
    <div>
      <h2>{currentPage === 'user' ? 'User Page' : 'Song Page'}</h2>
      <div>
        <button
          className="toggle-button"
          onClick={handleToggle}
          style={topButtonStyle}
        >
          {currentPage === 'user'
            ? 'Go to Song Page'
            : 'Go to User Page'}
        </button>
      </div>
    </div>
  );
};

export default TogglePage;
