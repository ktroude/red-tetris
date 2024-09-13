
const SHAPES = require('./shapes');
const Piece = require('./piece');

class PieceManager {
    constructor() {
        this.shapes = Object.keys(SHAPES);
        this.currentPieceIndex = Math.floor(Math.random() * this.shapes.length);
    }

    getNextPiece() {
        const shapeKey = this.shapes[this.currentPieceIndex];
        const piece = new Piece(SHAPES[shapeKey]);
        this.currentPieceIndex = (this.currentPieceIndex + 1) % this.shapes.length;
        return piece;
    }
}

module.exports = PieceManager;