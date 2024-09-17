# Red Tetris: An Online Multiplayer Tetris Game

## Overview

Red Tetris is an online multiplayer Tetris game built from scratch. This project aims to create an engaging and competitive Tetris experience over the network. Key features of the game include:

- **Multiplayer Gameplay:** Play Tetris with friends or other players online.
- **Real-Time Communication:** Use Socket.io for real-time updates and interactions.
- **Unit Tests:** Implement unit tests to ensure code reliability and functionality.
- **Responsive Design:** Enjoy a seamless experience on various devices with a responsive UI.

## Frameworks and Technologies

- **Backend:** Express (Node.js)
- **Frontend:** React
- **Real-Time Communication:** Socket.io
- **Containerization:** Docker
- **Testing:** Unit tests using relevant frameworks/libraries

## Key Concepts

- **REST API Mechanisms:** Develop RESTful APIs for server-client communication.
- **Socket.io Integration:** Real-time communication for game updates and player interactions.
- **User Management:** Handling user sessions, authentication, and profiles.
- **CSS Animations:** Enhance the user interface with CSS animations.
- **UE/UX Design:** Design an intuitive and enjoyable user experience.
- **Dockerization:** Containerize the application for consistent and isolated environments.
- **Unit Testing:** Write and maintain unit tests to ensure the stability of the codebase.

## Project Structure

### Backend

- **Express Server:** Handles API requests, user authentication, and game logic.
- **Socket.io:** Manages real-time communication between clients and server.

### Frontend

- **React:** Manages the user interface and game rendering.
- **Socket.io Client:** Connects to the server for real-time game updates.
- **Responsive Design:** Ensures compatibility across different devices.

### Testing

- **Unit Tests:** Ensure the functionality of individual components and modules.

### Docker

- **Docker Setup:** Containerize the application for consistent and isolated environments.

## Installation and Setup

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd red-tetris
   docker compose up --build
