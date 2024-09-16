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

    createEmptyGrid() {
        const rows = 20;
        const cols = 10;
        return Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    setPiece(piece) {
        this.currentPiece = piece;
    }

    movePiece(direction) {
        if (!this.currentPiece) return;
    
        let piece = this.currentPiece;
        let { x, y } = piece;
        let isGameEnded = false;
        // Save the piece's previous position
        const previousX = x;
        const previousY = y;
    
        // Clear the previous position of the piece from the grid
        this.clearPieceFromGrid(piece);
    
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
                return this.checkGameOver();
        }

        // Check if the new position is valid

        console.log("position de la piece: ", this.isValidPosition(piece));

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


    isValidPosition(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                // Only check cells that are part of the piece (non-zero values)
                if (matrix[r][c] !== 0) {
                    const gridX = piece.x + c;
                    const gridY = piece.y + r;
    
                    // Check if the piece is out of the grid bounds or if it collides with another block
                    if (
                        gridX < 0 ||                           // Out of the grid (left side)
                        gridX >= this.grid[0].length ||        // Out of the grid (right side)
                        gridY >= this.grid.length ||           // Below the grid (bottom)
                        (gridY >= 0 && this.grid[gridY][gridX]) // Collision with another block
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    

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
    

    placePiece(piece) {
        console.log("piece placed");
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    this.grid[piece.y + r][piece.x + c] = matrix[r][c];
                }
            }
        }
    }

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
            return rowsCleared;
        }
        return 0;
    }

    generateNewPiece() {
        const randomShape = Object.keys(SHAPES)[Math.floor(Math.random() * Object.keys(SHAPES).length)];
        this.currentPiece = new Piece(SHAPES[randomShape]);
        this.currentPiece.x = Math.floor(this.grid[0].length / 2) - Math.floor(this.currentPiece.getMatrix()[0].length / 2);
        this.currentPiece.y = 0;

        if (!this.isValidPosition(this.currentPiece)) {
            this.isPlaying = false;
        }
    }

    checkGameOver() {
        // Check the top row of the grid to see if it's completely blocked
        for (let col = 0; col < this.grid[0].length; col++) {
            // If any cell in the top row is filled
            if (this.grid[0][col] !== 0) {
                // Check if there is space for a new piece to spawn
                if (this.grid[1] && this.grid[1][col] !== 0) {
                    console.log("Game Over: Top row blocked and no space for new pieces.");
                    return true;  // If the cell below is also filled, game over
                }
            }
        }
        return false;
    }
    
}

module.exports = Player;
