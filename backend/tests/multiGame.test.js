const MultiGame = require('../models/game/multiGame');
const Player = require('../models/player');
const PieceManager = require('../models/piece/pieceManager');
const Piece = require('../models/piece/piece');


// Mock the Piece and PieceManager classes
jest.mock('../models/piece/piece');
jest.mock('../models/piece/pieceManager');

describe('MultiGame', () => {
    let multiGame;
    let owner;
    let opponent;
    let io;
    let player;

    beforeEach(() => {
        // Mock players
        owner = new Player('ownerId', 'owner', true);
        opponent = new Player('opponentId', 'opponent', true);
        
        // Create MultiGame instance
        multiGame = new MultiGame('room1');

        // Assign players to the game
        multiGame.addOwner(owner);
        multiGame.addOpponent(opponent);

        // Mock the PieceManager to return a predefined piece
        PieceManager.mockImplementation(() => {
            return {
                getNextPiece: jest.fn().mockReturnValue(new Piece([[1]])) // Mocked piece shape
            };
        });

        // Mock the io object
        io = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };
    });

    test('should initialize with correct properties', () => {
        expect(multiGame.roomId).toBe('room1'); // Check room ID
        expect(multiGame.owner).toBe(owner); // Check owner
        expect(multiGame.opponent).toBe(opponent); // Check opponent
        expect(multiGame.pieceManager).toBeInstanceOf(PieceManager); // Check piece manager instance
        expect(multiGame.isRunning).toBe(false); // Check initial game state
    });

    test('should add players correctly', () => {
        expect(multiGame.owner).toBe(owner); // Check if owner is set correctly
        expect(multiGame.opponent).toBe(opponent); // Check if opponent is set correctly
    });

    test('should remove players correctly', () => {
        multiGame.removeOwner();
        expect(multiGame.owner).toBeNull(); // Check if owner is removed

        multiGame.removeOpponent();
        expect(multiGame.opponent).toBeNull(); // Check if opponent is removed
    });

    test('should distribute pieces correctly', () => {
        multiGame.distributePieces();

        // Check if both players received the same piece
        expect(owner.nextPieces.length).toBeGreaterThan(0); // Owner should have pieces
        expect(opponent.nextPieces.length).toBeGreaterThan(0); // Opponent should have pieces
        expect(owner.nextPieces[0].x).toBe(5); // Check initial x position
        expect(owner.nextPieces[0].y).toBe(0); // Check initial y position
        expect(opponent.nextPieces[0].x).toBe(5); // Check initial x position
        expect(opponent.nextPieces[0].y).toBe(0); // Check initial y position

        // Check if the first pieces are set correctly
        expect(owner.currentPiece).toBeTruthy(); // Current piece should not be null or empty
        expect(opponent.currentPiece).toBeTruthy(); // Current piece should not be null or empty
    });

    test('should handle game loop logic', () => {
        jest.useFakeTimers(); // Use fake timers for the game loop

        // Mock the movePiece method for both owner and opponent
        owner.movePiece = jest.fn().mockReturnValueOnce({ gameover: false, linesCleared: 0 });
        opponent.movePiece = jest.fn().mockReturnValueOnce({ gameover: false, linesCleared: 2 });

        // Start the game loop
        multiGame.startGameLoop(io, owner);
        multiGame.startGameLoop(io, opponent);

        // Simulate the 'movePiece' event for the owner
        io.to = jest.fn().mockReturnValue({
            emit: jest.fn() // Mock emit method
        });

        // Emit the movePiece event for the owner moving down
        io.to(owner.id).emit('movePiece', 'down');
        io.to(opponent.id).emit('movePiece', 'down');
    
        // Advance timers to simulate the game loop iteration
        jest.advanceTimersByTime(1000); // Fast forward by 1 second
    
        // Check if freezing lines in the opponent's grid
        expect(multiGame.owner.grid).toEqual(multiGame.freezeLinesGrid(0, owner.grid)); // Check if owner's grid updated
        expect(multiGame.opponent.grid).toEqual(multiGame.freezeLinesGrid(0, opponent.grid)); // Check if opponent's grid updated

        // Check gameover condition
        
        owner.movePiece = jest.fn().mockReturnValueOnce({ gameover: true, linesCleared: 0 });
        opponent.movePiece = jest.fn().mockReturnValueOnce({ gameover: true, linesCleared: 0 });
        io.to(owner.id).emit('movePiece', 'down');
        io.to(opponent.id).emit('movePiece', 'down');
        
        jest.advanceTimersByTime(1000); // Fast forward by 1 second

        expect(multiGame.isRunning).toEqual(false); // Check if opponent's grid updated

    });

    test('should freeze lines correctly', () => {
        // Create a simple grid for testing
        opponent.grid = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];

        // Freeze 2 lines
        const updatedGrid = multiGame.freezeLinesGrid(2, opponent.grid);

        // Check if the last two lines were frozen
        expect(updatedGrid[2]).toEqual([9, 9, 9]); // Check if the third line is frozen
        expect(updatedGrid[3]).toEqual([9, 9, 9]); // Check if the fourth line is frozen
    });
});
