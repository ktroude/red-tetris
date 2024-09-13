
const MultiGame = require('../models/game/multiGame');
const Player = require('../models/player');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Player connected with ID: ${socket.id}`);

        socket.on('joinMultiGame', (data) => {
            const { playerName, roomId } = data;
            const player = new Player(socket.id, playerName);

            socket.join(roomId);

            let game = getGameForRoom(roomId) || new MultiGame();
            game.addPlayer(player);

            socket.emit('init', { playerId: player.id, playerName: player.name, grid: player.grid });
            socket.broadcast.to(roomId).emit('newPlayer', { playerId: player.id, playerName: player.name });

            socket.on('movePiece', (moveData) => {
                player.movePiece(moveData.direction);
                const gameOverStatus = game.handleGameOver();

                if (gameOverStatus) {
                    const { losingPlayer, winningPlayer } = gameOverStatus;
                    io.to(roomId).emit('gameOver', {
                        winner: winningPlayer.name,
                        loser: losingPlayer.name,
                        message: `${winningPlayer.name} wins!`
                    });
                } else {
                    io.to(roomId).emit('updateGrid', { playerId: player.id, grid: player.grid });
                }
            });

            socket.on('disconnect', () => {
                console.log(`Player ${player.name} disconnected`);
                game.removePlayer(socket.id);
                socket.broadcast.to(roomId).emit('playerLeft', { playerId: socket.id, playerName: player.name });
            });
        });
    });
};

// Helper pour obtenir la partie
function getGameForRoom(roomId) {
    // Logic to retrieve or create the game for the room
}
