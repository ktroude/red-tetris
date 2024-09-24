/**
 * Manages a single-player Tetris game, handling game logic and interactions for a single player.
 * This class is responsible for controlling the game flow, including game speed, player interactions,
 * and game-over logic.
 */
class SoloGame {
    /**
     * Initializes a new instance of the SoloGame class.
     * 
     * @param {Player} player - The player participating in the solo game.
     */
    constructor(player) {
        this.player = player; // The player participating in the game
        this.isRunning = false; // Indicates whether the game is currently active
        this.gameInterval = null; // Holds the reference to the game loop interval for controlling game speed
        this.baseSpeed = 1000; // The base speed of the game loop in milliseconds (1 second per move at the start)
        this.minSpeed = 100; // The minimum allowable speed (100ms per move), defining the fastest pace
    }

    /**
     * Calculates the game speed dynamically based on the player's score.
     * The game speed increases as the player's score rises, with a cap to prevent it from becoming too fast.
     * 
     * @returns {number} The time interval for the game loop, in milliseconds.
     */
    calculateGameSpeed() {
        // For every 1000 points, reduce the interval by 50ms, but ensure it doesn't go below the minimum speed (100ms)
        let speed = this.baseSpeed - Math.floor(this.player.score / 1000) * 50;
        return Math.max(this.minSpeed, speed); // Returns the calculated speed, ensuring it's not below 100ms
    }

    /**
     * Starts the game loop for the solo game.
     * This method is responsible for continuously moving the player's piece down at intervals determined by the game speed.
     * 
     * @param {Object} io - The socket.io instance for communication.
     * @param {Object} socket - The socket connection representing the player's connection.
     */
    startGameLoop(io, socket) {
        this.isRunning = true; // Set the game as active

        const gameLoop = () => {
            if (this.isRunning) { // Ensure the game is still running
                // Move the player's piece down and check for game-over conditions
                let result = this.player.movePiece('down'); 
                let isGameOver = result.gameover;

                // Send the updated grid to the player
                io.to(socket.id).emit('updateGridSolo', { grid: this.player.grid });

                // Send the updated score to the player
                io.to(socket.id).emit('scoreSolo', { score: this.player.score });

                if (isGameOver) {
                    this.endGame(io, socket); // End the game if game-over condition is met
                }

                // Recalculate the game speed based on the player's current score
                const newGameSpeed = this.calculateGameSpeed();

                // If the speed changes, reset the interval to adjust the game pace
                if (this.gameInterval) {
                    clearInterval(this.gameInterval); // Clear the previous interval
                }

                // Set a new interval with the updated game speed
                this.gameInterval = setInterval(gameLoop, newGameSpeed);
            }
        };

        // Start the initial game loop at the base speed
        this.gameInterval = setInterval(gameLoop, this.baseSpeed);
    }

    /**
     * Ends the solo game and notifies the player that the game is over.
     * This method stops the game loop and communicates the game-over state to the player.
     * 
     * @param {Object} io - The socket.io instance for communication.
     * @param {Object} socket - The socket connection representing the player's connection.
     */
    endGame(io, socket) {
        this.isRunning = false; // Set the game as inactive
        this.player.isPlaying = false; // Mark the player as no longer playing
        clearInterval(this.gameInterval); // Clear the game loop interval to stop the game
        io.to(socket.id).emit('gameOverSolo', { message: 'Game Over' }); // Notify the player that the game has ended
    }
}

module.exports = SoloGame;
