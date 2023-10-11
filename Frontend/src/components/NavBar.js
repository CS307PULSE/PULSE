import React from 'react';
import { Link } from 'react-router-dom'; // If using React Router for navigation
import LogoPNG from "../../src/assets/LogoPNG.png";
import ProfileIcon from "../../src/assets/ProfileIcon.png";

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: "#6EEB4D",
  padding: '0 1rem',
  color: 'white',
};

const logoStyle = {
  fontSize: '1.5rem',
  height: 60,
};


const linkContainerStyle = {
  display: 'flex',
};

const linkStyle = {
  color: '#FFF',
  fontWeight: 500,
  textTransform: 'uppercase',
  fontFamily: "'Poppins', sans-serif",
  textDecoration: 'none',
  margin: '0 1rem',
  padding: '0.5rem 1rem',
  borderRadius: 20,
  backgroundColor: 'black',
};

const profileIconStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  cursor: 'pointer',
};

const Navbar = () => {
  return (
    <nav style={navbarStyle}>
      <Link to="/dashboard">
        <img src={LogoPNG} alt="Logo" style={logoStyle} />
      </Link>

      <div style={linkContainerStyle}>
        <div style={linkStyle}>
          <Link to="/statistics" style={linkStyle}>Statistics</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/DJmixer" style={linkStyle}>DJ Mixer</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/games" style={linkStyle}>Games</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/uploader" style={linkStyle}>Uploader</Link>
        </div>
      </div>

      <div style={profileIconStyle}>
        <Link to="/profile">
          <img src={ProfileIcon} alt="Profile" style={profileIconStyle} />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
