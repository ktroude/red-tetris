import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import GameBoard from '../../components/GameBoard/GameBoard';
import { setSocket, disconnectSocket } from '../../redux/socketSlice'; // Redux actions to manage socket instance
import "./MultiGame.css";
import { UserContext } from '../../Context/UserContext';

function MultiGame() {
  const dispatch = useDispatch();
  const { username } = useContext(UserContext);  // Retrieve username from UserContext
  const socket = useSelector((state) => state.socket.socketInstance); // Get the socket instance from Redux store
  const [grid, setGrid] = useState(createEmptyGrid()); // State to track the player's grid
  const [opponentGrid, setOpponentGrid] = useState(createEmptyGrid()); // State to track the opponent's grid
  const [gameOver, setGameOver] = useState(false);  // State to track game over condition
  const [win, setWin] = useState(false);  // State to track win condition
  const [opponentName, setOpponentName] = useState(null);  // State to store the opponent's name
  const [nextPiece, setNextPiece] = useState(null);  // State to track the next piece to be played
  const { roomName } = useParams();  // Retrieve room name from the URL parameters
  const [isOwner, setIsOwner] = useState(false);  // State to track if the player is the room owner
  const [isRoomFull, setIsRoomFull] = useState(false);  // State to track if the room is full
  const apiUrl = process.env.REACT_APP_API_URL;  // Get the API URL from environment variables
  const [isPlayButtonDisplayed, setIsPlayButtonDisplayed] = useState(true);  // State to display the play button
  // Helper function to create an empty grid (20x10 matrix)
  function createEmptyGrid() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  // Socket setup and cleanup
  useEffect(() => {
    if (socket === null) {
      const newSocket = io(apiUrl);  // Create a new socket connection
      dispatch(setSocket(newSocket));  // Store the socket instance in Redux

      return () => {
        try {
          newSocket.disconnect();  // Disconnect the socket on cleanup
          dispatch(disconnectSocket());  // Reset the socket instance in Redux
        } catch (e) {
          console.error('Error disconnecting socket:', e);
        }
      };
    }
  }, [apiUrl, dispatch]);

  useEffect(() => {
    if (socket && roomName) {
      // Join the multiplayer game room
      socket.emit('joinMultiGame', { playerName: username, requestedRoom: roomName });

      socket.on('init', (data) => {
        setGrid(data.grid);  // Initialize the player's grid
      });

      socket.on('isOwner', () => {
        setIsOwner(true);  // Set the player as the room owner
      });

      socket.on('roomFull', () => {
        setIsRoomFull(true);  // Set the room as full
      });

      socket.on('updateGrid', (data) => {
        setGrid(data.grid);  // Update the player's grid
      });

      socket.on('opponentUpdateGrid', (data) => {
        setOpponentGrid(data.grid);  // Update the opponent's grid
      });

      socket.on('nextPiece', (data) => {
        console.log("nextPiece from ", username  , "  "  ,data  );
        setNextPiece(data.nextPiece);  // Update the next piece
      });

      socket.on('gameOver', () => {
        setIsPlayButtonDisplayed(true);
        setGameOver(true);  // Handle game over event
      });

      socket.on('win', () => {
        setWin(true);  // Handle win event
      });

      // Cleanup event listeners on component unmount
      return () => {
        socket.off('init');
        socket.off('updateGrid');
        socket.off('isOwner');
        socket.off('roomFull');
        socket.off('opponentUpdateGrid');
        socket.off('nextPiece');
        socket.off('opponentJoined');
        socket.off('ownerIsHere');
        socket.off('gameOver');
        socket.off('win');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      // Handle opponent-related events
      if (isOwner) {
        socket.on('opponentJoined', (data) => {
          setOpponentName(data);  // Set the opponent's name when they join
        });
      } else {
        socket.on('ownerIsHere', (data) => {
          setOpponentName(data);  // Set the room owner's name
        });
      }
    }
  });

  // Handle player movement and key presses
  useEffect(() => {
    const handleKeyPress = (e) => {
      console.log("handleKeyPress from ", username  , "  "  ,e  );
      if (!socket || win || gameOver)
        {
          console.log("return from ", username  , "  "  );
          console.log("socket from ", username  , "  "  ,socket?.id  );
          console.log("win from ", username  , "  "  ,win  );
          console.log("gameOver from ", username  , "  "  ,gameOver  );
          return;
        }
      let direction;
      // Map key presses to movement directions
      switch (e.key) {
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowUp':
          direction = 'rotate';
          break;
        case ' ':
          direction = 'space';
          break;
        default:
          return;
      }
      // Emit the movement event to the server
      socket.emit('movePiece', direction);
          console.log("socket from ", username  , "  "  ,socket?.id  );
          console.log("movePiece from ", username  , "  "  ,direction  );
    };

    document.addEventListener('keydown', handleKeyPress);  // Add keydown event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);  // Remove event listener on cleanup
    };
  }, [socket, gameOver, win]);


  function handleStartGame() {
    if (socket && opponentName) {
      socket.emit('launchGame');
      setIsPlayButtonDisplayed(false);  // Hide the play button
      setGameOver(false);  // Reset game over state
      setWin(false);  // Reset win state
    }
  }

  return (
    <>
      {isRoomFull && <p>This room is full, try another one</p>}  {/* Show message if the room is full */}
      
      {(isOwner && !isRoomFull) && (
        <div className="multi-game-container">
          <div className="player-section">
            <p>{username}'s Game</p>
            <GameBoard grid={grid} />  {/* Render the player's game board */}
            {nextPiece && (
              <div className="next-piece">
                <GameBoard grid={nextPiece} />  {/* Render the next piece */}
              </div>
            )}
            {gameOver && <p className="game-over">Game Over</p>}  {/* Display game over message */}
            {win && <p className="win">You Win!</p>}  {/* Display win message */}
            {isPlayButtonDisplayed && <button onClick={handleStartGame}>Play</button>}  {/* Display play button */}
          </div>
          
          <div className="opponent-section">
            <p>{opponentName || "Waiting for opponent..."}</p>  {/* Display opponent's name or waiting message */}
            <GameBoard grid={opponentGrid} />  {/* Render the opponent's game board */}
          </div>
        </div>
      )}
      
      {(!isOwner && !isRoomFull) && (
        <div className="multi-game-container">
          <div className="player-section">
            <p>{username}</p>
            <GameBoard grid={grid} />  {/* Render the player's game board */}
            {nextPiece && (
              <div className="next-piece">
                <GameBoard grid={nextPiece} />  {/* Render the next piece */}
              </div>
            )}
            {gameOver && <p className="game-over">Game Over</p>}  {/* Display game over message */}
            {win && <p className="win">You Win!</p>}  {/* Display win message */}
          </div>

          <div className="opponent-section">
            <p>{opponentName}'s Game</p>  {/* Display opponent's name */}
            <GameBoard grid={opponentGrid} />  {/* Render the opponent's game board */}
          </div>
        </div>
      )}
    </>
  );
}

export default MultiGame;
