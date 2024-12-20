# Step 1: Build the Angular frontend
FROM node:18 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Step 2: Set up Python environment for the backend
FROM python:3.10 AS backend
WORKDIR /app
# Copy the requirements file from the local chatbot-backend directory to the container
COPY chatbot-backend/requirements.txt /app/chatbot-backend/requirements.txt
# Upgrade pip
RUN pip install --upgrade pip
# Install PyTorch separately if needed
RUN pip install torch==2.3.0
# Install other dependencies
RUN pip install -r /app/chatbot-backend/requirements.txt
# Copy the rest of the chatbot-backend code
COPY chatbot-backend /app/chatbot-backend

# Step 3: Set up Node.js for backend server
FROM node:18 AS backend-server
WORKDIR /app
COPY chatbot-backend/package*.json ./
RUN npm install
COPY chatbot-backend /app/chatbot-backend

# Step 4: Create the final image using Nginx
FROM nginx:alpine
COPY --from=frontend-build /app /usr/share/nginx/html
COPY --from=backend /app/chatbot-backend /usr/share/backend
COPY --from=backend-server /app/chatbot-backend /usr/share/backend

# Expose port for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
