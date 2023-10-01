import React from "react";
import React from "react";
import Background from "../../src/assets/Background.png";
import Logo from "../../src/assets/LogoLogin.png";

const gameHomeMainStyle = {
    paddding:"0px",
    margin: "0px",
    backgroundColor:"#6EEB4D",
    backgroundImage: `url(${Background})`,
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "100vh", // Set height to 100vh to cover the entire height of the screen
    backgroundSize: "cover", // Cover the entire container with the image
    backgroundRepeat: "no-repeat",
};
const gameHomeStyle = {
    backgroundColor: "#000",
    width: "500px", // Set a specific width for the login section
    height: "100%",
    borderTopLeftRadius: "40px", // Rounded corner on the top-left
    borderBottomLeftRadius: "40px",
    margin: "0 0 0 auto", // Align to the right side and adjust the top margin as needed
    textAlign: "center",
};

const gameText={
    paddingTop: "150px",
    color: "#6EEB4D",
    textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
    fontFamily: "Rajdhani-SemiBold, Helvetica",
    fontSize: "50px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
};


const loginButton={
    backgroundColor: "#6eeb4d",
    borderRadius: "30px",
    height: "52px",
    width: "364px",
};

function GameHome({}){
    return(
    <div className="login" style={loginMainStyle}>
        <img className="logo" alt="logo" style={{}}src={Logo}/>
        <p style={loginButtonText}>Play games</p>
    </div>
    );

}    
export default GameHome;