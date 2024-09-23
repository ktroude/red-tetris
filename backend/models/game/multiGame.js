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
        let linesCleared = 0;
        setInterval(() => {
            if (this.isRunning) {
                if (player && player.id && player.id === this.owner?.id) {
                    
                    let result = this.owner.movePiece('down');
                    isGameOver = result.gameover;
                    linesCleared = result.linesCleared;

                    console.log('linesCleared = ', linesCleared);
                    
                    if (linesCleared > 1) {
                        console.log('freeze oppareted');
                        this.opponent.grid = this.freezeLinesGrid(linesCleared - 1, this.opponent.grid);
                        console.log('Updated opponent grid:', this.opponent.grid);
                        io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    }

                    io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    io.to(this.opponent.id).emit('opponentUpdateGrid', { grid: this.owner.grid });
                }

                if (player && player.id && player.id === this.opponent?.id) {

                    let result = this.opponent.movePiece('down');
                    isGameOver = result.gameover;
                    linesCleared = result.linesCleared;

                    if (linesCleared > 1) {
                        console.log('freeze oppareted');
                        this.owner.grid = this.freezeLinesGrid(linesCleared - 1, this.owner.grid);
                        console.log('Updated owner grid:', this.owner.grid);
                        io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    }

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
                let piece = this.pieceManager.getNextPiece();
                piece.x = 5;
                piece.y = 0;
    
                this.owner.nextPieces.push(piece);
                this.opponent.nextPieces.push(piece);
            }

            this.owner.generateNewPiece();
            this.opponent.generateNewPiece();
        }
    }

    freezeLinesGrid(nbrLineTofreeze, grid) {
        console.log('nbr line to freeze: ', nbrLineTofreeze);
    
        for (let i = grid.length - 1; i >= 0 && nbrLineTofreeze > 0; i--) {
            if (grid[i][0] !== 9) {
                while (nbrLineTofreeze !== 0) {
                    for (let j = 0; j < grid[i].length; j++) {
                        grid[i][j] = 9;
                    }
                    nbrLineTofreeze--;
                    i--;
                    if (i < 0) break;
                }
            }
        }
        console.log(grid);
        return grid;
    }

}

module.exports = MultiGame;
