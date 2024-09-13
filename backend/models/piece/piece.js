
class Piece {
    constructor(shape) {
        this.shape = shape; // The shape of the piece (2D matrix)
        this.x = 0; // Horizontal position of the piece
        this.y = 0; // Vertical position of the piece
        this.rotation = 0; // Rotation index (0 to 3 for 4 possible orientations)
    }

    // Get the matrix of the shape considering the current rotation
    getMatrix() {
        let matrix = this.shape;
        for (let i = 0; i < this.rotation; i++) {
            matrix = this.rotateMatrix(matrix);
        }
        return matrix;
    }

    // Rotate the matrix 90 degrees clockwise
    rotateMatrix(matrix) {
        const numRows = matrix.length;
        const numCols = matrix[0].length;
        const result = Array.from({ length: numCols }, () => Array(numRows).fill(0));

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                result[c][numRows - r - 1] = matrix[r][c];
            }
        }
        return result;
    }

    // Rotate the piece 90 degrees clockwise
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    // Move the piece to the left
    moveLeft() {
        this.x -= 1;
    }

    // Move the piece to the right
    moveRight() {
        this.x += 1;
    }

    // Move the piece down
    moveDown() {
        this.y += 1;
    }

    // Reset the position and rotation of the piece
    resetPosition() {
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
    }
}

module.exports = Piece;