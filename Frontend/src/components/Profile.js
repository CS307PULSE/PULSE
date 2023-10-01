import TestIcon from "../test_icon.jpg"

const profileStyle = {
    paddding:"0px",
    margin: "0px",
    backgroundColor:"#000",
    width: "100%", // Set width to 100% to cover the entire width of the screen
    height: "100vh", // Set height to 100vh to cover the entire height of the screen
    backgroundSize: "cover", // Cover the entire container with the image
    backgroundRepeat: "no-repeat",
  };

const profileHeader={
    paddingTop: "150px",
    paddingLeft: "50px",
    color: "#6EEB4D",
    textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
    fontFamily: "Rajdhani-SemiBold, Helvetica",
    fontSize: "50px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
};
const profileText={
    paddingTop: "150px",
    paddingLeft: "50px",
    color: "#6EEB4D",
    textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
    fontFamily: "Rajdhani-SemiBold, Helvetica",
    fontSize: "25px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
};

function Profile({testParameter}){
    return(
    <div className="profile" style={profileStyle}>
        <p style={profileHeader}>Profile</p>
        <img className="logo" alt="logo" style={{}}src={TestIcon}/>
        <p style={profileText}>Username: </p>
    </div>
    );
}    
export default Profile;