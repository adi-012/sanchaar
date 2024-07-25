# Sanchaar

Sanchaar is a messaging and video calling web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It supports live messaging through WebSockets and video calls using WebRTC. The application also includes authentication with Passport.js

## Features

- Real-time messaging
- Video calls
- User authentication (Session-based with Passport.js and Google OAuth2)

## Prerequisites

- Node and npm

## Setup

1. **Clone the repository**

   ```sh
   git clone https://github.com/yourusername/sanchaar.git
   cd sanchaar

2. **Setup MongoDB and env variables**
Set up a MongoDB database either locally or in the cloud (e.g., MongoDB Atlas). Obtain the connection URL.   
Create a .env file in the backend directory and add your MongoDB URL.   
Also add env variables for your Google Client ID and Client Secret for Google OAuth.


4. **Install node modules**
  ```sh
  cd backend
  npm install
  ```
  ```sh
  cd frontend
  npm install
  ```
4. **Running the application**
  ```sh
  cd backend
  node index.js

  cd ../frontend
  npm run dev
  ```
  The app will be running on http://localhost:5173 by default.
