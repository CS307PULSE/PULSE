// ChatBot.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OpenAI from "openai";
import Navbar from './NavBar';

const OPENAI_API_KEY = "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";
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const ChatBot = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([{ type: 'bot', content: "Hey! Welcome to pulse bot" }]);
    const [songs, setSongs] = useState([]);

    // the use effect hook for thr chatBot 
    useEffect(() => {
        // Add opening message when component mounts
        setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "How can I assist you with songs today?" }]);
    }, []);

    useEffect(() => {
        // This will run right after the `songs` state is updated
        console.log("Updated songs:", songs);
    }, [songs]);
    
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

    const handleSendMessage = async () => {
        if (inputValue.trim() === '') return;


        setMessages([...messages, { type: 'user', content: inputValue }]);
        try {
            const promptText = `The following is a conversation with a song helper assistant.The webiste the assistant is running on is called PULSE. The website has 5 main sections: the dashboard, the statistics page, the games page, a DJ mixer page and the uploader page. The games futher divided into: Guess the song, Guess the artist, Guess who listens to the song, guess the next lyric and heads up. You can change the dark/light mode and text size in the profile under the setting section. Given partial lyrics ALWAYS send a link to the full lyrics as url. When asked for songs based on any criteria give it in list format with numbers. \n\nHuman: ${inputValue}\nAI: `;
            
            const response = await openai.completions.create({
                model: "gpt-3.5-turbo-instruct",
                prompt: promptText,
                temperature: 0.9,
                max_tokens: 150,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0.6,
                stop: ["Human:", "AI:"],
            });
            console.log(response)
            const botResponse = response.choices[0].text.trim();

            const songMatches = botResponse.match(/"([^"]+)"/g); // Regex to find quotes
            if (songMatches) {
                setSongs(songMatches.map(song => song.replace(/"/g, ''))); // Remove quotes and add to songs list
            } else {
                setSongs([]); // If no songs are found, set the state to an empty array
            }

            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: botResponse }]);
        } catch (error) {
            console.error("Error fetching response from OpenAI:", error);
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "Sorry, I faced an error fetching a response." }]);
        }
    
        setInputValue(''); // Clear the input after sending the message
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
