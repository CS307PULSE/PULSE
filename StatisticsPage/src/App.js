import React, { useState } from "react";
import "./App.css";
import GraphGrid from "./GraphGrid";
import styled from "styled-components";
import Popup from "./Popup";

const Button = styled.button`
  background-color: #3f51b5;
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: #283593;
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="App">
      <GraphGrid />
      <div>
        <Button onClick={openPopup}>Add Graph</Button>
      </div>
      <Popup isOpen={isPopupOpen} onClose={closePopup}>
        <h2> This is my Popup</h2>
      </Popup>
    </div>
  );
}

export default App;
