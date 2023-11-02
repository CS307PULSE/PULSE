// ChatBot.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OpenAI from "openai";
import Navbar from './NavBar';
import axios from 'axios';

const OPENAI_API_KEY = "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";
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const ChatBot = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([{ type: 'bot', content: "Hey! Welcome to pulse bot" }]);
    const [songs, setSongs] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [awaitingFeedback, setAwaitingFeedback] = useState(false);

    // the use effect hook for thr chatBot 
    useEffect(() => {
        // Add opening message when component mounts
        setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "How can I assist you with songs today?" }]);
    }, []);

    useEffect(() => {
        console.log("Updated songs:", songs);
        
        const sendSong = async () => {
            // Check if songs is not just empty spaces
                try {
                    // Use POST if you want to send data in the request body
                    const response = await axios.get('http://127.0.0.1:5000/chatbot/pull_songs', { songs }, { withCredentials: true });
                    console.log(response.data); // Assuming the server sends back JSON
                } catch (error) {
                    console.error('Error sending songs:', error.response ? error.response.data : error.message);
                }
        };
    
        // Call sendSong here
        sendSong();
    
    }, [songs]); // This will run the effect every time `songs` state updates
    

    useEffect(() => {
        console.log("Updated feedback:", feedback);
        const sendFeedback = async () => {
            if (feedback.trim()) { // Check if feedback is not just empty spaces
                try {
                    const response = await axios.post('http://127.0.0.1:5000/feedback', { feedback }, { withCredentials: true });
                    console.log(response.data); // Assuming the server sends back JSON
                } catch (error) {
                    console.error('Error sending feedback:', error.response ? error.response.data : error.message);
                }
            }
        };
    
        // Only call sendFeedback if feedback is not an empty string
        if (feedback !== '') {
            sendFeedback();
        }
        // Adding `feedback` as a dependency makes this effect run every time `feedback` changes.
    }, [feedback]);


 
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

    // Check if the message is about feedback
    const feedbackKeywords = ['feedback', 'comment', 'suggestion', 'recommendation'];
    const isFeedback = feedbackKeywords.some(keyword => inputValue.toLowerCase().includes(keyword));
   

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

            const feedbackKeywords = ['feedback', 'comment', 'suggestion', 'recommendation'];
        const isFeedbackKeyword = feedbackKeywords.some(keyword => inputValue.toLowerCase().includes(keyword));

        if (isFeedbackKeyword) {
            // Set the awaitingFeedback state to true
            setAwaitingFeedback(true);
            // Ask for feedback
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "Could you please tell me more about your thoughts?" }]);
        } else if (awaitingFeedback) {
            // Overwrite the existing feedback with the new message
            setFeedback(inputValue);
            // Reset the awaitingFeedback state
            setAwaitingFeedback(false);
            // Send a thank you message to the user
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "Thank you for your feedback!" }]);
            // Here, you would handle the feedback, e.g., sending it to a server or logging it
        } else {
            // Normal message handling if the user is not providing feedback
            // ... your existing code to send the message to OpenAI and handle the response
        }
        console.log(feedback);
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
