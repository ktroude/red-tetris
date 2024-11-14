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
        this.spectraGrid = this.createEmptyGrid(); // grid used to display the opponent's grid in multiplayer mode
        this.currentPiece = null; // the piece currently being controlled by the player
        this.nextPieces = []; // queue of upcoming pieces
        this.score = 0; // scoring system
        this.isPlaying = true; // indicates if the player is actively playing the game
        if (!isMulti) {
            this.fillPieceQueue(); // fills the piece queue at initialization
        }
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
     * @returns {Object} Returns an object with a boolean (true if the game is over, false otherwise)
     *  and the number of lines cleared by the player after a mouvement.
     */
    movePiece(direction) {
        if (!this.currentPiece) {
            this.spectraGrid = this.grid.map(row => [...row]);
            return { gameover: false, linesCleared: 0, reachBottom: false };
        }

        let piece = this.currentPiece;
        const previousX = piece.x;
        const previousY = piece.y;

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
                if (!this.isValidPosition(piece)) {
                    piece.x = previousX;
                    piece.y = previousY;
                    piece.rotate();
                }
                break;
            case 'space':
                while (this.isValidPosition(piece)) {
                    piece.moveDown();
                }
                piece.y -= 1;  // Revert to the last valid position
                this.placePiece(piece);
                let linesCleared = this.clearFullLines();
                this.spectraGrid = this.grid.map(row => [...row]);
                this.spectraGrid = this.removeFloatingBlock(this.spectraGrid, this.currentPiece);
                this.generateNewPiece();
                return { gameover: this.checkGameOver(), linesCleared: linesCleared, reachBottom: true };
        }

        // Validate the new position for other directions
        if (this.isValidPosition(piece)) {
            this.updateGrid(piece);
        } else {
            piece.x = previousX;
            piece.y = previousY;
            if (direction === 'down') {
                this.placePiece(piece);
                let linesCleared = this.clearFullLines();
                this.spectraGrid = this.grid.map(row => [...row]);
                this.spectraGrid = this.removeFloatingBlock(this.spectraGrid, this.currentPiece);        
                this.generateNewPiece();
                return { gameover: this.checkGameOver(), linesCleared: linesCleared, reachBottom: true };
            }
        }
        this.spectraGrid = this.grid.map(row => [...row]);
        this.spectraGrid = this.removeFloatingBlock(this.spectraGrid, this.currentPiece);
        return { gameover: false, linesCleared: 0, reachBottom: false };
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

    removeFloatingBlock(grid, piece) {
        const matrix = piece.getMatrix(); // Obtenir la matrice du bloc (sa forme actuelle)
        const startX = piece.x; // Position X de la pièce dans la grille
        const startY = piece.y; // Position Y de la pièce dans la grille
    
        return grid.map((row, r) =>
            row.map((cell, c) => {
                // Vérifier si la cellule appartient à la pièce
                const isPieceCell = 
                    r >= startY && r < startY + matrix.length && // Vérifier si Y est dans la plage de la pièce
                    c >= startX && c < startX + matrix[0].length && // Vérifier si X est dans la plage de la pièce
                    matrix[r - startY][c - startX] !== 0; // Vérifier si la matrice contient un bloc ici
    
                // Si la cellule appartient à la pièce, la passer à 0
                if (isPieceCell) {
                    return 0;
                }
    
                // Sinon, la passer à 9 si elle n'est pas déjà vide
                return cell === 0 ? 0 : 9;
            })
        );
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
        this.score += 10;
    }

    /**
     * Clears full lines from the grid and shifts the remaining lines down.
     * 
     * @returns {number} The number of lines cleared.
     */
    clearFullLines() {
        const rowsToClear = this.grid.reduce((acc, row, index) => {
            // 0 for empty cell and 9 for cells freeze by an opponant
            if (row.every(cell => cell !== 0 && cell !== 9)) {
                acc.push(index);
            }
            return acc;
        }, []);
    
        const rowsCleared = rowsToClear.length;

        // clear the lines fulled
        if (rowsCleared > 0) {
            this.grid = this.grid.filter((_, index) => !rowsToClear.includes(index));
            while (this.grid.length < 20) {
                this.grid.unshift(Array(10).fill(0));
            }
        }

        // update the score after each lines cleared
        for (let i = 0; i < rowsCleared; i++) {
            this.score += 1000;
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

    getSpectra() {

        const fillColumn = (array, x, y) => {

            for (let i = y; i < array.length; i++)
            {
                array[i][x] = 9;
            }
            return array;
        }

        let spectra = this.grid;
        spectra = this.removeFloatingBlock(spectra, this.currentPiece);

        for (let i = 0; i < spectra.length; i++) {
            for (let j = 0; j < spectra[i].length; j++) {
                if (spectra[i][j] > 0) {
                    spectra = fillColumn(spectra, j, i);
                }
            }
        }

        return spectra;
    }
}

module.exports = Player;
