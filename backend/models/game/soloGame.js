
const Game = require('./game');

class SoloGame extends Game {
    constructor() {
        super('solo');
    }

    start() {
        this.interval = setInterval(() => {
            this.increaseSpeed();
        }, 30000); // Increase speed every 30s
    }

    handleGameOver(player) {
        if (player.checkGameOver()) {
            this.stop();
            return true;
        }
        return false;
    }
}

module.exports = SoloGame;
