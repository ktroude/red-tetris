
const Player = require('../models/player');
const Piece = require('../models/piece/piece');
const SHAPES = require('../models/piece/shapes');


describe('Player class', () => {

    test('Player should start with an empty grid', () => {
        const player = new Player('1', 'TestPlayer');
        expect(player.grid.length).toBe(20);
        expect(player.grid[0].length).toBe(10);
        expect(player.grid.flat().every(cell => cell === 0)).toBe(true);
    });

    test('Player should set a piece', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        expect(player.currentPiece).toBe(piece);
    });

    test('Player should move piece left', () => {
        const player = new Player('1', 'TestPlayer');
        let piece = new Piece(SHAPES.I);
        piece.x = 1; // Initial position
        piece.y = 0;
        player.setPiece(piece);
        player.movePiece('left');
        expect(piece.x).toBe(0); // Verify that the piece was moved left
    });

    test('Player should move piece right', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        player.movePiece('right');
        expect(piece.x).toBe(1);
    });

    test('Player should move piece down', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        player.movePiece('down');
        expect(piece.y).toBe(1);
    });

    test('Player should rotate piece', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
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

    test('Player should reset piece position and rotation', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.I);
        player.setPiece(piece);
        piece.moveRight();
        piece.moveDown();
        piece.rotate();
        player.currentPiece.resetPosition();
        expect(piece.x).toBe(0);
        expect(piece.y).toBe(0);
        expect(piece.rotation).toBe(0);
    });

    test('Player should check game over', () => {
        const player = new Player('1', 'TestPlayer');
        // Manually fill the top row to simulate game over
        player.grid[0] = Array(10).fill(1);
        expect(player.checkGameOver()).toBe(true);
    });

    test('Player should generate a new piece', () => {
        const player = new Player('1', 'TestPlayer');
        player.generateNewPiece();
        expect(player.currentPiece).toBeDefined();
        expect(player.currentPiece.x).toBeGreaterThanOrEqual(0);
        expect(player.currentPiece.y).toBe(0);
        expect(player.isValidPosition(player.currentPiece)).toBe(true);
    });

    test('Player should clear full lines and update grid', () => {
        const player = new Player('1', 'TestPlayer');
        // Simulate a full line
        player.grid[18] = Array(10).fill(1);
        player.clearFullLines();
        // Check if the line was cleared and the grid is updated
        expect(player.grid[18].every(cell => cell === 0)).toBe(true);
        expect(player.grid.length).toBe(20);
    });

    test('Player should place a piece on the grid', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.O);
        piece.x = 4; // x position of the piece
        piece.y = 18; // y position of the piece
        player.setPiece(piece);
        // Store the state of a specific cell before placing the piece
        const gridBeforeCell = player.grid[piece.y][piece.x];
        // Place the piece on the grid
        player.placePiece(piece);
        // Store the state of the same cell after placing the piece
        const gridAfterCell = player.grid[piece.y][piece.x];
        // Ensure the grid has changed at that location
        expect(gridBeforeCell).not.toBe(gridAfterCell); // The cell should be different after placing the piece
    });

    test('Player should clear piece from the grid', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.O);
        piece.x = 4;
        piece.y = 18;
        player.setPiece(piece);
        player.placePiece(piece);
        player.clearPieceFromGrid(piece);
        expect(player.grid[piece.y].slice(piece.x, piece.x + piece.getMatrix()[0].length).every(cell => cell === 0)).toBe(true);
    });

    test('Player should move piece to the bottom when "space" is pressed', () => {
        const player = new Player('1', 'TestPlayer');
        const piece = new Piece(SHAPES.O);
        piece.x = 4; // Set the piece in the middle of the grid horizontally
        piece.y = 0; // Start from the top of the grid
        player.setPiece(piece);
        // Simulate pressing 'space' to drop the piece to the bottom
        player.movePiece('space');
        // We expect the piece to be placed as low as possible without collision
        expect(player.grid[18][4]).toBe(1); // Check the grid to confirm the piece was placed correctly
        expect(player.grid[18][5]).toBe(1);
        expect(player.grid[19][4]).toBe(1);
        expect(player.grid[19][5]).toBe(1);
    });

});
