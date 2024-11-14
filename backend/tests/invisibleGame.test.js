const InvisibleGame = require('../models/game/InvisibleGame');
const Player = require('../models/player');
const PieceManager = require('../models/piece/pieceManager');
const Piece = require('../models/piece/piece');

// Mocking the dependencies
jest.mock('../models/piece/piece');
jest.mock('../models/piece/pieceManager');
jest.mock('../models/storage/StorageProvider');

describe('InvisibleGame', () => {
    let invisibleGame;
    let owner;
    let opponent;
    let io;

    beforeEach(() => {
        // Setup mock players
        owner = new Player('ownerId', 'owner', true);
        opponent = new Player('opponentId', 'opponent', true);

        // Create an instance of InvisibleGame
        invisibleGame = new InvisibleGame('room1');
        
        // Assign players to the game
        invisibleGame.addOwner(owner);
        invisibleGame.addOpponent(opponent);

        // Mock the PieceManager to return a predefined piece
        PieceManager.mockImplementation(() => {
            return {
                getNextPiece: jest.fn().mockReturnValue(new Piece([[1]]))
            };
        });

        // Mock io object for socket communication
        io = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };
    });

    test('should initialize with correct properties', () => {
        expect(invisibleGame.roomId).toBe('room1');
        expect(invisibleGame.owner).toBe(owner);       // Owner should be set correctly
        expect(invisibleGame.opponent).toBe(opponent); // Opponent should be set correctly
        expect(invisibleGame.pieceManager).toBeInstanceOf(PieceManager); // PieceManager should be initialized
        expect(invisibleGame.isRunning).toBe(false);   // Game is not running initially
        expect(invisibleGame.intervalTime).toBe(300);  // Check specific interval time for InvisibleGame
    });

    test('should add and remove players correctly', () => {
        expect(invisibleGame.owner).toBe(owner);
        expect(invisibleGame.opponent).toBe(opponent);
        
        invisibleGame.removeOwner();
        expect(invisibleGame.owner).toBeNull();  // Owner should be null after removal
        
        invisibleGame.removeOpponent();
        expect(invisibleGame.opponent).toBeNull();  // Opponent should be null after removal
    });

    test('should start game loop and emit correct events', () => {
        jest.useFakeTimers();

        // Mock movePiece responses
        owner.movePiece = jest.fn().mockReturnValue({ gameover: false, reachBottom: true });
        opponent.movePiece = jest.fn().mockReturnValue({ gameover: false, reachBottom: true });

        invisibleGame.distributePieces();
        invisibleGame.startGameLoop(io);

        // Simulate timer for game loop
        jest.advanceTimersByTime(300);

        // Check if grids are emitted correctly on reaching bottom
        expect(io.to(owner.id).emit).toHaveBeenCalledWith('updateGrid', { grid: owner.grid });
        expect(io.to(opponent.id).emit).toHaveBeenCalledWith('updateGrid', { grid: opponent.grid });
        
        // Check opponent grid updates for each player
        expect(io.to(owner.id).emit).toHaveBeenCalledWith('opponentUpdateGrid', { grid: opponent.getSpectra() });
        expect(io.to(opponent.id).emit).toHaveBeenCalledWith('opponentUpdateGrid', { grid: owner.getSpectra() });
    });

    test('should handle game over for owner and opponent', () => {
        jest.useFakeTimers();

        // Mock game over responses
        owner.movePiece = jest.fn().mockReturnValue({ gameover: true, reachBottom: false });
        opponent.movePiece = jest.fn().mockReturnValue({ gameover: true, reachBottom: false });
        
        invisibleGame.distributePieces();
        invisibleGame.startGameLoop(io);

        // Simulate timer to process the game loop
        jest.advanceTimersByTime(1000);

        // Check if game over is triggered for owner
        expect(io.to(owner.id).emit).toHaveBeenCalledWith('gameOver');
        expect(io.to(opponent.id).emit).toHaveBeenCalledWith('win');

        // Ensure the game loop stops
        expect(invisibleGame.isRunning).toBe(false);
    });
});
