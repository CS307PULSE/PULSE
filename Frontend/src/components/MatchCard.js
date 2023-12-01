import React, { useState } from "react";
import { StyleSheet, css } from "aphrodite";

const MatchCard = ({ onSwipeLeft, onSwipeRight, data }) => {
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
      backgroundColor: "#fff",
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
        <img src={"XXXXXXXXXXXXXXXXXXXXXXXXXXXXX"} alt="Album cover" />
        <p>{"Name"}</p>
        <p>{"Artist/Favoriye song"}</p>
        <p>{data}</p>
      </div>
    </div>
  );
};

export default MatchCard;
