// ChatBot.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './NavBar';

const ChatBot = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const styles = {
        title:{
            color: "#FFF",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "30px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            textTransform: "uppercase"
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh', // Make sure the container takes up the full viewport height
            width: '100vw'  
        },
        chatWindow: {
            flexGrow: 1,   
            height: '400px',
            border: '1px solid #ccc',
            overflowY: 'scroll',
            padding: '10px',
            marginBottom: '10px'
        },
        userMessage: {
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '5px',
            backgroundColor: '#6EEB4D',
            color:'black',
            alignSelf: 'flex-end',
            order: 2
        },
        botMessage: {
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '5px',
            backgroundColor: 'white',
            color:'black',
            alignSelf: 'flex-start',
            order: 1
        },
        chatInput: {
            display: 'flex',
            gap: '10px'
        },
        inputField: {
            flexGrow: 1
        },
        sendButton: {
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px'
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;
        setMessages([...messages, { type: 'user', content: inputValue }]);
        setInputValue(''); // Clear the input. Integration with API will go here.
    };
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div style={styles.container}>
            <Navbar/>
            <h2 style={styles.title}>PULSE BOT</h2>
            <div style={styles.chatWindow}>
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        style={message.type === 'user' ? styles.userMessage : styles.botMessage}>
                        {message.content}
                    </div>
                ))}
            </div>
            <div style={styles.chatInput}>
                <input style={styles.inputField} value={inputValue} onChange={handleInputChange} onKeyPress={handleKeyPress}  />
                <button style={styles.sendButton} onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatBot;
