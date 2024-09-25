const { Server } = require('socket.io');
const Client = require('socket.io-client');
const soloGameHandler = require('../sockets/soloGameSocket');

describe('SoloGame Socket.IO', () => {
    let io, serverSocket, clientSocket;

    // Set up a new server and client before each test
    beforeEach((done) => {
        // Create an instance of the Socket.IO server
        io = new Server(3000); // Port 3000

        // Pass the server instance to the soloGameHandler (which is a function, not a class)
        soloGameHandler(io);  // This will invoke your soloGameSocket function.

        // Create a client to connect to the server
        clientSocket = new Client('http://localhost:3000');

        // Listen for the 'connect' event from the server
        io.on('connection', (socket) => {
            serverSocket = socket;
            done();
        });

        clientSocket.on('connect', () => {});
    });

    // Shutdown the server and client after each test
    afterEach(() => {
        io.close();
        clientSocket.close();
    });

    test('should establish a socket connection', (done) => {
        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBeTruthy();
            done();
        });
    });

    test('should handle joinSoloGame event', (done) => {
        const playerName = 'Player1';

        // Listen for the 'initSolo' and 'nextPieceSolo' events
        clientSocket.on('initSolo', (data) => {
            expect(data.grid).toBeDefined(); // Make sure the grid is sent back
        });

        clientSocket.once('nextPieceSolo', (data) => {
            expect(data.nextPiece).toBeDefined(); // Make sure the next piece is sent back
            done(); // Finish the test once both events are received
        });

        // Emit 'joinSoloGame' event from the client
        clientSocket.emit('joinSoloGame', { playerName });
    });

    test('should handle movePieceSolo event', (done) => {
        const playerName = 'Player1';

        // Listen for the 'updateGridSolo' and 'nextPieceSolo' events
        clientSocket.on('updateGridSolo', (data) => {
            expect(data.grid).toBeDefined(); // Check if grid is updated
        });

        clientSocket.once('nextPieceSolo', (data) => {
            expect(data.nextPiece).toBeDefined(); // Check if the next piece is sent back
            done(); // Finish the test after this
        });

        // Emit 'joinSoloGame' to initialize the game
        clientSocket.emit('joinSoloGame', { playerName });

        // Simulate a piece movement event
        clientSocket.emit('movePieceSolo', 'down');
    });

    test('should handle game over scenario', (done) => {
        const playerName = 'Player1';
    
        // Emit 'joinSoloGame' to initialize the game
        clientSocket.emit('joinSoloGame', { playerName });
    
        // Simulate gameover after player initialization
        clientSocket.on('nextPieceSolo', () => {
            serverSocket.player = {
                isPlaying: true,
                movePiece: jest.fn().mockReturnValueOnce({ gameover: true, linesCleared: 0 }),
                nextPieces: [{ shape: 'I' }],
                grid: Array(20).fill(Array(10).fill(0)),
                score: 0
            };
    
            // Simulate gameover mouvement
            clientSocket.emit('movePieceSolo', 'down');
        });
    
        // Check gameover is send
        clientSocket.once('gameOverSolo', (data) => {
            expect(data.message).toBe('Game Over');
            done();
        });
    });

});
