const Player = require('../models/player');
const Piece = require('../models/piece/piece');
const SHAPES = require('../models/piece/shapes');

describe('Player', () => {
    let player;

    beforeEach(() => {
        // Initialize a new player before each test
        player = new Player('socket_id', 'Test Player');
    });

    test('should initialize with correct properties', () => {
        expect(player.id).toBe('socket_id');
        expect(player.name).toBe('Test Player');
        expect(player.grid).toHaveLength(20);
        expect(player.grid[0]).toHaveLength(10);
        expect(player.nextPieces).toHaveLength(3);
        expect(player.isPlaying).toBe(true);
    });

    test('should create an empty grid', () => {
        const emptyGrid = player.createEmptyGrid();
        expect(emptyGrid).toHaveLength(20);
        expect(emptyGrid[0]).toHaveLength(10);
        expect(emptyGrid.flat()).toEqual(Array(200).fill(0)); // 20 * 10 = 200
    });

    test('should fill piece queue with random pieces', () => {
        const initialQueue = player.nextPieces.length;
        player.fillPieceQueue();
        expect(player.nextPieces.length).toBeGreaterThanOrEqual(initialQueue); // Should be at least 3
    });

    test('should set current piece', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        expect(player.currentPiece).toBe(piece);
    });

    test('should move piece left', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 5; // Initial position
        player.movePiece('left');
        expect(piece.x).toBe(4); // The piece should move left
    });

    test('should move piece right', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 5; // Initial position
        player.movePiece('right');
        expect(piece.x).toBe(6); // The piece should move right
    });

    test('should move piece down', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.y = 0; // Initial position
        player.movePiece('down');
        expect(piece.y).toBe(1); // The piece should move down
    });

    test('should not move piece out of bounds (left)', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 0; // Position at the left edge
        player.movePiece('left');
        expect(piece.x).toBe(0); // Should not move left
    });

    test('should not move piece out of bounds (right)', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 9; // Position at the right edge
        player.movePiece('right');
        expect(piece.x).toBe(9); // Should not move right
    });

    test('should rotate piece', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        const initialRotation = piece.rotation;
        player.movePiece('rotate');
        expect(piece.rotation).not.toBe(initialRotation); // Should change rotation
    });

    test('should not rotate piece out of bounds', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 0; // Position at the left edge
        player.movePiece('rotate');
        expect(piece.x).toBe(0); // Should not move out of bounds
    });

    test('should clear full lines and increase score', () => {
        // Fill the grid to create a full line
        player.grid[19] = Array(10).fill(1); // Full line
        const linesCleared = player.clearFullLines();
        expect(linesCleared).toBe(1);
        expect(player.grid[19]).toEqual(Array(10).fill(0)); // Line should be cleared
        expect(player.score).toBe(1000); // Score should increase
    });

    test('should clear multiple full lines and increase score accordingly', () => {
        player.grid[19] = Array(10).fill(1); // Full line
        player.grid[18] = Array(10).fill(1); // Another full line
        const linesCleared = player.clearFullLines();
        expect(linesCleared).toBe(2);
        expect(player.score).toBe(2000); // Score should increase accordingly
    });

    test('should generate a new piece', () => {
        player.generateNewPiece();
        expect(player.currentPiece).toBeDefined();
        expect(player.currentPiece.x).toBe(4);
        expect(player.currentPiece.y).toBe(0);
        expect(player.nextPieces).toHaveLength(3);
    });

    test('should not generate a new piece in multiplayer mode', () => {
        const multiplayerPlayer = new Player('socket_id', 'Test Player', true);
        multiplayerPlayer.fillPieceQueue(); // Fill the queue first
        multiplayerPlayer.generateNewPiece();
        expect(multiplayerPlayer.currentPiece).toBeDefined();
        expect(multiplayerPlayer.nextPieces).toHaveLength(2); // Queue should remain at 2
    });

    test('should check game over condition', () => {
        // Simulate game over condition
        player.grid[0] = Array(10).fill(1);
        player.grid[1] = Array(10).fill(1);
        expect(player.checkGameOver()).toBe(true); // Game should be over
    });

    test('should not be game over if the grid is clear', () => {
        expect(player.checkGameOver()).toBe(false); // Game should not be over
    });

    test('should clear current piece from grid', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 5;
        piece.y = 0;
        player.updateGrid(piece); // Place piece in the grid
        player.clearPieceFromGrid(piece); // Clear it
        expect(player.grid[0][5]).toBe(0); // Position should be cleared
    });

    test('should place piece on the grid', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 5;
        piece.y = 0;
        player.updateGrid(piece); // Place piece in the grid
        player.placePiece(piece);
        expect(player.grid[0][5]).toBeDefined(); // Should be on the grid
        expect(player.grid[0][5]).not.toBe(0); // Should not be zero
    });

    test('should not place piece if it is out of bounds', () => {
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.x = 10; // Out of bounds
        player.placePiece(piece);
        expect(player.grid[0][9]).toBe(0); // Should not place it
    });
});
