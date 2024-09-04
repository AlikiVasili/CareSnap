const express = require('express');
const cors = require('cors'); // Optional for handling CORS issues
const app = express();
const port = 3000;

app.use(cors()); // Enable CORS if needed
app.use(express.json()); // Middleware to parse JSON bodies

app.post('/chat', (req, res) => {
    try {
        const userMessage = req.body.message;
        let responseMessage;

        if (userMessage.toLowerCase() === 'hello') {
            responseMessage = 'hello';
        } else {
            responseMessage = 'Answer';
        }

        res.json({ response: responseMessage });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
