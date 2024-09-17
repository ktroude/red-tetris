const Piece = require('./piece/piece');
const SHAPES = require('./piece/shapes');

class Player {
    constructor(id, name) {
        this.id = id;   // socket id
        this.name = name; // username
        this.grid = this.createEmptyGrid(); // the tetris grid
        this.currentPiece = null; // the piece the user is using
        this.nextPieces = []; // the queue of next pieces
        this.score = 0; // useless for now
        this.isPlaying = true;
        this.fillPieceQueue();
    }

    createEmptyGrid() {
        const rows = 20;
        const cols = 10;
        return Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    fillPieceQueue() {
        while (this.nextPieces.length < 3) {
            const randomShape = Object.keys(SHAPES)[Math.floor(Math.random() * Object.keys(SHAPES).length)];
            this.nextPieces.push(new Piece(SHAPES[randomShape]));
        }
    }

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
                return this.checkGameOver();
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
        console.log("piece cleared");
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
        this.currentPiece = this.nextPieces.shift();
        this.currentPiece.x = Math.floor(this.grid[0].length / 2) - Math.floor(this.currentPiece.getMatrix()[0].length / 2);
        this.currentPiece.y = 0;

        this.fillPieceQueue();

        if (!this.isValidPosition(this.currentPiece)) {
            this.isPlaying = false;
        }
    }

    checkGameOver() {
        for (let col = 0; col < this.grid[0].length; col++) {
            if (this.grid[0][col] !== 0) {
                if (this.grid[1] && this.grid[1][col] !== 0) {
                    console.log("Game Over: Top row blocked and no space for new pieces.");
                    return true;
                }
            }
        }
        return false;
    }
    
    
}

module.exports = Player;
