# Step 1: Build the Angular frontend
FROM node:16 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Step 2: Set up Python environment for the backend
FROM python:3.9 AS backend
WORKDIR /app
COPY chatbot-backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY chatbot-backend /app/chatbot-backend

# Step 3: Set up Node.js for backend server
FROM node:16 AS backend-server
WORKDIR /app
COPY chatbot-backend/package*.json ./
RUN npm install
COPY chatbot-backend /app/chatbot-backend

# Step 4: Create the final image using Nginx
FROM nginx:alpine
COPY --from=frontend-build /app/dist/<your-angular-project> /usr/share/nginx/html
COPY --from=backend /app/chatbot-backend /usr/share/backend
COPY --from=backend-server /app/chatbot-backend /usr/share/backend

# Expose port for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
