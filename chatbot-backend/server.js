const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For making HTTP requests
const app = express();
const port = 3000;
const { exec } = require('child_process');

const allergyCategoryKeywords = {
    drug: ["drug", "drugs"],
    food: ["food", "foods"],
    substance: ["substance", "substances"]
};

app.use(cors());
app.use(express.json());

// Chat endpoint that calls the Python prediction API
app.post('/chat', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const userMessage = req.body.message;
    
    try {
        // Send message to Python model server for intent prediction
        const response = await axios.post('http://localhost:5000/predict', { message: userMessage });
        const intents = response.data;

        let responseMessage = ""; // Initialize response message

        // Use Promise.all to handle async intent responses
        // Process each intent and wait for all results
        const intentPromises = intents.map(intent => {
            return new Promise((resolve) => {
                if (intent === 'hello') {
                    resolve("Hello! How can I assist you today?");
                } else if (intent === 'other') {
                    resolve("I do not have such information! I can answer any question related to your personal medical history.<br>In medical history documents, you can find information about allergies, vaccination, surgeries, medical devices, implants, current problems, and past illnesses. You can also see your prescriptions.<br>");
                } else if (intent === 'exit') {
                    resolve("I hope that I was helpful! Bye bye!");
                } else if (intent === 'info') {
                    resolve("I can answer any question related to your personal medical history. In medical history documents, you can find information about allergies, vaccination, surgeries, medical devices, implants, current problems, and past illnesses. You can also see your prescriptions.");
                } else if (intent === 'allergies') {
                    // Handle allergies intent with a Python script call
                    runPythonScript("get_allergies.py").then(stdout => {
                        let responseMessage = "You have the following allergies:<br>";
                        let intolerancesResponse = "<br>You have the following intolerances:<br>";
                        let allergyCount = 1;
                        let intoleranceCount = 1;

                        try {
                            const cleanedOutput = stdout
                                .replace(/'/g, '"')  // Replace single quotes with double quotes
                                .replace(/\bNone\b/g, 'null') // Replace `None` with `null`
                                .trim();
                            
                            const allergies = JSON.parse(cleanedOutput);

                            // Construct the allergy and intolerance lists
                            allergies.forEach(entry => {
                                if (entry.type === "allergy") {
                                    const reaction = entry.reaction === "No Reaction" ? "" : `, Reaction: ${entry.reaction}`;
                                    responseMessage += `${allergyCount}. ${entry.type_description} in ${entry.agent}${reaction} (Clinical status: ${entry.clinical_status})<br>`;
                                    allergyCount++;
                                } else if (entry.type === "intolerance") {
                                    const reaction = entry.reaction === "No Reaction" ? "" : `, Reaction: ${entry.reaction}`;
                                    intolerancesResponse += `${intoleranceCount}. ${entry.type_description} in ${entry.agent}${reaction} (Clinical status: ${entry.clinical_status})<br>`;
                                    intoleranceCount++;
                                }
                            });

                            // Append results to the response message
                            resolve(responseMessage + "<br>" + intolerancesResponse);
                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing allergy data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                } else if (intent === 'surgery') {
                    // Example response for 'surgery' intent
                    resolve("Here's your surgery history and details.<br>");
                } else {
                    resolve(`Processing your request related to ${intent}.<br>`);
                }
            });
        });

        // Wait for all intent promises to complete
        Promise.all(intentPromises).then(responses => {
            // Combine all responses into one string
            const combinedResponse = responses.join("<br>");
            // Send the combined response back to the client
            res.json({combinedResponse});
        }).catch(error => {
            console.error("Error processing intents:", error);
            res.json("An error occurred while processing your request.");
        });


    } catch (error) {
        console.error('Error calling Python model API:', error);
        res.status(500).send('Error processing request.');
    }
});

// Function to run the Python script and return a Promise
function runPythonScript(fileName) {
    return new Promise((resolve, reject) => {
        exec('python patient_summary_scripts/'+fileName, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}

function findAllergyCategory(userInput, categoryKeywords) {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (userInput.toLowerCase().includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }
    return null; // No specific category found
}

// Start Express server
app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
});
