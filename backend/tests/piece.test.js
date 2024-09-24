
const Piece = require('../models/piece/piece');
const SHAPES = require('../models/piece/shapes');

describe('Piece', () => {
    let piece;

    beforeEach(() => {
        // Initialize a new piece with a simple shape before each test
        piece = new Piece(SHAPES.I);
    });

    test('should initialize with correct properties', () => {
        expect(piece.shape).toEqual([[1, 1, 1, 1]]);
        expect(piece.x).toBe(5);
        expect(piece.y).toBe(1);
        expect(piece.rotation).toBe(0);
    });

    test('should return the correct matrix without rotation', () => {
        const matrix = piece.getMatrix();
        expect(matrix).toEqual([[1, 1, 1, 1]]); // No rotation
    });

    test('should return the correct matrix after one rotation', () => {
        piece.rotate();
        const matrix = piece.getMatrix();
        expect(matrix).toEqual([[1], [1], [1], [1]]); // 90-degree rotation
    });

    test('should return the correct matrix after two rotations', () => {
        piece.rotate();
        piece.rotate();
        const matrix = piece.getMatrix();
        expect(matrix).toEqual([[1, 1, 1, 1]]); // 180-degree rotation (same as no rotation for I piece)
    });

    test('should return the correct matrix after three rotations', () => {
        piece.rotate();
        piece.rotate();
        piece.rotate();
        const matrix = piece.getMatrix();
        expect(matrix).toEqual([[1], [1], [1], [1]]); // 270-degree rotation
    });

    test('should reset position and rotation', () => {
        piece.x = 3;
        piece.y = 2;
        piece.rotation = 2; // Rotate it
        piece.resetPosition();
        expect(piece.x).toBe(0);
        expect(piece.y).toBe(0);
        expect(piece.rotation).toBe(0);
    });

    test('should move left correctly', () => {
        piece.moveLeft();
        expect(piece.x).toBe(4);
    });

    test('should move right correctly', () => {
        piece.moveRight();
        expect(piece.x).toBe(6);
    });

    test('should move down correctly', () => {
        piece.moveDown();
        expect(piece.y).toBe(2);
    });

    test('should rotate correctly', () => {
        const initialRotation = piece.rotation;
        piece.rotate();
        expect(piece.rotation).toBe((initialRotation + 1) % 4); // Should increase rotation
    });

    test('should rotate matrix correctly', () => {
        const shape = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
        const piece = new Piece(shape);
        const rotatedMatrix = piece.rotateMatrix(shape);
        expect(rotatedMatrix).toEqual([
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ]); // Should maintain the same shape after rotation
    });

    test('should rotate matrix correctly for I piece', () => {
        const shape = [
            [1, 1, 1, 1]
        ];
        const rotatedMatrix = piece.rotateMatrix(shape);
        expect(rotatedMatrix).toEqual([
            [1],
            [1],
            [1],
            [1]
        ]); // I piece should rotate to vertical
    });

    test('should return the correct matrix after four rotations (full cycle)', () => {
        piece.rotate();
        piece.rotate();
        piece.rotate();
        piece.rotate(); // Full cycle, should return to original
        const matrix = piece.getMatrix();
        expect(matrix).toEqual([[1, 1, 1, 1]]); // Original shape
    });
});
