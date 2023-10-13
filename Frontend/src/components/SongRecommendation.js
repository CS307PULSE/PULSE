import React from 'react';
import Navbar from './NavBar';
import FriendsCard from './FriendsCard';
import { Link } from "react-router-dom";

import TextSize from "../theme/TextSize";
import Colors from "../theme/Colors"; 
const textSizes = TextSize(1); // Obtain text size values
const themeColors = Colors("dark"); // Obtain color values

function SongRecommendations(){
return(
    <div>
        <Navbar/>
    </div>
);
}
export default SongRecommendations;