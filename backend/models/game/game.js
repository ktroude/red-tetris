//game.js

class Game {
    constructor(mode) {
        if (this.constructor === Game) {
            throw new Error("Cannot instantiate abstract class Game directly.");
        }
        this.mode = mode;
        this.players = {};
        this.gameOver = false;
        this.speed = 1000;
        this.level = 1;
    }

    addPlayer(player) {
        this.players[player.id] = player;
    }

    removePlayer(playerId) {
        delete this.players[playerId];
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    start() {
        throw new Error("Method 'start()' must be implemented.");
    }

    handleGameOver() {
        throw new Error("Method 'handleGameOver()' must be implemented.");
    }

    stop() {
        this.gameOver = true;
        console.log("Game stopped.");
    }

    increaseSpeed() {
        this.level++;
        this.speed = Math.max(100, this.speed - 100);
        console.log(`Speed increased to ${this.speed}ms, Level: ${this.level}`);
    }
}

module.exports = Game;
