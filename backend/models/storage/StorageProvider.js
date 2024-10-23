const fs = require("fs");

const GameType = {
    SOLO: 'SOLO',
    MULTI: 'MULTI'
};

class StorageProvider {

    constructor() {
        this.path = "storage.json";
        this.ensureFileExists(); // Vérifie que le fichier JSON existe, sinon le crée avec une structure vide
    }

    ensureFileExists() {
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, JSON.stringify({ games: [] }, null, 2), 'utf-8');
            // console.log(this.getContent());
        }
        else {
            // console.log(this.getContent());
        }
    }

    // Lecture du contenu du fichier JSON
    getContent() {
        const content = fs.readFileSync(this.path, 'utf-8');
        return JSON.parse(content);
    }

    // Sauvegarde le contenu dans le fichier JSON
    saveContent(content) {
        fs.writeFileSync(this.path, JSON.stringify(content, null, 2), 'utf-8');
    }

    // Ajoute une nouvelle partie avec score, usernames et gagnant
    addMutliGame(winnerUsername, loserUsername) {
        const content = this.getContent();
        const newGame = {
            id: Date.now(), // Utilise le timestamp comme ID unique
            winnerUsername,
            loserUsername,
            gameType : GameType.MULTI
        };
        content.games.push(newGame);
        this.saveContent(content);
        return newGame; // Renvoie le nouvel objet pour confirmation
    }

    addSoloGame(score, username) {
        const content = this.getContent();
        const newGame = {
            id: Date.now(),
            score,
            username,
            gameType: GameType.SOLO
        };

        content.games.push(newGame);
        this.saveContent(content);
        return newGame;
    }

    // Récupère toutes les parties
    getAllGames() {
        const content = this.getContent();
        return content.games;
    }

    // Récupère une partie par son ID
    getGameById(id) {
        const content = this.getContent();
        return content.games.find(game => game.id === id);
    }

    getGamesByUsername(username) {
        const content = this.getContent();

        return content.games.filter(game => game.winnerUsername === username || game.loserUsername === username);
    }
}

// export default StorageProvider;

module.exports = StorageProvider;