import React, { useState, useEffect, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import GameBoard from '../../components/GameBoard/GameBoard';
import { setSocket, disconnectSocket } from '../../redux/socketSlice'; // Actions Redux
import './SoloGame.css';
import { UserContext } from '../../Context/UserContext';
import AppButton from '../../components/App-Button/AppButton';
import { useNavigate } from 'react-router-dom';

function SoloGame() {
  const dispatch = useDispatch();
  const { username } = useContext(UserContext);
  const socket = useSelector((state) => state.socket.socketInstance);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [gameOver, setGameOver] = useState(false);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;
  const blockDropSound = useRef(null);
  const navigate = useNavigate();

  function createEmptyGrid() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  useEffect(() => {
    blockDropSound.current = new Audio('/bloc.mp3');
  }, []);

  function playDropSound() {
    if (blockDropSound.current) {
      // Stop the previous sound
      blockDropSound.current.pause();
      blockDropSound.current.currentTime = 0; 
  
      // Play the new sound
      blockDropSound.current.play();
    }
  }

  useEffect(() => {
    if (socket === null) {
      const newSocket = io(apiUrl);
      dispatch(setSocket(newSocket));  // Store the socket instance in Redux

      return () => {
        try {
          newSocket.disconnect();
          dispatch(disconnectSocket()); // Disconnect the socket instance in Redux
        } catch (e) {
          console.log('Error disconnecting socket:', e);
        }
      };
    }
  }, [apiUrl, dispatch]);

  useEffect(() => {
    if (socket) {
      socket.emit('joinSoloGame', { playerName: username });

      socket.on('initSolo', (data) => {
        setGrid(data.grid);
      });

      socket.on('updateGridSolo', (data) => {
        setGrid(data.grid);
      });

      socket.on('scoreSolo', (data) => {
        setScore(data.score);
      });

      socket.on('nextPieceSolo', (data) => {
        setNextPiece(data.nextPiece);
      });

      socket.on('gameOverSolo', () => {
        setGameOver(true);
      });

      return () => {
        socket.off('initSolo');
        socket.off('updateGridSolo');
        socket.off('nextPieceSolo');
        socket.off('gameOverSolo');
      };
    }
  }, [socket, username]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!socket || gameOver) return;
      let direction;
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
      socket.emit('movePieceSolo', direction);
      playDropSound();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [socket, gameOver]);

  return (
    <div className='solo-game-container'>
      <GameBoard grid={grid} />
          {nextPiece && (
            <div className="next-piece">
              <GameBoard grid={nextPiece} />
            </div>
          )}
          <h3>Score: {score}</h3>
      {gameOver && 
        <>
          <p className="game-over">Game Over</p> 
          <AppButton onClick={() => navigate('/home')}>GO BACK TO HOME PAGE</AppButton>
        </>
      }
    </div>
  );
}

export default SoloGame;
