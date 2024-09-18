const PieceManager = require('../piece/pieceManager');

/**
 * Manages a multiplayer Tetris game, handling game logic and player interactions.
 * 
 * @class
 */
class MultiGame {
    /**
     * Initializes a new instance of the MultiGame class.
     * 
     * @param {string} roomId - The identifier for the game room.
     */
    constructor(roomId) {
        this.roomId = roomId; // The identifier for the game room
        this.owner = null; // The player who owns the room
        this.opponent = null; // The second player in the room
        this.pieceManager = new PieceManager(); // Manages the generation of Tetris pieces
        this.isRunning = false; // Indicates if the game is currently running
    }

    /**
     * Sets the owner of the game.
     * 
     * @param {Player} player - The player to be set as the owner.
     */
    addOwner(player) {
        this.owner = player;
    }

    /**
     * Sets the opponent of the game.
     * 
     * @param {Player} player - The player to be set as the opponent.
     */
    addOpponent(player) {
        this.opponent = player;
    }

    /**
     * Removes the opponent from the game.
     */
    removeOpponent() {
        this.opponent = null;
    }

    /**
     * Removes the owner from the game.
     */
    removeOwner() {
        this.owner = null;
    }

    /**
     * Starts the game loop for the current game.
     * 
     * @param {Object} io - The socket.io instance used for communication.
     * @param {Player} player - The player requesting to start the game loop.
     */
    startGameLoop(io, player) {
        this.isRunning = true;
        let isGameOver = false;
        setInterval(() => {
            if (this.isRunning) {
                if (player.id === this.owner?.id) {
                    isGameOver = this.owner.movePiece('down');
                    io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    io.to(this.opponent.id).emit('opponentUpdateGrid', { grid: this.owner.grid });
                }
                if (player.id === this.opponent?.id) {
                    isGameOver = this.opponent.movePiece('down');
                    io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    io.to(this.owner.id).emit('opponentUpdateGrid', { grid: this.opponent.grid });
                }

                if (isGameOver) {
                    if (player.id === this.owner?.id) {
                        io.to(this.owner.id).emit('gameOver');
                        io.to(this.opponent.id).emit('win');
                    }
                    if (player.id === this.opponent?.id) {
                        io.to(this.opponent.id).emit('gameOver');
                        io.to(this.owner.id).emit('win');
                        return;
                    }
                    this.isRunning = false;
                    console.log('GAME OVER SEND');
                }
            }
        }, 1000);
    }

    /**
     * Distributes pieces to both the owner and opponent, and generates initial pieces for them.
     */
    distributePieces() {
        if (this.owner && this.opponent) {
            for (let i = 0; i < 20000; i++) {
                const piece = this.pieceManager.getNextPiece();
                piece.x = 5;
                piece.y = 0;
    
                this.owner.nextPieces.push(piece);
                this.opponent.nextPieces.push(piece);
            }

            this.owner.generateNewPiece();
            this.opponent.generateNewPiece();
        }
    }
}

module.exports = MultiGame;
