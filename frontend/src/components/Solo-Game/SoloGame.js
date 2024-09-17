import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import GameBoard from '../GameBoard/GameBoard';
import { UserContext } from '../../Context/UserContext';
import './SoloGame.css'

function SoloGame() {
  const { username } = useContext(UserContext);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [gameOver, setGameOver] = useState(false);
  const [socket, setSocket] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);

  function createEmptyGrid() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  useEffect(() => {
    const newSocket = io("http://c4r1p3:5555");
    setSocket(newSocket);

    console.log('Socket connected:', newSocket.id);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && username) {
      console.log('Username:', username);
      socket.emit('joinSoloGame', { playerName: username });

      socket.on('init', (data) => {
        console.log('Init data received:', data);
        setGrid(data.grid);
      });

      socket.on('updateGrid', (data) => {
        console.log('Grid update received:', data);
        setGrid(data.grid);
      });

      socket.on('nextPiece', (data) => {
        setNextPiece(data.nextPiece);
      });

      socket.on('gameOver', (data) => {
        console.log('Game Over event received:', data);
        setGameOver(true);
      });

      return () => {
        socket.off('init');
        socket.off('updateGrid');
        socket.off('nextPiece');
        socket.off('gameOver');
      };
    }
  }, [socket, username]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!socket) return;
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
          break;grid={nextPiece}
        case 'ArrowUp':
          direction = 'rotate';
          break;
        case ' ':
          direction = 'space';
          break;
        default:
          return;
      }
      console.log('Piece moved:', direction);
      socket.emit('movePiece', direction); // Emit the direction to move the piece
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [socket]);

  return (
    <div className='solo-game-container'>
      <GameBoard grid={grid} />
          {nextPiece && (
            <div className="next-piece">
              <GameBoard grid={nextPiece} />
            </div>
          )}
      {gameOver && <p className="game-over">Game Over</p>}
    </div>
  );
}

export default SoloGame;
