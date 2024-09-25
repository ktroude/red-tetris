const { Server } = require('socket.io');
const Client = require('socket.io-client');
const multiGameHandler = require('../sockets/multiGameSocket');

describe('MultiGame Socket.IO', () => {
    let io, serverSocket1, serverSocket2, clientSocket1, clientSocket2;

    beforeEach((done) => {
        // Create a Socket.IO server on a random available port
        io = new Server(); // Create the server without passing a port
        multiGameHandler(io);
        
        // Start the server
        io.listen(0); // Let the system assign an available port

        // Retrieve the dynamic port assigned to the server
        const port = io.httpServer.address().port;

        // Create two clients: one for the owner and one for the opponent
        clientSocket1 = new Client(`http://localhost:${port}`); // Owner
        clientSocket2 = new Client(`http://localhost:${port}`); // Opponent

        // Wait until both clients are connected
        let connectedClients = 0;

        io.on('connection', (socket) => {
            if (connectedClients === 0) {
                serverSocket1 = socket; // First player (Owner)
                connectedClients++;
            } else if (connectedClients === 1) {
                serverSocket2 = socket; // Second player (Opponent)
                connectedClients++;
                done(); // Both clients are connected, we can start the tests
            }
        });
    });

    afterEach(() => {
        // Close the server and client sockets safely
        if (io) {
            io.close();
        }
        if (clientSocket1) {
            clientSocket1.close();
        }
        if (clientSocket2) {
            clientSocket2.close();
        }
    });

    test('should assign owner and opponent on joinMultiGame', (done) => {
        const ownerName = 'Owner';
        const opponentName = 'Opponent';
        const roomId = 'room1';

        // Owner joins the game
        clientSocket1.emit('joinMultiGame', { playerName: ownerName, requestedRoom: roomId });

        // Verify that client 1 is the owner
        clientSocket1.on('isOwner', (isOwner) => {
            expect(isOwner).toBe(true);
        });

        // Opponent joins the same game
        clientSocket2.emit('joinMultiGame', { playerName: opponentName, requestedRoom: roomId });

        // Verify that client 2 is the opponent
        clientSocket2.on('ownerIsHere', (owner) => {
            expect(owner).toBe(ownerName); // Ensure the opponent knows the owner
        });

        // Verify that the opponent is correctly added
        clientSocket1.on('opponentJoined', (opponent) => {
            expect(opponent).toBe(opponentName); // Ensure the owner knows the opponent
            done(); // Test is done
        });
    }, 10000); // Set timeout to 10 seconds

    test('should start game and distribute pieces to both players', (done) => {
        const ownerName = 'Owner';
        const opponentName = 'Opponent';
        const roomId = 'room1';

        // Owner joins the game
        clientSocket1.emit('joinMultiGame', { playerName: ownerName, requestedRoom: roomId });

        // Opponent joins the game
        clientSocket2.emit('joinMultiGame', { playerName: opponentName, requestedRoom: roomId });

        // Start the game
        clientSocket1.on('ownerIsHere', () => {
            clientSocket1.emit('gameStart'); // Owner starts the game
        });

        // Verify that both players receive a piece
        let piecesReceived = 0;

        const checkGameStarted = () => {
            piecesReceived++;
            if (piecesReceived === 2) {
                done(); // Both players have received their first piece, test done
            }
        };

        clientSocket1.on('GameReady', (nextPiece) => {
            expect(nextPiece).toBeDefined(); // Verify the owner receives a piece
            checkGameStarted();
        });

        clientSocket2.on('GameReady', (nextPiece) => {
            expect(nextPiece).toBeDefined(); // Verify the opponent receives a piece
            checkGameStarted();
        });
    }, 10000); // Set timeout to 10 seconds
});
