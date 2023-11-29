import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./NavBar";
import FriendsCard from "./FriendsCard";
import Colors from "../theme/Colors";
import TextSize from "../theme/TextSize";

const themeColors = Colors(0); //Obtain color values
const textSizes = TextSize(1); //Obtain text size values

//___________________________________________________________________________________
//                            Initial API Request
var hasDataInDBInitial;
try {
  var hasDataInDBResponse = await axios.get(
    "/advanced_data_check", 
    { hasDataInDBInitial: true }
  );
  hasDataInDBInitial = hasDataInDBResponse.data;
} catch (e) {
  console.log("Fetching hasDataInDB failed: " + e);
  hasDataInDBInitial = false;
}

//___________________________________________________________________________________
//                                    Style
const bodyStyle = {
  backgroundColor: themeColors.background,
  margin: 0,
  padding: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const friendContainerStyle = {
  position: "fixed",
  top: 100,
  right: 0,
  width: "20%",
  height: "900",
  backgroundColor: themeColors.background,
};

const buttonStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
    padding: "20px 40px", // Increase the padding for taller buttons
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: themeColors.text,
    borderRadius: "10px",
    cursor: "pointer",
    margin: "5px",
    width: "70%", // Adjust the width to take up the entire space available
    textAlign: "center", // Center the text horizontally
  };


//___________________________________________________________________________________
//                                    API calls

//TODO put array into response 
async function sendFilepaths(filepaths) {
  console.log("sending filepaths");
  console.log(filepaths);
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "/import_advanced_stats",
    { filepaths : filepaths }
  );
  const data = response.data;
  console.log("DATA:");
  console.log(response);
  return data;
}



const Uploader = () => {
//___________________________________________________________________________________
//                                    Constants  
  const [hasData, setHasData] = useState(false);
  const [filepaths, setFilepaths] = useState([""]);
  const [hasDataInDB, setHasDataInDB] = useState(hasDataInDBInitial);
  const [inputValue, setInputValue] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [loadDataFailed, setLoadDataFailed] = useState(false);
  const [triedToLoadData, setTriedToLoadData] = useState(null);



  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (filepaths[0] === "") {
        var temp = [""];
        temp.push(event.target.value);
        temp.shift();
        setFilepaths(temp);
        setInputValue("");
        console.log('Filepath saved');
      } else {
        var temp = filepaths;
        temp.push(event.target.value);
        setFilepaths(temp);
        setInputValue("");
        console.log('Filepath saved');
      }
    }
  }

  async function doneTypingPaths() {
    //false if failed
    var test = !(await sendFilepaths(filepaths));
    console.log("HERE");
    setFilepaths([]);
    if (!test) {
      setLoadingData(false);
      setLoadDataFailed(true);
      alert("One or more of your filepaths may be incorrect")
    } else {
      setLoadingData(true);
      setLoadDataFailed(false);
      setHasDataInDB(true);
    }
  }

    /*
    setHasData(true);
    console.log(loadingData);
    console.log(loadedData);
    if (!loadingData && loadedData === null)
      console.log("1");
      setLoadedData(!sendFilepaths(filepaths));
      setLoadingData(true);
    if (loadedData) {
      console.log("2");
      setFilepaths([]);
      setHasDataInDB(true);
    } else if (!loadedData && loadedData !== null) {
      console.log("3");
      setFilepaths([]);
      setHasDataInDB(false);
      alert("One or more of the filepaths you entered do not work. Please try again")
    }
    */


//___________________________________________________________________________________
//                                    Functions
  
  function generateInstructions(hasData) {
    if (hasDataInDB) {
      return ( 
        <div>
          <p>You have already uploaded your data!
            It may take up to 10 minutes for data to start populating your statistics page
          </p>
          <button onClick={() => setHasDataInDB(false)}>I want to reupload my data</button>
        </div>
      );
    }else if(hasData) {
      return 
    } else {
      return (
        <div>
          <p>You can get a ZIP file with a copy of your personal data by using the 
            automated Download your data tool on the Privacy Settings section of your spotify 
            account page or by contacting spotify. Make sure to request your "extended streaming history"
            and not any of the other options</p>
          <button onClick={() => setHasData(true)}>I have my data</button>
        </div>
      );
    }
  }


  function uploadFiles(hasData) {
    if (hasDataInDB) {
      return
    } else if(!hasData) {
      return 
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p>Please type in your file paths, and press enter to save each one</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => setHasData(false)}>Cancel</button>
        <button onClick={() => doneTypingPaths()}>I have entered all my filepaths</button>
      </div>
      );

      
    }
  }
  
//___________________________________________________________________________________
//                                    Body

  return (
    <div style={bodyStyle}>
    {generateInstructions(hasData)}
    {uploadFiles(hasData)}
    </div>
  );
};

export default Uploader;
