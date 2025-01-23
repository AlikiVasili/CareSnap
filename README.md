# CareSnap
CareSnap is an AI-powered assistant designed to guide users through the NCPeH (National Contact Point for eHealth) project and answer questions related to it. Additionally, it provides a login feature that allows users to access their Patient Summary (PS) and e-Prescription. Once logged in, the assistant can answer personalized medical queries based on the available information in your PS.

## 🌟 Features
- AI Assistant: Guides users through the NCPeH project and answers project-related questions.
- Personalized Medical Information: Access and query your Patient Summary and e-Prescription securely.
- Interactive and User-Friendly: Simple interface with powerful backend support.
## 🚀 Getting Started
### Frontend Setup
This project was generated with Angular CLI version 18.1.4.
- Clone the repository:
```bash
git clone https://github.com/username/CareSnap.git
cd CareSnap
```
- Install dependencies:
```bash
npm install
```
- Start the development server:
```bash
ng serve
```
Navigate to http://localhost:4200/ to view the application. The application will automatically reload if you make changes to the source files.

### Backend Setup
The backend services for CareSnap consist of two main components:
- server.js: The primary backend service that handles requests, routes, and integrations with the AI model and database.
- model_app.py: A Python-based service that performs intent classification for user queries using machine learning or NLP models.
#### Steps to Set Up the Backend
1) Navigate to the backend directory:
```bash
cd chatbot-backend
```
2) Install Python dependencies (for model_app.py):
```bash
pip install -r requirements.txt
```
3) Start model_app.py:
```bash
python model_app.py
```
This service listens for classification requests and responds with the detected intent.
4) Install Node.js dependencies (for server.js):
```bash
npm install
```
5) Start server.js:
```bash
node server.js
```
The backend server will be available at http://localhost:5000/.

## 🔍 How It Works
### Frontend:
The Angular-based frontend provides an interactive interface for users to:
- Learn about the NCPeh and MyHealth@EU project
- Login and authenticate securely.
- Interact with the AI assistant.
- View and query their Patient Summary.
- Get answers to questions related to the NCPeh and 
### Backend:
server.js:Acts as the central hub for handling API requests.Integrates with model_app.py for intent classification.Manages user authentication and data retrieval from the database or external APIs (e.g., NCPeH API).
model_app.py:Classifies the user's query into intents (e.g., "get patient summary," "ask about NCPeH").Uses a pre-trained machine learning or NLP model for accuracy.Sends the classified intent back to server.js for appropriate action.

## 📄 Further Help
- Angular CLI documentation: CLI Overview and Command Reference
- Flask documentation (if relevant for model_app.py): Flask Docs
- Node.js documentation (for server.js): Node.js Docs
## 🌍 Let’s Connect
Feel free to explore the code and reach out if you have any questions or feedback!
- 📫 Email: alikivasili@yourdomain.com
- 💼 LinkedIn: Aliki Vasili
- 📝 GitHub: github.com/alikivasili
