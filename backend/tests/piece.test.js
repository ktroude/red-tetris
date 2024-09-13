
const Piece = require('../models/piece/piece');
const SHAPES = require('../models/piece/shapes');


test('Matrix should be Shape', () => {
    let piece = new Piece(SHAPES.I);
    const matrix = piece.getMatrix();
    expect(matrix).toEqual(SHAPES.I);
});

test('Piece should rotate', () => {
    let piece = new Piece(SHAPES.I);
    piece.rotate();
    const matrix = piece.getMatrix();
    expect(matrix).toEqual(
        [
            [1],
            [1],
            [1],
            [1]
        ]
    );
});

test('Piece should move left', () => {
    let piece = new Piece(SHAPES.I);
    piece.moveLeft();
    expect(piece.x).toBe(-1);
});

test('Piece should move right', () => {
    let piece = new Piece(SHAPES.I);
    piece.moveRight();
    expect(piece.x).toBe(1);
});

test('Piece should move down', () => {
    let piece = new Piece(SHAPES.I);
    piece.moveDown();
    expect(piece.y).toBe(1);
});

test('Piece should reset position and rotation', () => {
    let piece = new Piece(SHAPES.I);
    piece.moveRight();
    piece.moveDown();
    piece.rotate();
    piece.resetPosition();
    expect(piece.x).toBe(0);
    expect(piece.y).toBe(0);
    expect(piece.rotation).toBe(0);
});

test('Piece should rotate correctly multiple times', () => {
    let piece = new Piece(SHAPES.I);
    piece.rotate();
    piece.rotate(); // 180 degrees rotation
    piece.rotate(); // 270 degrees rotation
    piece.rotate(); // 360 degrees rotation (same as initial)
    const matrix = piece.getMatrix();
    expect(matrix).toEqual(SHAPES.I);
});