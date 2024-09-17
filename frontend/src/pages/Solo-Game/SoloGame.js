import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import GameBoard from '../../components/GameBoard/GameBoard';
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
    const newSocket = io("http://c2r11p2:5555");
    setSocket(newSocket);

    console.log('Socket connected:', newSocket.id);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && username) {
      socket.emit('joinSoloGame', { playerName: username });

      socket.on('initSolo', (data) => {
        setGrid(data.grid);
      });

      socket.on('updateGridSolo', (data) => {
        setGrid(data.grid);
      });

      socket.on('nextPieceSolo', (data) => {
        setNextPiece(data.nextPiece);
      });

      socket.on('gameOverSolo', () => {
        setGameOver(true);
      });

      return () => {
        socket.off('init');
        socket.off('updateGridSolo');
        socket.off('nextPieceSolo');
        socket.off('gameOverSolo');
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
