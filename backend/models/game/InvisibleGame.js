const PieceManager = require('../piece/pieceManager.js');
const Piece = require('../piece/piece.js')
const StorageProvider = require("../storage/StorageProvider.js");
const MultiGame = require('./multiGame.js');


class InvisibleGame extends MultiGame {

    /**
     *
     */
    constructor() {
        super();
        this.intervalTime = 300;
        this.previousOwnerGrid = [];
    }

    startGameLoop(io) {
        this.isRunning = true;

        let ownerIsGameOver = false;
        let opponentIsGameOver = false;
        this.previousOwnerGrid = this.owner.createEmptyGrid();
        this.previousOpponentGrid = this.opponent.createEmptyGrid();



        this.gameInterval = setInterval(() => {
            if (this.isRunning) {
                // Stop the game if either player disconnects
                let ownerResult = this.owner.movePiece('down');
                let opponentResult = this.opponent.movePiece('down');

                ownerIsGameOver = ownerResult.gameover;
                opponentIsGameOver = opponentResult.gameover;

                if (ownerResult.reachBottom)
                    io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                if (opponentResult.reachBottom)
                    io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                
                io.to(this.owner.id).emit('opponentUpdateGrid', { grid: this.opponent.getSpectra() });
                io.to(this.opponent.id).emit('opponentUpdateGrid', { grid: this.owner.getSpectra() });

                // Handle gameover logic
                if (ownerIsGameOver) {

                    this.isRunning = false;
                    io.to(this.owner.id).emit('gameOver');
                    io.to(this.opponent.id).emit('win');
                    clearInterval();
                    this.isRunning = false;
                    new StorageProvider().addGamemodeGame(this.opponent.name, this.owner.name, "INVISIBLE");
                    return;
                }
                if (opponentIsGameOver) {
                    this.isRunning = false;
                    io.to(this.opponent.id).emit('gameOver');
                    io.to(this.owner.id).emit('win');
                    clearInterval();
                    
                    new StorageProvider().addGamemodeGame(this.owner.name, this.opponent.name, "INVISIBLE");
                    
                    this.isRunning = false;
                    return;
                }
            }
        }, this.intervalTime);
    }
}

module.exports = InvisibleGame;
