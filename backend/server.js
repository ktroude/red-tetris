// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const soloGameSocket = require('./sockets/soloGameSocket');
const multiGameSocket = require('./sockets/multiGameSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

soloGameSocket(io);
multiGameSocket(io);

const PORT = process.env.PORT || 3000;
const ADRESSE = process.env.ADRESSE || "localhost";

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
