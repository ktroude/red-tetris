//SoloGameSocket.js

const SoloGame = require('../models/game/soloGame');
const Player = require('../models/player');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        
        let player = null;
        let game = null;

        socket.on('joinSoloGame', (data) => {
            const { playerName } = data;
            console.log(`${playerName} joined solo game`);

            player = new Player(socket.id, playerName);
            game = new SoloGame(player);

            // Generate first piece for the player
            player.generateNewPiece();

            // Send initial grid to the player
            io.to(socket.id).emit('init', { grid: player.grid });

            socket.emit('nextPiece', { nextPiece: player.nextPieces[0].shape });

            // Start game loop if it's not already running
            if (!game.isRunning) {
                game.startGameLoop(io, socket);
            }
        });

        socket.on('movePiece', (direction) => {
            if (player && player.isPlaying) {

                let isGameOver = player.movePiece(direction);
                // Send updated grid to the player
                io.to(socket.id).emit('updateGrid', { grid: player.grid });

                socket.emit('nextPiece', { nextPiece: player.nextPieces[0].shape });

                if (isGameOver) {
                    game.endGame(io, socket);
                }
            } else {
                game.endGame(io, socket);
            }
        });
        

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
