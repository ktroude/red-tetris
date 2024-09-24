const SoloGame = require('../models/game/soloGame');
const Player = require('../models/player');

/**
 * Manages WebSocket connections for the solo mode of the Tetris game using Socket.IO.
 * This module manages player connections, solo game initialization, and in-game events such as piece movement.
 * 
 * @param {Object} io - The Socket.IO server instance.
 */
module.exports = (io) => {
    /**
     * Event triggered when a new client connects.
     * @param {Object} socket - The client's WebSocket connection.
     */
    io.on('connection', (socket) => {
        console.log('New client connected in Solo: ', socket.id);

        let player = null; // The player instance for the connected socket
        let game = null;   // The solo game instance for the player

        /**
         * Event triggered when a player joins a solo game.
         * Initializes a new player and solo game instance, generates the first piece,
         * and starts the game loop if needed.
         * 
         * @param {Object} data - Contains the player's name.
         * @param {string} data.playerName - The name of the player joining the solo game.
         */
        socket.on('joinSoloGame', (data) => {
            const { playerName } = data;
            console.log(`${playerName} joined solo game`);

            // Create new player and solo game instance
            player = new Player(socket.id, playerName);
            game = new SoloGame(player);

            // Generate and send the first piece to the player
            player.generateNewPiece();
            io.to(socket.id).emit('initSolo', { grid: player.grid });

            // Send the next piece to the player
            socket.emit('nextPieceSolo', { nextPiece: player.nextPieces[0].shape });

            // Start the game loop if it's not running
            if (!game.isRunning) {
                game.startGameLoop(io, socket);
                io.to(socket.id).emit('scoreSolo', { score: player.score });
            }
        });

        /**
         * Event triggered when the player moves a piece.
         * Updates the player's grid, checks for game over, and sends the updated grid
         * and next piece to the player.
         * 
         * @param {string} direction - The direction in which the player wants to move the piece (left, right, down, etc.).
         */
        socket.on('movePieceSolo', (direction) => {
            if (player && player.isPlaying) {

                // Prevent piece overflow on the right side
                if (direction === 'right' && (player.currentPiece.x + player.currentPiece.getMatrix()[0].length > 9)) {
                    return;
                }
                // Prevent piece overflow on the left side
                if (direction === 'left' && (player.currentPiece.x === 0)) {
                    return;
                }

                let result = player.movePiece(direction);
                let isGameOver = result.gameover;

                // Send updated grid to the player
                io.to(socket.id).emit('updateGridSolo', { grid: player.grid });

                // Send the next piece to the player
                socket.emit('nextPieceSolo', { nextPiece: player.nextPieces[0].shape });

                // End the game if the player loses
                if (isGameOver) {
                    game.endGame(io, socket);
                }
            } else {
                // Handle case where the game is over
                io.to(socket.id).emit('gameOverSolo', { message: 'Game Over' });
                game.endGame(io, socket);
            }
            // Update and send the player's score
            io.to(socket.id).emit('scoreSolo', { score: player.score });
        });

        /**
         * Event triggered when a client disconnects from the server.
         * Logs the disconnect event for monitoring purposes.
         */
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
