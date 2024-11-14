// MultiGameSocket.js

const MultiGame = require('../models/game/multiGame');
const Player = require('../models/player');
const GravityGame = require('../models/game/GravityGame');
const InvisibleGame = require('../models/game/InvisibleGame');
/**
 * Manages WebSocket connections for the multiplayer mode of the Tetris game using Socket.IO.
 * This module handles player connections, room creation, game start, and in-game events such as player moves.
 * 
 * @param {Object} io - The Socket.IO server instance.
 */
module.exports = (io) => {
    // Store all game rooms by room ID
    const rooms = {
        CLASSIC: {},
        GRAVITY: {},
        INVISIBLE: {}
    };

    /**
     * Event triggered when a new client connects.
     * @param {Object} socket - The client's WebSocket connection.
     */
    io.on('connection', (socket) => {
        console.log('New client connected in Multi:', socket.id);

        let player = null; // The player instance for the connected socket
        let game = null;   // The multiplayer game instance for the player

        /**
         * Event triggered when a player joins a multiplayer game.
         * If the requested room does not exist, a new room is created.
         * If the player is the first in the room, they become the owner.
         * If the room already has an owner, the new player becomes the opponent if no opponent exists.
         * 
         * @param {Object} data - Contains the player's name and the requested room ID.
         * @param {string} data.playerName - The name of the player joining the game.
         * @param {string} data.requestedRoom - The ID of the room the player wants to join.
         */
        socket.on('joinMultiGame', (data) => {
            const { playerName, requestedRoom, gamemode } = data;
            console.log('joinMultiGame data: ', data);

            if (!rooms[gamemode][requestedRoom]) {
                if (gamemode === "CLASSIC") {
                    rooms[gamemode][requestedRoom] = new MultiGame(requestedRoom);
                } else if (gamemode === "GRAVITY") {
                    rooms[gamemode][requestedRoom] = new GravityGame(requestedRoom);
                }
                else if (gamemode === "INVISIBLE") {
                    rooms[gamemode][requestedRoom] = new InvisibleGame(requestedRoom);
                }
                console.log(`Room ${requestedRoom} created for game mode ${gamemode}.`);
            }
        
            game = rooms[gamemode][requestedRoom];
            
            player = new Player(socket.id, playerName, true);

            // Assign the player as the room owner if no owner exists
            if (game.owner === null) {
                game.addOwner(player);
                socket.emit('isOwner', true);
            }
            
            // If an owner exists, assign the player as the opponent
            if (game.owner !== null && player.id !== game.owner?.id && game.opponent === null) {
                game.addOpponent(player);
                socket.emit('ownerIsHere', game.owner.name);
                io.to(game.owner.id).emit('opponentJoined', game.opponent.name);
            }

            // Notify the player if the room is full
            if (game.owner?.id !== player.id && game.opponent?.id !== player.id) {
                socket.emit('roomFull', true);
                console.log('Room is full');
                return;
            }

            // Initialize the player's grid
            io.to(socket.id).emit('init', { grid: player.grid });

            // Join the player to the room
            socket.join(requestedRoom);

            // Notify both players when the game is ready
            socket.on('launchGame', () => {
                if (game.owner !== null && game.opponent !== null) {

                game.distributePieces();
                    
                game.startGameLoop(io);
                    try {
                        io.to(game.opponent.id).emit('restart');
                        io.to(game.owner.id).emit('restart');
                    if (player.nextPieces.length > 0)
                            io.to(game.opponent.id).emit('nextPiece', { nextPiece: game.opponent.nextPieces[0].shape });
                        io.to(game.owner.id).emit('nextPiece', { nextPiece: game.owner.nextPieces[0].shape });
                } catch (e) {
                        console.error('Error sending next piece:', e);
                    }
                }
            });



            /**
             * Event triggered when a player moves a piece.
             * It updates the game state and grids for both the owner and opponent.
             * Also checks for game over conditions.
             * 
             * @param {string} direction - The direction in which the player wants to move the piece (left, right, down, etc.).
             */
            socket.on('movePiece', (direction) => {
                if (!game.isRunning) {
                    return;
                }
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
                let linesCleared = result.linesCleared;

                // Update the grids of both players
                if (player.id === game.owner.id) {
                    if (linesCleared > 1) {
                        console.log('1111111  OWNER CLEARED ' + linesCleared + ' lines')
                        game.freezeLinesGrid(linesCleared - 1, game.opponent.grid);
                        io.to(game.opponent.id).emit('updateGrid', { grid: game.opponent.grid });
                    }

                    if (game instanceof InvisibleGame && result.reachBottom)
                        io.to(game.owner.id).emit('updateGrid', { grid: game.owner.grid });
                    else if (game instanceof InvisibleGame === false) {
                        io.to(game.owner.id).emit('updateGrid', { grid: game.owner.grid });
                    }
                    io.to(game.opponent.id).emit('opponentUpdateGrid', { grid: game.owner.getSpectra() });
                }

                if (player.id === game.opponent.id) {
                    if (linesCleared > 1) {
                        game.freezeLinesGrid(linesCleared - 1, game.owner.grid);
                        io.to(game.owner.id).emit('updateGrid', { grid: game.owner.grid });
                    }

                    if (game instanceof InvisibleGame && result.reachBottom)
                        io.to(game.opponent.id).emit('updateGrid', { grid: game.opponent.grid });
                    else if (game instanceof InvisibleGame === false) {
                        io.to(game.opponent.id).emit('updateGrid', { grid: game.opponent.grid });
                    }
                    io.to(game.owner.id).emit('opponentUpdateGrid', { grid: game.opponent.getSpectra() });
                }

                    // Send the next piece to the current player
                    if (player.nextPieces.length > 0)
                        io.to(player.id).emit('nextPiece', { nextPiece: player.nextPieces[0].shape });

                // Handle game over and win conditions
                if (game.isRunning && isGameOver && player.id === game.owner.id) {
                    game.clearInterval();
                    game.isRunning = false;
                    io.to(game.owner.id).emit('gameOver', { message: 'Game Over :(' });
                    io.to(game.opponent.id).emit('win', { message: 'You win!' });
                } else if (game.isRunning && isGameOver && player.id === game.opponent.id) {
                    game.clearInterval();
                    game.isRunning = false;
                    io.to(game.opponent.id).emit('gameOver', { message: 'Game Over :(' });
                    io.to(game.owner.id).emit('win', { message: 'You win!' });
                }
        });

            /**
             * Event triggered when a client disconnects from the server.
             * If the disconnected player is the opponent, they are removed from the game.
             * If the owner disconnects, the room is closed, and both players are removed.
             */
            socket.on('disconnect', () => {
                if (player.id === game?.opponent?.id) {
                    console.log('game is runnig before: ', game.isRunning);
                    game.removeOpponent();
                    if (game.isRunning) {
                        io.to(game.owner.id).emit('win', { message: 'You win!' });
                        console.log(`Opponent ${socket.id} disconnected from room ${requestedRoom}`);
                        game.clearInterval()
                        game.isRunning = false;
                    }
                    io.to(game.owner.id).emit('opponentJoined', null);
                }
                if (game.owner && player.id === game.owner.id) {
                    if (game.opponent) {
                        if (game.isRunning ) {
                            io.to(game.opponent.id).emit('win', { message: 'You win!' });
                            game.isRunning = false;
                        }
                        game.removeOpponent();
                    }
                    game.removeOwner();
                    rooms[requestedRoom] = null;
                    console.log(`Owner ${socket.id} disconnected and room ${requestedRoom} is closed.`);
                }
                console.log(`Client disconnected: ${socket.id}`);
                console.log('game is runnig after: ', game.isRunning);
            });
    });
});
};
