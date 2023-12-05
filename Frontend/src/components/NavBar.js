import React from "react";
import { Link } from "react-router-dom"; // If using React Router for navigation
import LogoPNG from "../../src/assets/LogoPNG.png";
import ProfileIcon from "../../src/assets/ProfileIcon.png";
import { useAppContext } from './Context';
import TextSize from "../theme/TextSize";
import { pulseColors } from '../theme/Colors';

const Navbar = () => {
  const { state, dispatch } = useAppContext();
  
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: state.colorAccent,
    padding: '0 1rem',
    color: state.colorText,
  };

  const logoStyle = {
    fontSize: '1.5rem',
    height: 60,
  };
  const linkContainerStyle = {
    display: 'flex',
    overflowX: "auto",
    overflowY: "hidden",
    height: "64px",
    alignItems: "center"
  };
  const linkStyle = {
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center',
    color: state.colorText,
    fontWeight: 600,
    textDecoration: 'none',
    margin: '5px 5px',
    padding: '5px',
    width: "125px",
    height: "30px",
    borderRadius: 10,
    backgroundColor: state.colorBackground,
    whiteSpace: "nowrap"
  };
  const profileIconStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    cursor: 'pointer',
  };

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
          <Link to="/friends" style={linkStyle}>Friends</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/explorer" style={linkStyle}>Explorer</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/games" style={linkStyle}>Games</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/match" style={linkStyle}>Matcher</Link>
        </div>
        <div style={linkStyle}>
          <Link to="/pulsebot" style={linkStyle}>PulseBot</Link>
        </div>
      </div>

      <div style={profileIconStyle}>
        <Link to="/profile">
          <img src={ProfileIcon} alt="Profile" style={profileIconStyle} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
