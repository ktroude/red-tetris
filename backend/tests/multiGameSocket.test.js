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

    // Test case for trying to join a full room
    test('should not allow joining a full room', (done) => {
        const roomId = 'room1';

        // The first player joins as the owner
        clientSocket1.emit('joinMultiGame', { playerName: 'Owner', requestedRoom: roomId });

        // The second player joins as the opponent
        clientSocket2.emit('joinMultiGame', { playerName: 'Opponent', requestedRoom: roomId });

        // A third client tries to join
        const clientSocket3 = new Client(`http://localhost:${io.httpServer.address().port}`);
        clientSocket3.emit('joinMultiGame', { playerName: 'ExtraPlayer', requestedRoom: roomId });

        clientSocket3.on('roomFull', (isFull) => {
            expect(isFull).toBe(true); // Verify that the room is full
            clientSocket3.close();
            done();
        });
    });

    // // Test case for starting the game and emitting nextPiece to both players
    // test('should emit nextPiece to both players when the game starts', (done) => {
    //     const roomId = 'room1';
    //     const ownerName = 'Owner';
    //     const opponentName = 'Opponent';
        
    //     // The owner and opponent join the game
    //     clientSocket1.emit('joinMultiGame', { playerName: ownerName, requestedRoom: roomId });
    //     clientSocket2.emit('joinMultiGame', { playerName: opponentName, requestedRoom: roomId });

    //     clientSocket1.on('ownerIsHere', () => {
    //         clientSocket1.emit('gameStart');
    //     });

    //     clientSocket1.on('nextPiece', (data) => {
    //         expect(data).toHaveProperty('nextPiece'); // Verify that the nextPiece is sent
    //         done();
    //     });

    //     clientSocket2.on('nextPiece', (data) => {
    //         expect(data).toHaveProperty('nextPiece'); // Verify that the opponent receives nextPiece
    //     });
    // });

    // Test case for handling opponent disconnection and notifying the owner
    test('should handle opponent disconnection and notify the owner', (done) => {
        const roomId = 'room1';
        const ownerName = 'Owner';
        const opponentName = 'Opponent';

        // The owner and opponent join the game
        clientSocket1.emit('joinMultiGame', { playerName: ownerName, requestedRoom: roomId });
        clientSocket2.emit('joinMultiGame', { playerName: opponentName, requestedRoom: roomId });

        clientSocket2.on('ownerIsHere', () => {
            clientSocket2.close(); // Disconnect the opponent
        });

        clientSocket1.on('win', (message) => {
            expect(message).toHaveProperty('message', 'You win!'); // Verify the owner receives win message
            done();
        });
    });

    // Test case for handling owner disconnection and notifying the opponent
    test('should handle owner disconnection and notify the opponent', (done) => {
        const roomId = 'room1';
        const ownerName = 'Owner';
        const opponentName = 'Opponent';

        // The owner and opponent join the game
        clientSocket1.emit('joinMultiGame', { playerName: ownerName, requestedRoom: roomId });
        clientSocket2.emit('joinMultiGame', { playerName: opponentName, requestedRoom: roomId });

        clientSocket1.on('opponentJoined', () => {
            clientSocket1.close(); // Disconnect the owner
        });

        clientSocket2.on('win', (message) => {
            expect(message).toHaveProperty('message', 'You win!'); // Verify the opponent receives win message
            done();
        });
    });

});
