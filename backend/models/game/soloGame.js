/**
 * Manages a single-player Tetris game, handling game logic and interactions for a single player.
 * 
 * @class
 */
class SoloGame {
    /**
     * Initializes a new instance of the SoloGame class.
     * 
     * @param {Player} player - The player participating in the solo game.
     */
    constructor(player) {
        this.player = player; // The player participating in the game
        this.isRunning = false; // Indicates if the game is currently running
        this.gameInterval = null; // Holds the reference to the game loop interval
    }

    /**
     * Starts the game loop for the solo game.
     * 
     * @param {Object} io - The socket.io instance used for communication.
     * @param {Object} socket - The socket representing the player's connection.
     */
    startGameLoop(io, socket) {
        this.isRunning = true;
        const gameSpeed = 1000; // Interval for game updates in milliseconds
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

    /**
     * Ends the solo game and notifies the player of the game over state.
     * 
     * @param {Object} io - The socket.io instance used for communication.
     * @param {Object} socket - The socket representing the player's connection.
     */
    endGame(io, socket) {
        this.isRunning = false;
        this.player.isPlaying = false;
        clearInterval(this.gameInterval);
        io.to(socket.id).emit('gameOverSolo', { message: 'Game Over' });
    }
}

module.exports = SoloGame;

