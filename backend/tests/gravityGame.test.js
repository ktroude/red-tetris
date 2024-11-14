const GravityGame = require('../models/game/GravityGame');
const Player = require('../models/player');
const PieceManager = require('../models/piece/pieceManager');
const Piece = require('../models/piece/piece');

// Mock classes Piece and PieceManager
jest.mock('../models/piece/piece');
jest.mock('../models/piece/pieceManager');

describe('GravityGame', () => {
    let gravityGame;
    let owner;
    let opponent;
    let io;

    beforeEach(() => {
        // Mock players
        owner = new Player('ownerId', 'owner', true);
        opponent = new Player('opponentId', 'opponent', true);
        
        // Create GravityGame instance
        gravityGame = new GravityGame('room1');

        // Assign players to the game
        gravityGame.addOwner(owner);
        gravityGame.addOpponent(opponent);

        // Mock PieceManager to return a predefined piece
        PieceManager.mockImplementation(() => {
            return {
                getNextPiece: jest.fn().mockReturnValue(new Piece([[1]]))
            };
        });

        // Mock io object
        io = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };
    });

    test('should initialize with correct properties', () => {
        expect(gravityGame.roomId).toBe('room1');
        expect(gravityGame.owner).toBe(owner);
        expect(gravityGame.opponent).toBe(opponent);
        expect(gravityGame.pieceManager).toBeInstanceOf(PieceManager);
        expect(gravityGame.isRunning).toBe(false);
        expect(gravityGame.intervalTime).toBe(500);
    });

    test('should start game loop and handle piece movement', () => {
        jest.useFakeTimers();

        // Mock results for movePiece
        owner.movePiece = jest.fn().mockReturnValueOnce({ gameover: false, linesCleared: 2 });
        opponent.movePiece = jest.fn().mockReturnValueOnce({ gameover: false, linesCleared: 3 });

        // Start the game loop
        gravityGame.distributePieces();
        gravityGame.startGameLoop(io);

        // Advance time to simulate one loop iteration
        jest.advanceTimersByTime(500);

        // Check that lines are frozen for the opponent
        expect(gravityGame.owner.grid).toEqual(gravityGame.freezeLinesGrid(2, owner.grid));
        expect(gravityGame.opponent.grid).toEqual(gravityGame.freezeLinesGrid(3, opponent.grid));

        // Check that grids have been updated
        expect(io.to(owner.id).emit).toHaveBeenCalledWith('updateGrid', { grid: owner.grid });
        expect(io.to(opponent.id).emit).toHaveBeenCalledWith('updateGrid', { grid: opponent.grid });

        // Clean up timers
        jest.useRealTimers();
    });

    test('should handle gameover for owner', () => {
        jest.useFakeTimers();

        // Simulate gameover for the owner
        owner.movePiece = jest.fn().mockReturnValue({ gameover: true, linesCleared: 0 });
        opponent.movePiece = jest.fn().mockReturnValue({ gameover: false, linesCleared: 0 });

        gravityGame.distributePieces();
        gravityGame.startGameLoop(io);

        // Advance time to simulate one loop iteration
        jest.advanceTimersByTime(500);

        // Check that game stops and correct events are emitted
        expect(gravityGame.isRunning).toBe(false);
        expect(io.to(owner.id).emit).toHaveBeenCalledWith('gameOver');
        expect(io.to(opponent.id).emit).toHaveBeenCalledWith('win');

        jest.useRealTimers();
    });

    test('should handle gameover for opponent', () => {
        jest.useFakeTimers();

        // Simulate gameover for the opponent
        owner.movePiece = jest.fn().mockReturnValue({ gameover: false, linesCleared: 0 });
        opponent.movePiece = jest.fn().mockReturnValue({ gameover: true, linesCleared: 0 });

        gravityGame.distributePieces();
        gravityGame.startGameLoop(io);

        // Advance time to simulate one loop iteration
        jest.advanceTimersByTime(500);

        // Check that game stops and correct events are emitted
        expect(gravityGame.isRunning).toBe(false);
        expect(io.to(opponent.id).emit).toHaveBeenCalledWith('gameOver');
        expect(io.to(owner.id).emit).toHaveBeenCalledWith('win');

        jest.useRealTimers();
    });

    test('should freeze lines correctly', () => {
        // Set up a test grid
        opponent.grid = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];

        // Freeze 2 lines
        const updatedGrid = gravityGame.freezeLinesGrid(2, opponent.grid);

        // Check that the last two rows are frozen
        expect(updatedGrid[2]).toEqual([9, 9, 9]);
        expect(updatedGrid[3]).toEqual([9, 9, 9]);
    });
});
