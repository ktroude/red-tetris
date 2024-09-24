const SHAPES = require('../models/piece/shapes');
const PieceManager = require('../models/piece/pieceManager');

describe('PieceManager', () => {
    let pieceManager;

    beforeEach(() => {
        pieceManager = new PieceManager(); // Initialize a new instance of PieceManager before each test
    });

    test('should initialize with a random currentPieceIndex', () => {
        // Check that the current piece index is valid
        expect(pieceManager.currentPieceIndex).toBeGreaterThanOrEqual(0);
        expect(pieceManager.currentPieceIndex).toBeLessThan(pieceManager.shapes.length);
    });

    test('should return a piece from the available shapes', () => {
        const piece = pieceManager.getNextPiece(); // Get the next piece
        expect(piece).toBeDefined(); // Ensure the piece is defined
        expect(piece.shape).toBeDefined(); // Ensure the shape of the piece is defined
    });

    test('should update currentPieceIndex after getting a piece', () => {
        const initialIndex = pieceManager.currentPieceIndex; // Store the initial index
        pieceManager.getNextPiece(); // Get the next piece
        expect(pieceManager.currentPieceIndex).toBe((initialIndex + 1) % pieceManager.shapes.length); // Check that the index has been updated correctly
    });

    test('should cycle through pieces correctly', () => {
        const indexes = [];
        for (let i = 0; i < pieceManager.shapes.length; i++) {
            indexes.push(pieceManager.currentPieceIndex); // Record the index before each call
            pieceManager.getNextPiece(); // Get the next piece
        }
        // Check that all indexes are unique
        const uniqueIndexes = new Set(indexes);
        expect(uniqueIndexes.size).toBe(pieceManager.shapes.length); // Ensure there are as many unique indexes as shapes
    });
});
