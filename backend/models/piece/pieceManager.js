const SHAPES = require('./shapes');
const Piece = require('./piece');

/**
 * Manages the generation of Tetris pieces. Handles the sequence and retrieval of upcoming pieces.
 */
class PieceManager {
    /**
     * Initializes a new instance of the PieceManager class.
     * Selects a random starting index for piece generation.
     */
    constructor() {
        this.shapes = Object.keys(SHAPES); // List of all available piece shapes
        this.currentPieceIndex = Math.floor(Math.random() * this.shapes.length); // Random starting index for piece generation
    }

    /**
     * Retrieves the next Tetris piece in the sequence.
     * Moves to the next piece in the list after returning the current piece.
     * 
     * @returns {Piece} The next piece to be used in the game.
     */
    getNextPiece() {
        const shapeKey = this.shapes[this.currentPieceIndex]; // Get the shape key for the current piece
        const piece = new Piece(SHAPES[shapeKey]); // Create a new piece with the current shape
        this.currentPieceIndex = (this.currentPieceIndex + 1) % this.shapes.length; // Update to the next piece index
        return piece; // Return the newly created piece
    }
}

module.exports = PieceManager;
