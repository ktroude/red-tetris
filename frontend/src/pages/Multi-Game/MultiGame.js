import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import GameBoard from '../../components/GameBoard/GameBoard';
import { setSocket, disconnectSocket } from '../../redux/socketSlice'; // Redux actions to manage socket instance
import "./MultiGame.css";
import { UserContext } from '../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../components/App-Button/AppButton';
import { GamemodeContext } from '../../Context/GamemodeContext';

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
  const blockDropSound = useRef(null);  // Ref to store the block drop sound
  const { gamemode } = useContext(GamemodeContext);

  useEffect(() => {
    blockDropSound.current = new Audio('/bloc.mp3');
  }, []);

  function playDropSound () {
    if (blockDropSound.current) {
      blockDropSound.current.play();
    }
  };
  const navigate = useNavigate();

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
    blockDropSound.current = new Audio('/bloc.mp3');
  }, []);

  function playDropSound () {
    if (blockDropSound.current) {
      blockDropSound.current.play();
    }
  };

  // Helper function to create an empty grid (20x10 matrix)
  function createEmptyGrid() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  useEffect(() => {
    if (socket && roomName) {
      // Join the multiplayer game room
      socket.emit('joinMultiGame', { playerName: username, requestedRoom: roomName, gamemode: gamemode });

      socket.on('init', (data) => {
        setGrid(data.grid);  // Initialize the player's grid
      });

      socket.on('restart', () => {
        setGameOver(false);  // Reset game over state
        setWin(false);  // Reset win state
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
        console.log("data = " + data);
        if (data.grid) {
          setOpponentGrid(data.grid);  // Update the opponent's grid
        }
      });

      socket.on('nextPiece', (data) => {
        console.log("nextPiece from ", username, "  "  , data);
        setNextPiece(data.nextPiece);  // Update the next piece
      });

      socket.on('gameOver', () => {
        setIsPlayButtonDisplayed(true);
        setGameOver(true);  // Handle game over event
      });

      socket.on('win', () => {
        setIsPlayButtonDisplayed(true);
        setWin(true);  // Handle win event
      });

      // Cleanup event listeners on component unmount
      return () => {
        socket.off('init');
        socket.off('isOwner');
        socket.off('roomFull');
        socket.off('updateGrid');
        socket.off('opponentUpdateGrid');
        socket.off('nextPiece');
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
          console.log("opponentJoined = " + data);
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
      if (!socket || win || gameOver)
        {
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
      playDropSound();
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
      {isRoomFull && 
        <div className="multi-game-container">
          <p className='error-message'>This room is full, try another one</p>
        </div>
      }

      {(isOwner && !isRoomFull) && (
        <div className="multi-game-container">
          <div className="player-section">
          {(!win && gameOver) && <p className="game-over">Game Over</p>}  {/* Display game over message */}
            {(!gameOver && win) && <p className="win">You Win!</p>}  {/* Display win message */}
            <p className='text'>{username}'s Game</p>
            <GameBoard grid={grid} />  {/* Render the player's game board */}
            {nextPiece && !isPlayButtonDisplayed && (
              <div className="next-piece">
                <GameBoard grid={nextPiece} showBorders={false} />  {/* Render the next piece */}
              </div>
            )}
            {(isPlayButtonDisplayed && isOwner) && 
              <div className="play-button">
                <AppButton classe={'litle'}  onClick={handleStartGame}>Play</AppButton>
                { gameOver && 
                  <AppButton onClick={() => navigate('/home')}>GO BACK</AppButton>
                }

              </div>
            }  
          </div>
          <div className="opponent-section">
            <p className='text'>{opponentName || "Waiting for opponent..."}</p>  {/* Display opponent's name or waiting message */}
            {opponentName && <GameBoard grid={opponentGrid} />}
          </div>
        </div>
      )}
      

      {(!isOwner && !isRoomFull) && (
        <div className="multi-game-container">
          <div className="player-section">
            {(!win && gameOver) && <p className="game-over">Game Over</p>}  {/* Display game over message */}
            {(!gameOver && win) && <p className="win">You Win!</p>}  {/* Display win message */}
            <p className='text'>{username}</p>
            <GameBoard grid={grid} />  {/* Render the player's game board */}
            {nextPiece && (
              <div className="next-piece">
                <GameBoard grid={nextPiece} showBorders={false} />  {/* Render the next piece */}
              </div>
            )}
            {gameOver && <p className="game-over">Game Over</p>}  {/* Display game over message */}
            
            {win && <p className="win">You Win!</p>}  {/* Display win message */}
          </div>
          {gameOver && 
            <AppButton onClick={() => navigate('/home')}>GO BACK TO HOME PAGE</AppButton>
          }

          <div className="opponent-section">
            <p className='text'>{opponentName}'s Game</p>  {/* Display opponent's name */}
            <GameBoard grid={opponentGrid} />  {/* Render the opponent's game board */}
          </div>
        </div>
      )}
    </>
  );
}

export default MultiGame;
