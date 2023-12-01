import React, { useState } from "react";
import { StyleSheet, css } from "aphrodite";

const MatchCardUser = ({ onSwipeLeft, onSwipeRight, data }) => {
  const theme = {
    primaryColor: "#6EEB4D",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    darkOffGrey: "#364232",
    lightOffGrey: "#c5d1c0",
    fontFamily: "'Poppins', sans-serif",
  };
    const { id, name, image,  song, status, text_color, backgound_color } = data;
  const [startX, setStartX] = useState(0);

  const handleDragStart = (e) => {
    setStartX(e.clientX);
  };

  const handleDragEnd = (e) => {
    const endX = e.clientX;
    const deltaX = endX - startX;

    if (deltaX > 50 && onSwipeRight) {
      onSwipeRight();
    } else if (deltaX < -50 && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  const handleDrag = (e) => {
    const deltaX = e.clientX - startX;
    // Adjust the card's position during the drag
    e.target.style.transform = "translateX(0)";
  };
  

  const styles = StyleSheet.create({
    card: {
      width: "500px",
      height: "600px",
      backgroundColor: theme.backgroundColor,
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      cursor: "grab",
      position: "relative",
      margin: "20px",
      transition: "transform 0.3s ease-in-out",
      ":hover": {
        transform: "scale(1.05)",
      },
    },
    content: {
      padding: "20px",
      textAlign: "center",
      color: theme.textColor,
      fontFamily: theme.fontFamily,
      fontSize: "20px",
      textTransform: "uppercase",
    },
    image: {
      width: "300px",
      height: "300px",
      borderColor:"white",
      padding:"10px",
      borderWidth:"3",
    },
  });

  return (
    <div
      className={css(styles.card)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
    >
      <div className={css(styles.content)}>
        <img src={image} alt="Album cover" className={css(styles.image) }/>
        <p>{"Username: "+ name}</p>
        <p>{"Favorite song: " +song}</p>
        <p>{"Status:" +status}</p>
      </div>
    </div>
  );
};

export default MatchCardUser;
