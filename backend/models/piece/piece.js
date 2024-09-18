/**
 * Represents a Tetris piece. Manages the piece's shape, position, and rotation.
 * Provides methods to manipulate the piece, including moving and rotating.
 */
class Piece {
    /**
     * Initializes a new instance of the Piece class.
     * 
     * @param {Array<Array<number>>} shape - The shape of the piece represented as a 2D matrix.
     */
    constructor(shape) {
        this.shape = shape; // The shape of the piece (2D matrix)
        this.x = 5; // Horizontal position of the piece
        this.y = 1; // Vertical position of the piece
        this.rotation = 0; // Rotation index (0 to 3 for 4 possible orientations)
    }

    /**
     * Gets the matrix of the shape considering the current rotation.
     * 
     * @returns {Array<Array<number>>} The matrix representing the shape of the piece.
     */
    getMatrix() {
        let matrix = this.shape;
        for (let i = 0; i < this.rotation; i++) {
            matrix = this.rotateMatrix(matrix);
        }
        return matrix;
    }

    /**
     * Rotates a matrix 90 degrees clockwise.
     * 
     * @param {Array<Array<number>>} matrix - The matrix to be rotated.
     * @returns {Array<Array<number>>} The rotated matrix.
     */
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

    /**
     * Rotates the piece 90 degrees clockwise.
     */
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    /**
     * Moves the piece to the left by decreasing its x-coordinate.
     */
    moveLeft() {
        this.x -= 1;
    }

    /**
     * Moves the piece to the right by increasing its x-coordinate.
     */
    moveRight() {
        this.x += 1;
    }

    /**
     * Moves the piece down by increasing its y-coordinate.
     */
    moveDown() {
        this.y += 1;
    }

    /**
     * Resets the position and rotation of the piece to the initial state.
     * Sets the x-coordinate and y-coordinate to 0 and the rotation to 0.
     */
    resetPosition() {
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
    }
}

module.exports = Piece;
