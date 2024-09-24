const SoloGame = require('../models/game/soloGame');
const Player = require('../models/player');
jest.useFakeTimers(); // For managing setInterval in tests

// Mock the Player class for testing
jest.mock('../models/player');

describe('SoloGame', () => {
    let player;
    let soloGame;
    let io;
    let socket;

    beforeEach(() => {
        // Create a mock player with default values
        player = new Player();
        player.score = 0; // Initial score
        player.grid = []; // Initialize an empty grid
        player.movePiece = jest.fn(); // Mock movePiece method
        player.isPlaying = true; // Mark the player as playing

        // Initialize SoloGame instance
        soloGame = new SoloGame(player);

        // Mock io and socket objects
        io = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };

        socket = { id: 'testSocketId' }; // Mock socket ID
    });

    test('should initialize with correct properties', () => {
        expect(soloGame.player).toBe(player); // Check the player instance
        expect(soloGame.isRunning).toBe(false); // Check if the game is initially not running
        expect(soloGame.baseSpeed).toBe(1000); // Check initial game speed
        expect(soloGame.minSpeed).toBe(100); // Check minimum speed
    });

    test('should calculate game speed correctly', () => {
        // Test with different scores
        player.score = 0;
        expect(soloGame.calculateGameSpeed()).toBe(1000); // Initial speed at 0 score

        player.score = 2000;
        expect(soloGame.calculateGameSpeed()).toBe(900); // Speed should reduce with score

        player.score = 30000; // Excessive score to test speed cap
        expect(soloGame.calculateGameSpeed()).toBe(100); // Speed should not go below 100ms
    });

    test('should start the game loop', () => {
        // Mock the player's movePiece method to return game over condition
        player.movePiece.mockReturnValueOnce({ gameover: false });

        // Start the game loop
        soloGame.startGameLoop(io, socket);

        expect(soloGame.isRunning).toBe(true); // Game should be running
        expect(soloGame.gameInterval).toBeDefined(); // Game interval should be set

        // Simulate the game loop
        jest.advanceTimersByTime(soloGame.baseSpeed); // Fast forward the timer
        expect(player.movePiece).toHaveBeenCalledWith('down'); // Check if movePiece was called
        expect(io.to).toHaveBeenCalledWith(socket.id); // Check if the socket ID was used
    });

    test('should end the game', () => {
        soloGame.endGame(io, socket);
        
        expect(soloGame.isRunning).toBe(false); // Game should be marked as not running
        expect(player.isPlaying).toBe(false); // Player should be marked as not playing
        expect(io.to).toHaveBeenCalledWith(socket.id); // Check if the socket ID was used
        expect(io.emit).toHaveBeenCalledWith('gameOverSolo', { message: 'Game Over' }); // Check if game over message was sent
    });
});
