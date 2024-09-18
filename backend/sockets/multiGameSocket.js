
const MultiGame = require('../models/game/multiGame');
const Player = require('../models/player');

module.exports = (io) => {
    const rooms = {};

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        let player = null;
        let game = null;

        socket.on('joinMultiGame', (data) => {
            const { playerName, requestedRoom } = data;
            console.log("joinMultiGame data: ", data);

            if (!rooms[requestedRoom]) {
                rooms[requestedRoom] = new MultiGame(requestedRoom);
                roomId = requestedRoom;
                console.log(`Room ${roomId} created.`);
            }

            game = rooms[requestedRoom];
            player = new Player(socket.id, playerName);

            if (game.owner === null) {
                game.addOwner(player);
                socket.emit('isOwner', true);
            }
            if (game.owner !== null && player.id !== game.owner.id && game.opponent === null) {
                game.addOpponent(player);
                socket.emit('ownerIsHere', game.owner.name);
                io.to(game.owner.id).emit('opponentJoined', game.opponent.name);
            }
            if (game.owner?.id !== player.id && game.opponent?.id !== player.id) {
                socket.emit('roomFull', true);
                console.log('room is full');
                console.log('owner id : ', game.owner.id);
                console.log('opponent id : ', game.opponent.id);
                return ;
            }

            io.to(socket.id).emit('init', { grid: player.grid });

            socket.join(roomId);

            if (game.owner !== null && game.opponent !== null) {
                io.to(game.opponent.id).emit('GameReady');
                io.to(game.owner.id).emit('GameReady');
            }

            socket.on('gameStart', () => {
                    console.log('game started');
                    game.distributePieces();
                    game.startGameLoop(io, player);
            });

            socket.on('movePiece', (direction) => {
                if (player && player.isPlaying) {

                    let isGameOver = player.movePiece(direction);

                    console.log("piece moved by : ", player.id);

                    if (player.id === game.owner.id) {
                        io.to(game.opponent.id).emit('opponentUpdateGrid', { grid: game.owner.grid });
                        io.to(game.owner.id).emit('updateGrid', { grid: game.owner.grid });
                    }
                    if (player.id === game.opponent.id) {
                        io.to(game.owner.id).emit('opponentUpdateGrid', { grid: game.opponent.grid });
                        io.to(game.opponent.id).emit('updateGrid', { grid: game.opponent.grid });
                    }

                    io.to(player.id).emit('nextPiece', { nextPiece: player.nextPieces[0].shape });

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
