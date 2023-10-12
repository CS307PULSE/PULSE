import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../src/assets/Background.png";
import Logo from "../../src/assets/LogoLogin.png";
import axios from "axios";

const loginMainStyle = {
  paddding: "0px",
  margin: "0px",
  backgroundColor: "#6EEB4D",
  backgroundImage: `url(${Background})`,
  width: "100%", // Set width to 100% to cover the entire width of the screen
  height: "100vh", // Set height to 100vh to cover the entire height of the screen
  backgroundSize: "cover", // Cover the entire container with the image
  backgroundRepeat: "no-repeat",
};
const loginStyle = {
  backgroundColor: "#000",
  width: "500px", // Set a specific width for the login section
  height: "100%",
  borderTopLeftRadius: "40px", // Rounded corner on the top-left
  borderBottomLeftRadius: "40px",
  margin: "0 0 0 auto", // Align to the right side and adjust the top margin as needed
  textAlign: "center",
};

const loginText = {
  paddingTop: "150px",
  color: "#6EEB4D",
  textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
  fontFamily: "Rajdhani-SemiBold, Helvetica",
  fontSize: "50px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "normal",
};

const loginSubText = {
  color: "#6EEB4D",
  fontFamily: "Poppins-Regular, Helvetica",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "normal",
};

const loginButton = {
  backgroundColor: "#6eeb4d",
  borderRadius: "30px",
  height: "52px",
  width: "364px",
};

const loginButtonText = {
  fontFamily: "Poppins-Regular, Helvetica",
  fontWeight: 700,
  fontSize: "14px",
};

const padding = {
  paddingBottom: "10px",
};

// document.body.style.overflow = "hidden"
// for the login call for fetch
async function fetchDataLogin() {
  const response = await axios.get("http://127.0.0.1:5000/login", {
    withCredentials: true,
  });
  const data = response.data;
  console.log(data);
  return data;
}

function Login({ onLoginClick }) {
  const [isLoginURL, setIsLoginURL] = useState(" ");
  //check if rthe user is logged in
  const navigate = useNavigate();

  //get the link for loggin through Spotify
  useEffect(() => {
    fetchDataLogin().then((data) => {
      if (data !== null && data !== undefined) {
        setIsLoginURL(data);
      }
    });
  }, []);

  return (
    <div className="login" style={loginMainStyle}>
      <div className="LoginSide" style={loginStyle}>
        <p style={loginText}>LOGIN</p>
        <p style={loginSubText}>Connect to your Spotify to start . . . </p>
        <img className="logo" alt="logo" style={{}} src={Logo} />
        <p style={padding}></p>
        <button
          className="loginButton"
          style={loginButton}
          onClick={() => {
            window.location.replace(isLoginURL);
            // Perform any login logic here if needed
            // For now, just set the state to true to indicate the button is clicked
            onLoginClick();
          }}
        >
          <p style={loginButtonText}>LOGIN THROUGH SPOTIFY</p>
        </button>
      </div>
    </div>
  );
}

export default Login;
