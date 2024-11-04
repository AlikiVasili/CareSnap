const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For making HTTP requests
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// File paths for logs and feedback
const logFilePath = path.join(__dirname, 'docs', 'conversation_logs.txt');

// Chat endpoint that calls the Python prediction API
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    
    try {
        // Send message to Python model server for intent prediction
        const response = await axios.post('http://localhost:5000/predict', { message: userMessage });
        const intents = response.data;

        // Initialize an empty response message
        let responseMessage = "";

        // Loop through each detected intent and create a corresponding response
        intents.forEach(intent => {
            if (intent === 'hello') {
                responseMessage += "Hello! How can I assist you today?\n";
            } else if (intent === 'allergies') {
                responseMessage += "I can help you check allergies. Please provide more details if necessary.\n";
            } else if (intent === 'surgery') {
                responseMessage += "Let's discuss your surgery history. Do you need assistance with recent surgeries?\n";
            } else {
                responseMessage += `Processing your request related to ${intent}.\n`;
            }
        });
        
        // Send the response back to the client
        res.json({ response: responseMessage });

    } catch (error) {
        console.error('Error calling Python model API:', error);
        res.status(500).send('Error processing request.');
    }
});

// Helper function for logging conversation
function logConversation(userInput, intent) {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const logEntry = `${timestamp} - User: ${userInput}\t Intent: ${intent}\n`;
    
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Error logging conversation:', err);
    });
}

// Start Express server
app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
});
