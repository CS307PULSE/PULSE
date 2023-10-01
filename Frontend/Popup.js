import styled from "styled-components";

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  max-width: 80%;
`;

const CloseButton = styled.span`
  position: relative;
  top: 0px;
  right: 0px;
  cursor: pointer;
`;

export default function Popup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PopupContent>
        <CloseButton onClick={onClose}>X</CloseButton>
      </PopupContent>
    </PopupOverlay>
  );
}
