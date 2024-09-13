const MultiGame = require('../models/game/multiGame');
const Player = require('../models/player');
const PieceManager = require('../models/piece/pieceManager');

jest.mock('../models/piece/pieceManager'); // Mock to avoid complex dependencies

describe('MultiGame', () => {
    let game;
    let player1, player2;

    beforeEach(() => {
        game = new MultiGame();
        player1 = new Player('0', 'Player 1');
        player2 = new Player('1', 'Player 2');
        game.addPlayer(player1);
        game.addPlayer(player2);

        PieceManager.mockClear(); // Clear mocks between tests
    });

    test('should create a MultiGame instance with correct mode', () => {
        // Verify that MultiGame is instantiated with the correct mode
        expect(game).toBeInstanceOf(MultiGame);
        expect(game.mode).toBe('multi');
    });

    test('should add players to the MultiGame instance', () => {
        // Check that players are correctly added to the MultiGame instance
        expect(game.players[player1.id]).toBe(player1);
        expect(game.players[player2.id]).toBe(player2);
        expect(Object.keys(game.players)).toHaveLength(2);
    });

    test('should assign a new piece to both players when game starts', () => {
        // Mock the piece that will be assigned to the players
        const mockPiece = { shape: 'O', x: 0, y: 0 };
        PieceManager.prototype.getNextPiece.mockReturnValue(mockPiece);

        game.start(); // Start the game

        // Verify that the new piece is assigned to both players
        expect(PieceManager.prototype.getNextPiece).toHaveBeenCalled();
        expect(player1.currentPiece).toBe(mockPiece);
        expect(player2.currentPiece).toBe(mockPiece);
    });

    test('should detect game over and return losing and winning players', () => {
        // Simulate game over condition for player1
        jest.spyOn(player1, 'checkGameOver').mockReturnValue(true);
        jest.spyOn(player2, 'checkGameOver').mockReturnValue(false);

        const result = game.handleGameOver();

        // Check that the losing and winning players are correctly identified
        expect(result.losingPlayer).toBe(player1);
        expect(result.winningPlayer).toBe(player2);
        expect(game.gameOver).toBe(true); // Verify that the game is stopped
    });

    test('should return null if no player has lost', () => {
        // Simulate no game over condition for both players
        jest.spyOn(player1, 'checkGameOver').mockReturnValue(false);
        jest.spyOn(player2, 'checkGameOver').mockReturnValue(false);

        const result = game.handleGameOver();

        // Verify that no game over condition is detected and game continues
        expect(result).toBeNull();
        expect(game.gameOver).toBe(false); // The game should not be stopped
    });

    test('should assign the same new piece to both players', () => {
        // Mock a different piece to be assigned to the players
        const mockPiece = { shape: 'T', x: 1, y: 1 };
        PieceManager.prototype.getNextPiece.mockReturnValue(mockPiece);

        game.assignNewPiece(); // Assign a new piece to players

        // Verify that the same new piece is assigned to both players
        expect(PieceManager.prototype.getNextPiece).toHaveBeenCalled();
        expect(player1.currentPiece).toBe(mockPiece);
        expect(player2.currentPiece).toBe(mockPiece);
    });
});
