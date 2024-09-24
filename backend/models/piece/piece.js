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
        this.x = 5; // Horizontal position of the piece (starting in the middle of the grid)
        this.y = 1; // Vertical position of the piece (slightly below the top)
        this.rotation = 0; // Rotation index (0 to 3, representing four possible rotations)
    }

    /**
     * Gets the matrix of the shape considering the current rotation.
     * 
     * @returns {Array<Array<number>>} The matrix representing the shape of the piece.
     */
    getMatrix() {
        let matrix = this.shape; // Start with the original shape
        for (let i = 0; i < this.rotation; i++) {
            matrix = this.rotateMatrix(matrix); // Apply rotation based on the current rotation index
        }
        return matrix; // Return the matrix representing the rotated piece
    }

    /**
     * Rotates a matrix 90 degrees clockwise.
     * 
     * @param {Array<Array<number>>} matrix - The matrix to be rotated.
     * @returns {Array<Array<number>>} The rotated matrix.
     */
    rotateMatrix(matrix) {
        const numRows = matrix.length; // Number of rows in the matrix
        const numCols = matrix[0].length; // Number of columns in the matrix
        const result = Array.from({ length: numCols }, () => Array(numRows).fill(0)); // Create an empty matrix for the result

        // Fill the result matrix with rotated values
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                result[c][numRows - r - 1] = matrix[r][c];
            }
        }
        return result; // Return the rotated matrix
    }

    /**
     * Rotates the piece 90 degrees clockwise.
     */
    rotate() {
        this.rotation = (this.rotation + 1) % 4; // Cycle through four possible rotations (0 to 3)
    }

    /**
     * Moves the piece one step to the left.
     */
    moveLeft() {
        this.x -= 1; // Decrease the horizontal position by 1
    }

    /**
     * Moves the piece one step to the right.
     */
    moveRight() {
        this.x += 1; // Increase the horizontal position by 1
    }

    /**
     * Moves the piece one step down.
     */
    moveDown() {
        this.y += 1; // Increase the vertical position by 1
    }

    /**
     * Resets the position and rotation of the piece.
     * This is typically used when generating a new piece.
     */
    resetPosition() {
        this.x = 0; // Reset horizontal position
        this.y = 0; // Reset vertical position
        this.rotation = 0; // Reset rotation to the original orientation
    }
}

module.exports = Piece;
