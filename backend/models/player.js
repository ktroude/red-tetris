const Piece = require('./piece/piece');
const SHAPES = require('./piece/shapes');

/**
 * Represents a player in the Tetris game. Manages the player's state, grid, and active/next pieces.
 * Handles actions such as piece movement, line clearing, and game-over checks.
 */
class Player {
    /**
     * Initializes a new instance of the Player class.
     * 
     * @param {string} id - The unique identifier for the player (typically the socket ID).
     * @param {string} name - The name of the player.
     * @param {boolean} isMulti - Indicates whether the player is in a multiplayer game.
     */
    constructor(id, name, isMulti = false) {
        this.isMulti = isMulti; // used for pieces generation in multiplayer mode
        this.id = id;   // player's socket id
        this.name = name; // player's username
        this.grid = this.createEmptyGrid(); // player's Tetris grid
        this.currentPiece = null; // the piece currently being controlled by the player
        this.nextPieces = []; // queue of upcoming pieces
        this.score = 0; // unused for now, potentially for future scoring system
        this.isPlaying = true; // indicates if the player is actively playing the game
        this.fillPieceQueue(); // fills the piece queue at initialization
    }

    /**
     * Creates an empty Tetris grid with the standard 20 rows and 10 columns.
     * 
     * @returns {Array<Array<number>>} A 2D array representing the empty grid.
     */
    createEmptyGrid() {
        const rows = 20;
        const cols = 10;
        return Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    /**
     * Fills the player's queue of upcoming pieces with random shapes.
     * Ensures the queue always has at least 3 pieces.
     */
    fillPieceQueue() {
        while (this.nextPieces.length < 3) {
            const randomShape = Object.keys(SHAPES)[Math.floor(Math.random() * Object.keys(SHAPES).length)];
            this.nextPieces.push(new Piece(SHAPES[randomShape]));
        }
    }

    /**
     * Sets the current piece for the player to the specified piece.
     * 
     * @param {Piece} piece - The piece to set as the current active piece.
     */
    setPiece(piece) {
        this.currentPiece = piece;
    }

    /**
     * Moves the current piece in the specified direction and updates the player's grid.
     * Handles rotation, normal movement (left, right, down), and "hard drop" (space bar).
     * 
     * @param {string} direction - The direction to move the piece ('left', 'right', 'down', 'rotate', 'space').
     * @returns {boolean} Returns true if the game is over, false otherwise.
     */
    movePiece(direction) {
        if (!this.currentPiece) return;

        let piece = this.currentPiece;
        let { x, y } = piece;
        const previousX = x;
        const previousY = y;

        this.clearPieceFromGrid(piece);

        // Update piece position based on direction
        switch (direction) {
            case 'left':
                piece.moveLeft();
                break;
            case 'right':
                piece.moveRight();
                break;
            case 'down':
                piece.moveDown();
                break;
            case 'rotate':
                piece.rotate();
                break;
            case 'space':
                while (this.isValidPosition(piece)) {
                    piece.moveDown();
                }
                piece.y -= 1;  // Revert to the last valid position
                this.placePiece(piece);
                this.clearFullLines();
                this.generateNewPiece();
                return this.checkGameOver();
        }

        // Validate the new position
        if (this.isValidPosition(piece)) {
            this.updateGrid(piece);
        } else {
            piece.x = previousX;
            piece.y = previousY;
            if (direction === 'down') {
                this.placePiece(piece);
                this.clearFullLines();
                this.generateNewPiece();
                return this.checkGameOver();
            }
        }
    }

    /**
     * Checks if the current piece is in a valid position within the grid.
     * 
     * @param {Piece} piece - The piece to validate.
     * @returns {boolean} Returns true if the piece is in a valid position, false otherwise.
     */
    isValidPosition(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] !== 0) {
                    const gridX = piece.x + c;
                    const gridY = piece.y + r;

                    // Check if the piece is out of bounds or colliding with another block
                    if (
                        gridX < 0 || 
                        gridX >= this.grid[0].length || 
                        gridY >= this.grid.length || 
                        (gridY >= 0 && this.grid[gridY][gridX])
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Updates the player's grid with the current piece's position.
     * 
     * @param {Piece} piece - The piece to place on the grid.
     */
    updateGrid(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] !== 0) {
                    this.grid[piece.y + r][piece.x + c] = matrix[r][c];
                }
            }
        }
    }

    /**
     * Clears the current piece from the grid by setting its cells to 0.
     * 
     * @param {Piece} piece - The piece to remove from the grid.
     */
    clearPieceFromGrid(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] !== 0) {
                    this.grid[piece.y + r][piece.x + c] = 0;
                }
            }
        }
    }

    /**
     * Places the current piece permanently on the grid.
     * 
     * @param {Piece} piece - The piece to place on the grid.
     */
    placePiece(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    this.grid[piece.y + r][piece.x + c] = matrix[r][c];
                }
            }
        }
    }

    /**
     * Clears full lines from the grid and shifts the remaining lines down.
     * 
     * @returns {number} The number of lines cleared.
     */
    clearFullLines() {
        const rowsToClear = this.grid.reduce((acc, row, index) => {
            if (row.every(cell => cell !== 0)) {
                acc.push(index);
            }
            return acc;
        }, []);

        const rowsCleared = rowsToClear.length;

        if (rowsCleared > 0) {
            this.grid = this.grid.filter((_, index) => !rowsToClear.includes(index));
            while (this.grid.length < 20) {
                this.grid.unshift(Array(10).fill(0));
            }
        }

        return rowsCleared;
    }

    /**
     * Generates a new piece for the player and updates the piece queue.
     * Ends the game if no valid position is available for the new piece.
     */
    generateNewPiece() {
        this.currentPiece = this.nextPieces.shift();
        this.currentPiece.x = 5;
        this.currentPiece.y = 0;

        if (!this.isMulti) {
            this.fillPieceQueue();
        }

        if (!this.isValidPosition(this.currentPiece)) {
            this.isPlaying = false; // Game over if the new piece has no valid position
        }
    }

    /**
     * Checks if the game is over by inspecting the top row of the grid.
     * 
     * @returns {boolean} Returns true if the game is over, false otherwise.
     */
    checkGameOver() {
        for (let col = 0; col < this.grid[0].length; col++) {
            if (this.grid[0][col] !== 0) {
                if (this.grid[1] && this.grid[1][col] !== 0) {
                    return true;  // Game over if the top two rows are blocked
                }
            }
        }
        return false;
    }
}

module.exports = Player;
