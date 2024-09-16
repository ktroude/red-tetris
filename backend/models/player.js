//player.js

const Piece = require('./piece/piece');
const SHAPES = require('./piece/shapes');

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.grid = this.createEmptyGrid();
        this.currentPiece = null;
        this.score = 0;
        this.isPlaying = true;
    }

    // Create an empty grid with the specified number of rows and columns
    createEmptyGrid() {
        const rows = 20;
        const cols = 10;
        return Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    // Set the current piece for the player
    setPiece(piece) {
        this.currentPiece = piece;
    }

    movePiece(direction) {
        if (!this.currentPiece) return;
    
        let piece = this.currentPiece;
        let { x, y } = piece;
        
        // Save the piece's previous position
        const previousX = x;
        const previousY = y;
    
        // Update the piece's position based on the direction
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
            case 'space':  // Special case: Move the piece straight to the bottom
                while (this.isValidPosition(piece)) {
                    piece.moveDown(); // Move down as far as possible
                }
                // Revert to the last valid position
                piece.y -= 1;
                this.placePiece(piece);
                this.clearFullLines();
                this.generateNewPiece();
                return;  // Exit since we've already placed the piece
        }

        // Check if the new position is valid
        if (this.isValidPosition(piece)) {
            // Position is valid, update the grid
            this.updateGrid(piece);
        } else {
            // Revert to previous position if invalid
            piece.x = previousX;
            piece.y = previousY;
            if (direction === 'down') {
                // Piece has settled, place it in the grid and generate a new piece
                this.placePiece(piece);
                this.clearFullLines();
                this.generateNewPiece();
            }
        }
    }
    

    // Check if the piece's current position is valid
    isValidPosition(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const gridX = piece.x + c;
                    const gridY = piece.y + r;
                    if (gridX < 0 || gridX >= this.grid[0].length || gridY >= this.grid.length || this.grid[gridY][gridX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Update the grid with the current piece
    updateGrid(piece) {
        // Clear previous piece placement
        this.clearPieceFromGrid(piece);

        // Place the new piece
        this.placePiece(piece);
    }

    // Clear the piece from the grid
    clearPieceFromGrid(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    this.grid[piece.y + r][piece.x + c] = 0;
                }
            }
        }
    }

    // Place the piece on the grid
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


    // Clear completed lines from the grid (and apply frozen lines effect in multi)
    clearFullLines() {
        const rowsToClear = this.grid.reduce((acc, row, index) => {
            if (row.every(cell => cell !== 0)) {
                acc.push(index);
            }
            return acc;
        }, []);

        const rowsCleared = rowsToClear.length;

        if (rowsCleared > 0) {
            // Update the grid
            this.grid = this.grid.filter((_, index) => !rowsToClear.includes(index));
            while (this.grid.length < 20) {
                this.grid.unshift(Array(10).fill(0));
            }
            // Notify other player to freeze lines (in multi mode)
            return rowsCleared;
        }
        return 0;
    }

    // Generate a new piece for the player
    generateNewPiece() {
        const randomShape = Object.keys(SHAPES)[Math.floor(Math.random() * Object.keys(SHAPES).length)];
        this.currentPiece = new Piece(SHAPES[randomShape]);
        this.currentPiece.x = Math.floor(this.grid[0].length / 2) - Math.floor(this.currentPiece.getMatrix()[0].length / 2);
        this.currentPiece.y = 0;

        // Check if the new piece immediately causes game over
        if (!this.isValidPosition(this.currentPiece)) {
            this.isPlaying = false;
        }
    }

    // Check if the game is over (piece hits the top)
    checkGameOver() {
        return this.grid[0].some(cell => cell !== 0);
    }
}

module.exports = Player;