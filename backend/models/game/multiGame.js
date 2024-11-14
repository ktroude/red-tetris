const PieceManager = require('../piece/pieceManager');
const Piece = require('../piece/piece')
const StorageProvider = require("../storage/StorageProvider.js")

/**
 * Manages a multiplayer Tetris game, handling game logic and player interactions.
 * This class coordinates gameplay between two players, including piece distribution,
 * movement, grid updates, and gameover logic.
 */
class MultiGame {
    /**
     * Initializes a new instance of the MultiGame class.
     * 
     * @param {string} roomId - The identifier for the game room, used to distinguish multiplayer sessions.
     */
    constructor(roomId) {
        this.roomId = roomId; // Unique identifier for the multiplayer room
        this.owner = null; // Player designated as the owner of the game (first player)
        this.opponent = null; // Second player in the room
        this.pieceManager = new PieceManager(); // Manages the generation and distribution of Tetris pieces
        this.isRunning = false; // Flag to indicate if the game is actively running
        this.gameLoopInterval = null; // Interval for the game loop
    }

    /**
     * Sets the player who owns the game.
     * 
     * @param {Player} player - The player who will be assigned as the owner.
     */
    addOwner(player) {
        this.owner = player;
    }

    /**
     * Sets the opponent for the game.
     * 
     * @param {Player} player - The player who will be assigned as the opponent.
     */
    addOpponent(player) {
        this.opponent = player;
    }

    /**
     * Removes the current opponent from the game.
     */
    removeOpponent() {
        this.opponent = null;
    }

    /**
     * Removes the current owner from the game.
     */
    removeOwner() {
        this.owner = null;
    }
    
    /**
     * Starts the game loop for the current multiplayer game.
     * This function handles the core game logic, including moving pieces, clearing lines,
     * updating grids, and checking for gameover conditions.
     * 
     * @param {Object} io - The socket.io instance used for real-time communication.
     * @param {Player} player - The player requesting to start the game loop.
     */
    startGameLoop(io) {

        this.isRunning = true;

        let ownerIsGameOver = false;
        let opponentIsGameOver = false;
        let ownerLinesCleared = 0;
        let opponentLinesCleared = 0;

        this.gameLoopInterval = setInterval(() => {
            if (this.isRunning) {
                // Stop the game if either player disconnects
                let ownerResult = this.owner.movePiece('down');
                let opponentResult = this.opponent.movePiece('down');

                    ownerIsGameOver = ownerResult.gameover;
                    opponentIsGameOver = opponentResult.gameover;
                    ownerLinesCleared = ownerResult.linesCleared;
                    opponentLinesCleared = opponentResult.linesCleared;

                    if (ownerLinesCleared > 1) {
                        this.freezeLinesGrid(ownerLinesCleared - 1, this.opponent.grid);
                        io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    }
                    if (opponentLinesCleared > 1) {
                        this.freezeLinesGrid(opponentLinesCleared - 1, this.owner.grid);
                        io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    }

                    io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    io.to(this.owner.id).emit('opponentUpdateGrid', { grid: this.opponent.getSpectra() });
                    io.to(this.opponent.id).emit('opponentUpdateGrid', { grid: this.owner.getSpectra() });

                // Handle gameover logic
                if (ownerIsGameOver) {

                    this.isRunning = false;
                    io.to(this.owner.id).emit('gameOver');
                    io.to(this.opponent.id).emit('win');
                    clearInterval();
                    this.isRunning = false;
                    new StorageProvider().addMutliGame(this.opponent.name, this.owner.name);
                    return;
                }
                if (opponentIsGameOver) {
                    this.isRunning = false;
                    io.to(this.opponent.id).emit('gameOver');
                    io.to(this.owner.id).emit('win');
                    clearInterval();
                    
                    new StorageProvider().addMutliGame(this.owner.name, this.opponent.name);
                    
                    this.isRunning = false;
                    return;
                }
            }
        }, 1000); // Runs the game loop every second, no speed decrease in multiplayer mode
    }

    /**
     * Distributes Tetris pieces to both the owner and the opponent.
     * This function generates and assigns the same set of pieces for both players
     * to ensure identical gameplay and fair competition.
     */
    distributePieces() {
        
        if (this.owner && this.opponent) {
            this.opponent.grid = this.opponent.createEmptyGrid();
            this.owner.grid = this.opponent.createEmptyGrid();
            this.owner.nextPieces = [];
            this.opponent.nextPieces = [];
            // Generate and assign pieces for both players
            for (let i = 0; i < 20000; i++) {
                let piece = this.pieceManager.getNextPiece();
                piece.x = 5;
                piece.y = 0;

                // Create an identical piece for the opponent
                let opponentPiece = new Piece(piece.shape);
                opponentPiece.x = 5;
                opponentPiece.y = 0;

                this.owner.nextPieces.push(piece);
                this.opponent.nextPieces.push(opponentPiece);
            }
            // Set the first piece as the current piece for both players
            this.owner.currentPiece = this.owner.nextPieces.shift();
            this.opponent.currentPiece = this.opponent.nextPieces.shift();
        }
    }
    
    /**
     * Freezes lines in the grid of the opposing player.
     * This function is triggered when a player clears multiple lines, causing
     * frozen lines to appear at the bottom of the opponent's grid as a penalty.
     * 
     * @param {number} nbrLineTofreeze - The number of lines to freeze in the opponent's grid.
     * @param {Array} grid - The grid of the player whose lines are to be frozen.
     * @returns {Array} The updated grid with frozen lines.
     */
    freezeLinesGrid(nbrLineTofreeze, grid) {
        // Iterate through the grid and apply frozen lines
        for (let i = grid.length - 1; i >= 0 && nbrLineTofreeze > 0; i--) {
            if (grid[i][0] !== 9) { // Ensure it's not already a frozen line
                while (nbrLineTofreeze !== 0) {
                    for (let j = 0; j < grid[i].length; j++) {
                        grid[i][j] = 9; // Mark the line as frozen
                    }
                    nbrLineTofreeze--;
                    i--;
                    if (i < 0) break;
                }
            }
        }
        return grid; // Return the updated grid
    }

    clearInterval() {
        clearInterval(this.gameLoopInterval);  // Stop the loop
        this.gameLoopInterval = null;
        console.log('Game loop stopped');
    }
}

module.exports = MultiGame;
