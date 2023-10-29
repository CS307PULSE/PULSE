import React from 'react';
import { Link } from 'react-router-dom';

const ChatbotButton = () => {

    // Inline styles for the components
    const containerStyle = {
        position: 'fixed',
        bottom: '10%',
        right: '2%',
        zIndex: 1000
    };

    const buttonStyle = {
        backgroundColor: '#6EEB4D',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        fontFamily: "Rhodium Libre",
        borderRadius: '50px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        textDecoration: 'none'
    };

    const buttonHoverStyle = {
        backgroundColor: 'white'
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div style={containerStyle}>
            <Link 
                to="/PulseBot" 
                style={isHovered ? { ...buttonStyle, ...buttonHoverStyle } : buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                PulseBot
            </Link>
        </div>
    );
}

export default ChatbotButton;
