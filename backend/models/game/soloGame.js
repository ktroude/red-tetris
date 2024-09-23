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
        this.baseSpeed = 1000; // Initial speed in ms
        this.minSpeed = 100; // Minimum speed (fastest) in ms
    }

    /**
     * Calculates the game speed based on the player's score.
     * The higher the score, the faster the game becomes, but it won't be faster than the minimum speed.
     * 
     * @returns {number} - The interval time in milliseconds for the game loop.
     */
    calculateGameSpeed() {
        // Example: decrease speed by 50ms every 1000 points, but don't go below the minSpeed (100ms)
        let speed = this.baseSpeed - Math.floor(this.player.score / 1000) * 50;
        return Math.max(this.minSpeed, speed); // Ensure the speed doesn't go below 100ms
    }

    /**
     * Starts the game loop for the solo game.
     * 
     * @param {Object} io - The socket.io instance used for communication.
     * @param {Object} socket - The socket representing the player's connection.
     */
    startGameLoop(io, socket) {
        this.isRunning = true;

        const gameLoop = () => {
            if (this.isRunning) {

                let result = this.player.movePiece('down');
                let isGameOver = result.gameover;

                io.to(socket.id).emit('updateGridSolo', { grid: this.player.grid });

                
                io.to(socket.id).emit('scoreSolo', { score: this.player.score });

                if (isGameOver) {
                    this.endGame(io, socket);
                }

                // Calculate new game speed based on the player's score
                const newGameSpeed = this.calculateGameSpeed();

                // If the new speed is different, reset the interval
                if (this.gameInterval) {
                    clearInterval(this.gameInterval); // Clear the old interval
                }

                // Restart the interval with the updated speed
                this.gameInterval = setInterval(gameLoop, newGameSpeed);
            }
        };

        // Start the initial game loop
        this.gameInterval = setInterval(gameLoop, this.baseSpeed);
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
