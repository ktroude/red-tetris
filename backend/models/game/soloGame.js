class SoloGame {
    constructor(player) {
        this.player = player;
        this.isRunning = false;
        this.gameInterval = null;
    }

    startGameLoop(io, socket) {
        this.isRunning = true;
        const gameSpeed = 1000;

        this.gameInterval = setInterval(() => {
            if (this.player.isPlaying && !this.player.isUpdating) {
                this.player.movePiece('down');

                io.to(socket.id).emit('updateGrid', { grid: this.player.grid });

                if (this.player.checkGameOver()) {
                    console.log("game over sent");
                    this.endGame(io, socket);
                }
            }
        }, gameSpeed);
    }

    endGame(io, socket) {
        this.isRunning = false;
        clearInterval(this.gameInterval);
        io.to(socket.id).emit('gameOver', { message: 'Game Over' });
    }
}

module.exports = SoloGame;
