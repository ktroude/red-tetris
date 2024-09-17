class SoloGame {
    constructor(player) {
        this.player = player;
        this.isRunning = false;
        this.gameInterval = null;
    }

    startGameLoop(io, socket) {
        this.isRunning = true;
        const gameSpeed = 1000;
        let isGameOver = false;

        this.gameInterval = setInterval(() => {
            if (this.player.isPlaying) {
                isGameOver = this.player.movePiece('down');

                io.to(socket.id).emit('updateGridSolo', { grid: this.player.grid });

                if (isGameOver) {
                    this.endGame(io, socket);
                }
            }
        }, gameSpeed);
    }

    endGame(io, socket) {
        this.isRunning = false;
        this.player.isPlaying = false;
        clearInterval(this.gameInterval);
        io.to(socket.id).emit('gameOverSolo', { message: 'Game Over' });
    }
}

module.exports = SoloGame;
