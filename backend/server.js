// // server.js

// const express = require('express');
// const http = require('http');
// const StorageProvider = require("./models/storage/StorageProvider.js")



// const socketIo = require('socket.io');
// const soloGameSocket = require('./sockets/soloGameSocket');
// const multiGameSocket = require('./sockets/multiGameSocket');

// const app = express();
// const cors = require('cors');
// app.use(cors());
// app.use(express.json());
// const server = http.createServer(app);

// const io = socketIo(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// app.post('history', (req, res) => {
//     console.log(req);
//     new StorageProvider().getGamesByUsername()
// })

// soloGameSocket(io);
// multiGameSocket(io);

// const PORT = process.env.PORT || 5555;
// const ADRESSE = process.env.ADRESSE || "0.0.0.0";

// server.listen(PORT, ADRESSE, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const soloGameSocket = require('./sockets/soloGameSocket');
const multiGameSocket = require('./sockets/multiGameSocket');
const StorageProvider = require("./models/storage/StorageProvider.js")

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


// Exemple de route POST
app.post('/history', (req, res) => {
    console.log(req.body);
    const { username } = req.body;

    const games = new StorageProvider().getGamesByUsername(username);

    res.status(201).json(games);
});

// Initialise les sockets
soloGameSocket(io);
multiGameSocket(io);

const PORT = process.env.PORT || 5555;
const ADRESSE = process.env.ADRESSE || "0.0.0.0";

server.listen(PORT, ADRESSE, () => {
    console.log(`Server is running on port ${PORT}`);
});
