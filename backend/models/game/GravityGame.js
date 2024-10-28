const PieceManager = require('../piece/pieceManager');
const Piece = require('../piece/piece')
const StorageProvider = require("../storage/StorageProvider.js");
const MultiGame = require('./multiGame.js');


class GravityGame extends MultiGame {

    /**
     *
     */
    constructor() {
        super();
        this.intervalTime = 300;
    }

    startGameLoop(io) {
        this.isRunning = true;

        let ownerIsGameOver = false;
        let opponentIsGameOver = false;
        let ownerLinesCleared = 0;
        let opponentLinesCleared = 0;

        this.gameInterval = setInterval(() => {
            if (this.isRunning) {
                // Stop the game if either player disconnects
                let ownerResult = this.owner.movePiece('down');
                let opponentResult = this.opponent.movePiece('down');

                    ownerIsGameOver = ownerResult.gameover;
                    opponentIsGameOver = opponentResult.gameover;
                    ownerLinesCleared = ownerResult.linesCleared;
                    opponentLinesCleared = opponentResult.linesCleared;

                    if (ownerLinesCleared > 1) {
                        this.freezeLinesGrid(ownerLinesCleared - 1, this.opponent.grid);
                        io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    }
                    if (opponentLinesCleared > 1) {
                        this.freezeLinesGrid(opponentLinesCleared - 1, this.owner.grid);
                        io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    }

                    io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    io.to(this.owner.id).emit('opponentUpdateGrid', { grid: this.opponent.spectraGrid });
                    io.to(this.opponent.id).emit('opponentUpdateGrid', { grid: this.owner.spectraGrid });

                // Handle gameover logic
                if (ownerIsGameOver) {

                    this.isRunning = false;
                    io.to(this.owner.id).emit('gameOver');
                    io.to(this.opponent.id).emit('win');
                    clearInterval();
                    this.isRunning = false;
                    new StorageProvider().addMutliGame(this.opponent.name, this.owner.name);
                    return;
                }
                if (opponentIsGameOver) {
                    this.isRunning = false;
                    io.to(this.opponent.id).emit('gameOver');
                    io.to(this.owner.id).emit('win');
                    clearInterval();
                    
                    new StorageProvider().addMutliGame(this.owner.name, this.opponent.name);
                    
                    this.isRunning = false;
                    return;
                }
            }
        }, this.intervalTime);
    }
}

module.exports = GravityGame;
