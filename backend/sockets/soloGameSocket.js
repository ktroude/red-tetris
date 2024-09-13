
const SoloGame = require('../models/game/soloGame');
const Player = require('../models/player');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Player connected with ID: ${socket.id}`);

        socket.on('joinSoloGame', (data) => {
            const { playerName } = data;
            const player = new Player(socket.id, playerName);
            const game = new SoloGame();

            game.addPlayer(player);
            socket.emit('init', { playerId: player.id, playerName: player.name, grid: player.grid });

            socket.on('movePiece', (moveData) => {
                player.movePiece(moveData.direction);

                if (game.handleGameOver(player)) {
                    socket.emit('gameOver', { message: 'Game Over!' });
                } else {
                    socket.emit('updateGrid', { playerId: player.id, grid: player.grid });
                }
            });

            socket.on('disconnect', () => {
                console.log(`Player ${player.name} disconnected`);
                game.removePlayer(socket.id);
            });
        });
    });
};
