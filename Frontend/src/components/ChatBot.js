// ChatBot.js

import React, { useState, useEffect } from 'react';
import OpenAI from "openai";
import Navbar from './NavBar';
import axios from 'axios';
import { useAppContext } from './Context';
import Colors, { hexToRGBA, pulseColors } from '../theme/Colors';
import TextSize from '../theme/TextSize';

const OPENAI_API_KEY = "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";
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const ChatBot = () => {
    const { state } = useAppContext();
    const textSizes = TextSize(state.settingTextSize);

    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([{ type: 'bot', content: "Hey! Welcome to PULSE Bot." }]);
    const [songs, setSongs] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [awaitingFeedback, setAwaitingFeedback] = useState(false);

    useEffect(() => {
        let isMounted = true;
        console.log("Updated songs:", songs);
        
        const sendSong = async () => {
            // Check if songs is not just empty spaces
            try {
                const axiosInstance = axios.create({
                    withCredentials: true,
                    });
                    const response = await axiosInstance.post(
                    "/api/chatbot/pull_songs",
                    {
                        songlist: songs,
                    }
                    );
                console.log(response.data); // Assuming the server sends back JSON
            } catch (error) {
                console.error('Error sending songs:', error.response ? error.response.data : error.message);
            }
        };
    
        // Call sendSong here
        if (isMounted) {
            sendSong();
        }
        
        return () => {
            isMounted = false;
        };
    }, [songs]); // This will run the effect every time `songs` state updates
    

    useEffect(() => {
        console.log("Updated feedback:", feedback);
        const sendFeedback = async () => {
            if (feedback.trim()) { // Check if feedback is not just empty spaces
                try {
                    const response = await axios.post('/api/feedback', { feedback }, { withCredentials: true });
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
        linkStyle: {
            color: state.colorText,
            fontWeight: 500,
            textTransform: 'uppercase',
            fontFamily: "'Poppins', sans-serif",
            textDecoration: 'none', 
            margin: '0 1rem',
            padding: '0.5rem 1rem',
            borderRadius: 20,
            border: '1px solid white',
            backgroundColor: state.colorBackground,
          },
        title:{
            color: state.colorText,
            fontSize: textSizes.header2,
            textAlign: "center",
            fontWeight: 600,
            lineHeight: "normal",
        },
        container: {
            backgroundColor: state.colorBackground,
            backgroundImage: "url('" + state.backgroundImage + "')",
            backgroundSize: "cover", //Adjust the image size to cover the element
            backgroundRepeat: "no-repeat", //Prevent image repetition
            backgroundAttachment: "fixed", //Keep the background fixed
            display: 'flex',
            flexDirection: 'column',
            height: '100vh', // Make sure the container takes up the full viewport height
            width: '100vw'  
        },
        chatWindow: {
            backgroundColor: hexToRGBA(state.colorBackground, 0.5),
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
            fontSize: textSizes.body,
            backgroundColor: pulseColors.white,
            border: "1px " + state.colorBorder + " solid",
            color:'black',
            alignSelf: 'flex-end',
            order: 2
        },
        botMessage: {
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '5px',
            fontSize: textSizes.body,
            backgroundColor: pulseColors.green,
            border: "1px " + state.colorBorder + " solid",
            color:'black',
            alignSelf: 'flex-start',
            order: 1
        },
        chatInputContainer: {
            display: 'flex',
            gap: '10px',
            padding: "5px"
        },
        inputField: {
            backgroundColor: state.colorBackground,
            color: state.colorText,
            borderRadius: "5px",
            height: "30px",
            fontSize: textSizes.body,
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

    const handleSendMessage = async (customInput) => {
        const messageToSend = customInput || inputValue;

        if (messageToSend.trim() === '') return;

    // Check if the message is about feedback
    const feedbackKeywords = ['feedback', 'comment', 'suggestion', 'recommendation'];
    //const isFeedback = feedbackKeywords.some(keyword => inputValue.toLowerCase().includes(keyword));

    setMessages([...messages, { type: 'user', content: messageToSend }]);
    try {
        const promptText = `The following is a conversation with a song helper assistant.The webiste the assistant is running on is called PULSE. The website has 5 main sections: the dashboard, the statistics page, the games page, a DJ mixer page and the uploader page. The games futher divided into: Guess the song, Guess the artist, Guess who listens to the song, guess the next lyric and heads up. You can change the dark/light mode and text size in the profile under the setting section. Given partial lyrics ALWAYS send a link to the full lyrics as url. When asked for songs based on any criteria each song name with be in its oen seperate pair of quotes. \n\nHuman: ${messageToSend}\nAI: `;
        
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
            // setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "Could you please tell me more about your thoughts?" }]);
        } else if (awaitingFeedback) {
            // Overwrite the existing feedback with the new message
            setFeedback(inputValue);
            // Reset the awaitingFeedback state
            setAwaitingFeedback(false);
            // Send a thank you message to the user
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: "Thank you for your feedback! It has been forwarded to our team."}]);
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
    
        if (!customInput) {
            setInputValue(''); // Clear the input only if it's not a custom input from a button
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };
   
    const handleButtonPrompt = (prompt) => {
        handleSendMessage(prompt);
         setInputValue('');
    };

    return (
        <div style={styles.container}>
            <Navbar/>
            <h2 style={styles.title}>PULSE Bot</h2>
            <div style={styles.chatWindow}>
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        style={message.type === 'user' ? styles.userMessage : styles.botMessage}>
                        {message.content}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button style={styles.linkStyle} onClick={() => handleButtonPrompt("List some popular songs")}>Popular Songs</button>
                <button style={styles.linkStyle} onClick={() => handleButtonPrompt("List some newly released songs")}>New Releases</button>
                <button style={styles.linkStyle} onClick={() => handleButtonPrompt("List songs for for working out")}>Workout Playlist</button>
                <button style={styles.linkStyle} onClick={() => handleButtonPrompt("List some Taylor Swift songs")}>Taylor Swift Playlist</button>
                <button style={styles.linkStyle} onClick={() => handleButtonPrompt("How do I change the text size and/or theme of my PULSE app?")}>Custom themes</button>
            </div>
            <div style={{padding:5}}/>
            <div style={styles.chatInputContainer}>
                <input style={styles.inputField} value={inputValue} onChange={handleInputChange} onKeyPress={handleKeyPress}  />
                <button style={styles.sendButton} onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatBot;