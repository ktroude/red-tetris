// server.js

const express = require('express');
const http = require('http');



const socketIo = require('socket.io');
const soloGameSocket = require('./sockets/soloGameSocket');
const multiGameSocket = require('./sockets/multiGameSocket');

const app = express();
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

soloGameSocket(io);
multiGameSocket(io);

const PORT = process.env.PORT || 5555;
const ADRESSE = process.env.ADRESSE || "0.0.0.0";

server.listen(PORT, ADRESSE, () => {
    console.log(`Server is running on port ${PORT}`);
});
