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
                } else if (intent === 'feeling'){
                    resolve("I am perfect! Hope you are too!");
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
                    // Handle surgeries intent with a Python script call
                    runPythonScript("get_procedures.py").then(stdout => {
                        let responseMessage = "You have done the following procedures:<br><br>";
                        let procedureCount = 1;

                        try {
                            // Clean the script output
                            const cleanedOutput = stdout
                                .replace(/'/g, '"')  // Replace single quotes with double quotes
                                .replace(/\bNone\b/g, 'null')  // Replace `None` with `null`
                                .trim();

                            const procedures = JSON.parse(cleanedOutput);  // Parse JSON output

                            // Construct the response message for each procedure
                            procedures.forEach(entry => {
                                const description = entry.description || "Description unavailable";
                                const date = entry.date || "Date unavailable";
                                const time = entry.time || "Time unavailable";

                                // Start building the procedure message
                                responseMessage += `${procedureCount}. ${description} - `;

                                // Add focal devices, if any
                                if (entry.focal_devices_list && entry.focal_devices_list.length > 0) {
                                    responseMessage += entry.focal_devices_list.map(device => device.device_description).join(", ");
                                }

                                responseMessage += `<br> Date and time: ${date}, ${time}<br><br>`;
                                procedureCount++;
                            });

                            // Return the response message
                            resolve(responseMessage);

                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing procedure data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                } else if (intent === 'vaccination'){
                    // Handle vaccinations intent with a Python script call
                    runPythonScript("get_vaccines.py").then(stdout => {
                        let responseMessage = "You have received the following vaccinations:<br>";
                        let vaccineCount = 1;

                        try {
                            // Clean the script output
                            const cleanedOutput = stdout
                                .replace(/'/g, '"')  // Replace single quotes with double quotes
                                .replace(/\bNone\b/g, 'null')  // Replace `None` with `null`
                                .trim();

                            const vaccines = JSON.parse(cleanedOutput);  // Parse JSON output

                            // Construct the response message for each vaccine
                            vaccines.forEach(entry => {
                                const vaccine = entry.vaccine || "Vaccine name unavailable";
                                const date = entry.date || "Date unavailable";
                                const time = entry.time || "Time unavailable";
                                const targetDisease = entry.target_disease || null;

                                // Build each vaccine message
                                responseMessage += `${vaccineCount}. ${vaccine} <br> Date and time: ${date}, ${time}`;
                                
                                // Include target disease if available
                                if (targetDisease) {
                                    responseMessage += ` <br>Target Disease: ${targetDisease}`;
                                }

                                responseMessage += "<br><br>";  // Line break for each entry
                                vaccineCount++;
                            });

                            // Return the response message
                            resolve(responseMessage);

                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing vaccination data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                }else if (intent === 'intolerances') {
                    // Handle intolerances intent with a Python script call
                    runPythonScript("get_allergies.py").then(stdout => {
                        let responseMessage = "You have the following intolerances:<br>";
                        let intoleranceCount = 1;
                
                        try {
                            // Clean the script output
                            const cleanedOutput = stdout
                                .replace(/'/g, '"')  // Replace single quotes with double quotes
                                .replace(/\bNone\b/g, 'null')  // Replace `None` with `null`
                                .trim();
                
                            const allergies = JSON.parse(cleanedOutput);  // Parse JSON output
                
                            // Construct the response message for each intolerance
                            allergies.forEach(entry => {
                                if (entry.type === "intolerance") {
                                    const typeDescription = entry.type_description || "Description unavailable";
                                    const agent = entry.agent || "Agent unknown";
                                    const clinicalStatus = entry.clinical_status || "Status unavailable";
                                    const reaction = entry.reaction === "No Reaction" ? "" : `, Reaction: ${entry.reaction}`;
                
                                    // Build each intolerance message
                                    responseMessage += `${intoleranceCount}. ${typeDescription} in ${agent}${reaction} (Clinical status: ${clinicalStatus})<br>`;
                                    intoleranceCount++;
                                }
                            });
                
                            // Return the response message
                            resolve(responseMessage);
                
                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing intolerance data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                }else if (intent === 'current_problems') {
                    runPythonScript("get_problems_list.py").then(stdout => {
                        let responseMessage = "You have the following problems:<br>";
                        let problemCount = 1;

                        console.log("Raw script output:", stdout); // Log stdout to inspect its output
                
                        try {
                            // Clean the script output
                            const cleanedOutput = stdout
                                .replace(/'/g, '"')  // Replace single quotes with double quotes
                                .replace(/\bNone\b/g, 'null')  // Replace `None` with `null`
                                .trim();
                            const problems = JSON.parse(cleanedOutput);
                
                            problems.forEach(entry => {
                                const description = entry.description || "Description unavailable";
                                const severity = entry.severity || "Severity unknown";
                                const clinicalStatus = entry.clinical_status || "Status unavailable";
                
                                responseMessage += `${problemCount}. ${description}, Severity: ${severity}, (Status: ${clinicalStatus})<br>`;
                                problemCount++;
                            });
                
                            resolve(responseMessage);
                
                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing current problems data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                }else if (intent === 'illness_history') {
                    runPythonScript("get_history_of_illness.py").then(stdout => {
                        let responseMessage = "Your history of illness is:<br>";
                        let illnessCount = 1;
                
                        try {
                            const cleanedOutput = stdout.replace(/'/g, '"').replace(/\bNone\b/g, 'null').trim();
                            const illnessHistory = JSON.parse(cleanedOutput);
                
                            illnessHistory.forEach(entry => {
                                const description = entry.description || "Description unavailable";
                                const severity = entry.severity || "Severity unknown";
                                const onsetDate = entry.onset_date || "Start date unavailable";
                                const onsetTime = entry.onset_time || "Start time unavailable";
                                const endDate = entry.end_date || "End date unavailable";
                                const endTime = entry.end_time || "End time unavailable";
                                const clinicalStatus = entry.clinical_status || "Status unavailable";
                
                                responseMessage += `${illnessCount}. ${description}, Severity: ${severity}, Period: ${onsetDate} (${onsetTime}) - ${endDate} (${endTime}), (Status: ${clinicalStatus})<br>`;
                                illnessCount++;
                            });
                
                            resolve(responseMessage);
                
                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing illness history data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                }else if (intent === 'implants') {
                    runPythonScript("get_procedures.py").then(stdout => {
                        let responseMessage = "You have the following implants:<br>";
                        let implantCount = 1;
                
                        try {
                            const cleanedOutput = stdout.replace(/'/g, '"').replace(/\bNone\b/g, 'null').trim();
                            const procedures = JSON.parse(cleanedOutput);
                
                            const implants = procedures.filter(entry =>
                                entry.focal_devices_list && entry.focal_devices_list.some(focalDevice =>
                                    /implant|implantable/i.test(focalDevice.device_description)
                                )
                            );
                
                            if (implants.length > 0) {
                                implants.forEach(entry => {
                                    const surgeryDescription = entry.description || "Surgery description unavailable";
                                    const date = entry.date || "Date unavailable";
                                    const time = entry.time || "Time unavailable";
                                    const clinicalStatus = entry.clinical_status || "Status unavailable";
                
                                    responseMessage += `${implantCount}. Implants used during surgery: `;
                                    entry.focal_devices_list.forEach(device => {
                                        responseMessage += `${device.device_description}, `;
                                    });
                                    responseMessage += `Surgery: ${surgeryDescription}, Date/Time: ${date}, ${time}<br>`;
                                    implantCount++;
                                });
                            } else {
                                responseMessage = "You do not have any implants!";
                            }
                
                            resolve(responseMessage);
                
                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing implants data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                }else if (intent === 'prescription') {
                    runPythonScript("get_medication.py").then(stdout => {
                        let responseMessage = "You have the following prescriptions for medication:<br>";
                        let medicationCount = 1;
                
                        try {
                            const cleanedOutput = stdout.replace(/'/g, '"').replace(/\bNone\b/g, 'null').trim();
                            const medications = JSON.parse(cleanedOutput);
                
                            medications.forEach(entry => {
                                const productName = entry.product_name || "Product name unavailable";
                                const packageSizeUnit = entry.product_packageSizeUnit || "Unit unavailable";
                                const description = entry.product_description || "Description unavailable";
                                const generalInstructions = entry.general_instructions || "General instructions unavailable";
                                const patientInstructions = entry.patient_instructions || "Patient instructions unavailable";
                                const durationValue = entry.bounds_duration_value || "Duration value unavailable";
                                const durationUnit = entry.bounds_duration_unit || "Duration unit unavailable";
                                const period = entry.period || "Period unavailable";
                                const periodUnit = entry.period_unit || "Period unit unavailable";
                                const route = entry.route || "Route of administration unavailable";
                
                                responseMessage += `${medicationCount}. ${productName}, ${packageSizeUnit}, ${description}<br>`;
                                responseMessage += `&nbsp;&nbsp;General Instructions: ${generalInstructions}, Patient Instructions: ${patientInstructions}<br>`;
                                responseMessage += `&nbsp;&nbsp;Duration: ${durationValue} per ${durationUnit} for ${period} ${periodUnit}<br>`;
                                responseMessage += `&nbsp;&nbsp;Route: ${route}<br><br>`;
                                medicationCount++;
                            });
                
                            resolve(responseMessage);
                
                        } catch (parseError) {
                            console.error("Parse error:", parseError);
                            resolve("Error processing prescription data.");
                        }
                    }).catch(stderr => {
                        console.error("Error occurred while running the script:", stderr);
                        resolve("Error occurred while running the script.");
                    });
                }else {
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
