import TestIcon from "../test_icon.jpg";

const profileStyle = {
  paddding: "10px",
  margin: "0px",
  backgroundColor: "#000",
  width: "100%", // Set width to 100% to cover the entire width of the screen
  height: "100vh", // Set height to 100vh to cover the entire height of the screen
};
const profileHeader = {
  paddingTop: "150px",
  paddingLeft: "50px",
  color: "#6EEB4D",
  textRendering: "optimizeLegibility", // To mimic "text-edge: cap;"
  fontFamily: "Rajdhani-SemiBold, Helvetica",
  fontSize: "50px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "normal",
  left: "calc(50vw - 10px)",
  margin: "0px",
};
const profileText = {
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

const textFieldStyle = {
  backgroundColor: "#222",
  borderRadius: "10px",
  height: "40px",
  width: "300px",
  color: "#FFFFFF",
  padding: "10px",
  margin: "50px",
};

function EditProfile() {
  return (
    <div className="editProfile" style={profileStyle}>
      <p style={profileHeader}>Edit Profile</p>
      <form action="fileupload.php" enctype="multipart/form-data" method="post">
        <label style={profileText} for="username">
          Username:{" "}
        </label>
        <input id="username" type="text" style={textFieldStyle}></input>
        <p>\n</p>
        <label style={textFieldStyle} class="custom-uploader" for="file">
          Upload Your File
        </label>
        <input
          id="file"
          accept="image/jpeg,image/png"
          name="fileToUpload"
          type="file"
        />
        <button style={textFieldStyle} name="submit" type="submit">
          Update
        </button>
        <h1>Upload Your Profile Picture</h1>
      </form>
    </div>
  );
}
export default EditProfile;
