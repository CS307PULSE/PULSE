import React from "react";
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink,
} from "./NavbarElements";

const Navbar = () => {
  return (
    <>
      <Nav>
        <Bars />
        <NavMenu>
          <NavLink to="/Statistics" activeStyle>
            Statistics
          </NavLink>
          <NavLink to="/DJmixer" activeStyle>
            DJ Mixer
          </NavLink>
          <NavLink to="/Games" activeStyle>
            Games
          </NavLink>
          <NavLink to="/Uploader" activeStyle>
            Uploader
          </NavLink>
          {/* Second Nav */}
          {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
        </NavMenu>
        <NavBtn>
          <NavBtnLink to="/signin"></NavBtnLink>
        </NavBtn>
      </Nav>
    </>
  );
};

export default Navbar;
