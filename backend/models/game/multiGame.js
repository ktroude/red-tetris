
const PieceManager = require('../piece/pieceManager');

class MultiGame {
    constructor(roomId) {
        this.roomId = roomId;
        this.owner = null;
        this.opponent = null;
        this.pieceManager = new PieceManager();
        this.isRunning = false;
        this.OwnerPieceQueue = [];
        this.OpponentPieceQueue = [];
    }

    addOwner(player) {
        this.owner = player;
    }

    addOpponent(player) {
        this.opponent = player;
    }

    removeOpponent() {
        this.opponent = null
    }

    removeOwner(){
        this.owner = null;
    }

    startGameLoop(io, player) {
        this.isRunning = true;
        let isGameOver = false;
        setInterval(() => {
            if (this.isRunning){

                if (player.id === this.owner?.id) {
                    isGameOver = this.owner.movePiece('down');
                    io.to(this.owner.id).emit('updateGrid', { grid: this.owner.grid });
                    io.to(this.opponent.id).emit('opponentUpdateGrid', { grid: this.owner.grid });
                }
                if (player.id === this.opponent?.id) {
                    isGameOver = this.opponent.movePiece('down');
                    io.to(this.opponent.id).emit('updateGrid', { grid: this.opponent.grid });
                    io.to(this.owner.id).emit('opponentUpdateGrid', { grid: this.opponent.grid });
                }

                if (isGameOver) {
                    if (player.id === this.owner?.id){
                        io.to(this.owner.id).emit('gameOver');
                        io.to(this.opponent.id).emit('win');
                    }
                    if (player.id === this.opponent?.id) {
                        io.to(this.opponent.id).emit('gameOver');
                        io.to(this.owner.id).emit('win');
                        return;
                    }
                    this.isRunning = false;
                    console.log('GAME OVER SEND');
                }

            }
        }, 1000);
    }

    distributePieces() {
        if (this.owner && this.opponent) {
            for (let i = 0; i < 5000; i++) {
                const piece = this.pieceManager.getNextPiece();
                piece.x = 5;
                piece.y = 0;
    
                this.owner.nextPieces.push(piece);
                this.opponent.nextPieces.push(piece);
            }
    
            this.owner.generateNewPiece();
            this.opponent.generateNewPiece();
        }
    }
    
    
}

module.exports = MultiGame;
