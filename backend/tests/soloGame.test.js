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
        player.score = 0;
        expect(soloGame.calculateGameSpeed()).toBe(1000);
    
        player.score = 500;
        expect(soloGame.calculateGameSpeed()).toBe(1000); // Speed should still be 1000 as it hasn't reached the threshold
    
        player.score = 1000;
        expect(soloGame.calculateGameSpeed()).toBe(950); // Speed should reduce to 950
    
        player.score = 5000;
        expect(soloGame.calculateGameSpeed()).toBe(750); // Speed should reduce further
    
        player.score = 20000;
        expect(soloGame.calculateGameSpeed()).toBe(100); // Speed should be capped at 200
    
        player.score = 30000; // Excessive score to test speed cap
        expect(soloGame.calculateGameSpeed()).toBe(100); // Speed should not go below 100ms
    });

    test('should end the game when game over condition is met', () => {
        player.movePiece.mockReturnValueOnce({ gameover: true }); // Simule une condition de fin de jeu
        soloGame.startGameLoop(io, socket);
    
        jest.advanceTimersByTime(soloGame.baseSpeed); // Avancez le timer
    
        expect(soloGame.isRunning).toBe(false); // Assurez-vous que le jeu est terminé
        expect(io.to).toHaveBeenCalledWith(socket.id); // Vérifiez que l'ID du socket a été utilisé
        expect(io.emit).toHaveBeenCalledWith('gameOverSolo', { message: 'Game Over' }); // Vérifiez que le message de fin de jeu a été envoyé
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


    test('should start the game loop and call movePiece', () => {
        player.movePiece.mockReturnValueOnce({ gameover: false, linesCleared:0 }); // Simulate game is running
        soloGame.startGameLoop(io, socket);

        expect(soloGame.isRunning).toBe(true); // Game is started
    });
    
});
