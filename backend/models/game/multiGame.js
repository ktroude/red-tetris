
const Game = require('./game');
const PieceManager = require('../piece/pieceManager');

class MultiGame extends Game {
    constructor() {
        super('multi');
        this.pieceManager = new PieceManager();
    }

    start() {
        this.assignNewPiece();
    }

    handleGameOver() {
        const players = Object.values(this.players);
        if (players.some(player => player.checkGameOver())) {
            this.stop();
            const losingPlayer = players.find(player => player.checkGameOver());
            const winningPlayer = players.find(player => !player.checkGameOver());
            return { losingPlayer, winningPlayer };
        }
        return null;
    }

    assignNewPiece() {
        const newPiece = this.pieceManager.getNextPiece();
        this.players[0].setPiece(newPiece);
        this.players[1].setPiece(newPiece);
    }
}

module.exports = MultiGame;
