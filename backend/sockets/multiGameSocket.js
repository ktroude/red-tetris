
const MultiGame = require('../models/game/multiGame');
const Player = require('../models/player');

/**
 * Manages WebSocket connections for the multiplayer mode of the Tetris game using Socket.IO.
 * This module handles player connections, room creation, game start, and in-game events such as player moves.
 * 
 * @param {Object} io - The Socket.IO server instance.
 */
module.exports = (io) => {
    // Store all game rooms by room ID
    const rooms = {};

    /**
     * Event triggered when a new client connects.
     * @param {Object} socket - The client's WebSocket connection.
     */
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        let player = null;
        let game = null;

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
            const { playerName, requestedRoom } = data;
            console.log("joinMultiGame data: ", data);

            // Create room if it doesn't exist
            if (!rooms[requestedRoom]) {
                rooms[requestedRoom] = new MultiGame(requestedRoom);
                roomId = requestedRoom;
                console.log(`Room ${roomId} created.`);
            }

            game = rooms[requestedRoom];
            player = new Player(socket.id, playerName, true);

            // Assign the player as the room owner if no owner exists
            if (game.owner === null) {
                game.addOwner(player);
                socket.emit('isOwner', true);
            }
            
            // If an owner exists, assign the player as the opponent
            if (game.owner !== null && player.id !== game.owner.id && game.opponent === null) {
                game.addOpponent(player);
                socket.emit('ownerIsHere', game.owner.name);
                io.to(game.owner.id).emit('opponentJoined', game.opponent.name);
            }

            // Notify the player if the room is full
            if (game.owner?.id !== player.id && game.opponent?.id !== player.id) {
                socket.emit('roomFull', true);
                console.log('room is full');
                return ;
            }

            // Initialize the player's grid
            io.to(socket.id).emit('init', { grid: player.grid });

            // Join the player to the room
            socket.join(roomId);

            // Notify both players when the game is ready
            if (game.owner !== null && game.opponent !== null) {
                io.to(game.opponent.id).emit('GameReady');
                io.to(game.owner.id).emit('GameReady');
            }

            /**
             * Event triggered when the game starts.
             * This event distributes pieces to players and starts the game loop.
             */
            socket.on('gameStart', () => {
                console.log('game started');
                game.distributePieces();
                game.startGameLoop(io, player);
            });

            /**
             * Event triggered when a player moves a piece.
             * It updates the game state and grids for both the owner and opponent.
             * Also checks for game over conditions.
             * 
             * @param {string} direction - The direction in which the player wants to move the piece (left, right, down, etc.).
             */
            socket.on('movePiece', (direction) => {
                if (player && player.isPlaying) {
                    let isGameOver = player.movePiece(direction);
                    console.log("piece moved by : ", player.id);

                    // Update the grids of both players
                    if (player.id === game.owner.id) {
                        io.to(game.opponent.id).emit('opponentUpdateGrid', { grid: game.owner.grid });
                        io.to(game.owner.id).emit('updateGrid', { grid: game.owner.grid });
                    }
                    if (player.id === game.opponent.id) {
                        io.to(game.owner.id).emit('opponentUpdateGrid', { grid: game.opponent.grid });
                        io.to(game.opponent.id).emit('updateGrid', { grid: game.opponent.grid });
                    }

                    // Send the next piece to the current player
                    io.to(player.id).emit('nextPiece', { nextPiece: player.nextPieces[0].shape });

                    // Handle game over conditions
                    if (isGameOver && player.id === game.owner.id) {
                        io.to(game.owner.id).emit('gameOver', { message: 'Game Over :(' });
                        io.to(game.opponent.id).emit('win', { message: 'You win !' });
                    }
                    if (isGameOver && player === game.opponent) {
                        io.to(game.opponent.id).emit('gameOver', { message: 'Game Over :(' });
                        io.to(game.owner.id).emit('win', { message: 'You win !' });
                    }
                }
            });

            /**
             * Event triggered when a client disconnects from the server.
             * If the disconnected player is the opponent, they are removed from the game.
             * If the owner disconnects, the room is closed, and both players are removed.
             */
            socket.on('disconnect', () => {
                if (game.opponent && player.id === game.opponent.id) {
                    game.removeOpponent();
                    console.log(`Opponent ${socket.id} disconnected from room ${roomId}`);
                }
                if (game.owner && player.id === game.owner.id) {
                    game.removeOwner();
                    game.removeOpponent();
                    rooms[requestedRoom] = null;
                    console.log(`Owner ${socket.id} disconnected and room ${roomId} is closed.`);
                }
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    });
}
