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
        this.isUpdating = false;  // Drapeau pour éviter les mises à jour simultanées
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
        if (!this.currentPiece || this.isUpdating) return;
        this.isUpdating = true;
        
        let piece = this.currentPiece;
        let { x, y } = piece;
        const previousX = x;
        const previousY = y;

        this.clearPieceFromGrid(piece);

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
                piece.y -= 1;
                this.placePiece(piece);
                this.clearFullLines();
                this.generateNewPiece();
                this.isUpdating = false;
                return;
        }

        if (this.isValidPosition(piece)) {
            this.updateGrid(piece);
        } else {
            piece.x = previousX;
            piece.y = previousY;
            if (direction === 'down') {
                this.placePiece(piece);
                this.clearFullLines();
                this.generateNewPiece();
            }
        }

        this.isUpdating = false;
    }

    isValidPosition(piece) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] !== 0) {
                    const gridX = piece.x + c;
                    const gridY = piece.y + r;

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
        for (let col = 0; col < this.grid[0].length; col++) {
            if (this.grid[0][col] !== 0) {
                if (this.grid[1] && this.grid[1][col] !== 0) {
                    console.log("Game Over: Top row blocked and no space for new pieces.");
                    return true;
                }
            }
        }

        const topRowFilled = this.grid[0].every(cell => cell !== 0);
        if (topRowFilled) {
            console.log("Game Over: Entire top row is blocked.");
            return true;
        }

        return false;
    }
}

module.exports = Player;
