const SoloGame = require('../models/game/soloGame');
const Player = require('../models/player');
jest.useFakeTimers(); // For managing setInterval in tests

describe('SoloGame', () => {

    let game, player;

    beforeEach(() => {
        game = new SoloGame();
        player = new Player('1', 'TestPlayer');
        game.addPlayer(player);
    });

    afterEach(() => {
        game.stop();
        jest.clearAllTimers(); // Clears any interval set during the tests
    });

    test('should create a SoloGame instance with correct mode and add a player', () => {
        expect(game).toBeInstanceOf(SoloGame);
        expect(game.mode).toBe('solo');
        
        const addedPlayer = game.players[player.id];
        expect(addedPlayer).toBeDefined();
        expect(addedPlayer.name).toBe('TestPlayer');
        expect(addedPlayer.id).toBe('1');
        expect(addedPlayer.grid).toBeDefined();
        expect(Array.isArray(addedPlayer.grid)).toBe(true); // Check that grid is an array
    });

    test('should be able to add a player', () => {
        expect(game.players[player.id]).toBe(player); // Player was added
    });

    test('should increase speed every 30 seconds when game starts', () => {
        game.start();

        expect(game.speed).toBe(1000); // Initial speed
        expect(game.level).toBe(1); // Initial level

        // Simulate 30 seconds
        jest.advanceTimersByTime(30000);
        expect(game.speed).toBe(900); // Speed increased after 30 seconds
        expect(game.level).toBe(2); // Level increased

        // Simulate another 30 seconds
        jest.advanceTimersByTime(30000);
        expect(game.speed).toBe(800); // Speed increased again
        expect(game.level).toBe(3);
    });

    test('should stop the game when stop() is called', () => {
        game.start();
        expect(game.gameOver).toBe(false); // Game is running

        game.stop();
        expect(game.gameOver).toBe(true); // Game stopped
    });

    test('should stop the game and return true when handleGameOver detects game over', () => {
        // Mock player's checkGameOver method to simulate game over
        player.checkGameOver = jest.fn(() => true);
        
        const isGameOver = game.handleGameOver(player);
        expect(isGameOver).toBe(true); // Game over should return true
        expect(game.gameOver).toBe(true); // Game should stop
    });

    test('should return false when handleGameOver does not detect game over', () => {
        // Mock player's checkGameOver method to simulate no game over
        player.checkGameOver = jest.fn(() => false);

        const isGameOver = game.handleGameOver(player);
        expect(isGameOver).toBe(false); // No game over
        expect(game.gameOver).toBe(false); // Game should still be running
    });

    test('should remove a player correctly', () => {
        game.removePlayer(player.id);
        expect(game.getPlayer(player.id)).toBeUndefined(); // Player should be removed
    });

    test('should increase speed but not drop below 100ms', () => {
        game.speed = 200; // Set the speed to a low value to test the lower limit

        game.increaseSpeed();
        expect(game.speed).toBe(100); // Speed shouldn't go below 100ms
        expect(game.level).toBe(2); // Level should still increase
    });

});
