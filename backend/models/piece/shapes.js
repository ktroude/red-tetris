/**
 * Defines the various shapes for Tetris pieces.
 * Each shape is represented as a 2D matrix of integers, where each integer corresponds to a specific color on the frontend.
 * The number values represent different Tetris pieces and their colors.
 * 
 * @type {Object<string, Array<Array<number>>>}
 * @property {Array<Array<number>>} I - The 'I' piece shape, represented as a 1x4 matrix.
 * @property {Array<Array<number>>} J - The 'J' piece shape, represented as a 2x3 matrix.
 * @property {Array<Array<number>>} L - The 'L' piece shape, represented as a 2x3 matrix.
 * @property {Array<Array<number>>} O - The 'O' piece shape, represented as a 2x2 matrix.
 * @property {Array<Array<number>>} S - The 'S' piece shape, represented as a 2x3 matrix.
 * @property {Array<Array<number>>} T - The 'T' piece shape, represented as a 2x3 matrix.
 * @property {Array<Array<number>>} Z - The 'Z' piece shape, represented as a 2x3 matrix.
 */
const SHAPES = {
    I: [
        [1, 1, 1, 1]  // 'I' piece, a straight line
    ],
    J: [
        [0, 0, 2],     // 'J' piece, shaped like a reverse L
        [2, 2, 2]
    ],
    L: [
        [3, 0, 0],     // 'L' piece, shaped like a right angle
        [3, 3, 3]
    ],
    O: [
        [4, 4],        // 'O' piece, a square block
        [4, 4]
    ],
    S: [
        [0, 5, 5],     // 'S' piece, shaped like an S
        [5, 5, 0]
    ],
    T: [
        [0, 6, 0],     // 'T' piece, shaped like a T
        [6, 6, 6]
    ],
    Z: [
        [7, 7, 0],     // 'Z' piece, shaped like a Z
        [0, 7, 7]
    ]
};

module.exports = SHAPES;

