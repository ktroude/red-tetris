import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import GameBoard from '../../components/GameBoard/GameBoard';
import { UserContext } from '../../Context/UserContext';
import "./MultiGame.css";

function MultiGame() {
  const { username } = useContext(UserContext);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [opponentGrid, setOpponentGrid] = useState(createEmptyGrid()); // Opponent's grid
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [opponentName, setOpponentName] = useState(null);
  const [socket, setSocket] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const { roomName } = useParams(); 
  const [roomname, setRoomname] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isRoomFull, setIsRoomFull] = useState(false);

  function createEmptyGrid() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  useEffect(() => {
    if (roomName) {
      setRoomname(roomName);
    }
  }, [roomName]);

  useEffect(() => {
    if (socket === null) {
      const newSocket = io("http://c2r11p2:5555");
      setSocket(newSocket);
      
      console.log('Socket connected:', newSocket.id);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (socket && username) {
      // Join a multiplayer room
      socket.emit('joinMultiGame', { playerName: username, requestedRoom: roomname });

      socket.on('GameReady', ()=> {
        socket.emit('gameStart');
      })

      // Initialize the grid and game state
      socket.on('init', (data) => {
        setGrid(data.grid);
      });

      // Define the room owner
      socket.on('isOwner', () => {
        setIsOwner(true);
      });

      // Check if the room is full
      socket.on('roomFull', () => {
        setIsRoomFull(true);
      });

      // Update the grid
      socket.on('updateGrid', (data) => {
        console.log("grid updated", data);
        setGrid(data.grid);
      });

      // Update the opponent's grid
      socket.on('opponentUpdateGrid', (data) => {
        console.log("opponent's grid updated", data);
        setOpponentGrid(data.grid);
      });

      // Track the next piece
      socket.on('nextPiece', (data) => {
        setNextPiece(data.nextPiece);
      });

      // Track the opponent's name
      if (isOwner) {
        socket.on('opponentJoined', (data) => {
          console.log('opponent name : ', data);
          setOpponentName(data);
        });
      } else {
        socket.on('ownerIsHere', (data) => {
          setOpponentName(data);
        });
      }

      // Handle game over event
      socket.on('gameOver', () => {
        setGameOver(true);
      });

      // Handle win event
      socket.on('win', () => {
        setWin(true);
      });

      return () => {
        socket.off('init');
        socket.off('updateGrid');
        socket.off('opponentUpdateGrid');
        socket.off('nextPiece');
        socket.off('opponentJoined');
        socket.off('gameOver');
        socket.off('win');
      };
    }
  }, [socket, username, roomname, isOwner]);

  // Handle movement
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
      socket.emit('movePiece', direction);
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [socket]);

  return (
    <>
    {isRoomFull && <p>This room is full, try an other one</p>}
      {(isOwner && !isRoomFull) && (
        <div className="multi-game-container">
          <div className="player-section">
            <p>{username}'s Game</p>
            <GameBoard grid={grid} />
            {nextPiece && (
              <div className="next-piece">
                <GameBoard grid={nextPiece} />
              </div>
            )}
            {gameOver && <p className="game-over">Game Over</p>}
          </div>
          
          <div className="opponent-section">
            <p>{opponentName || "Waiting for opponent..."}</p>
            <GameBoard grid={opponentGrid} />
          </div>
        </div>
      )}
      {(!isOwner && !isRoomFull) && (
        <div className="multi-game-container">
          <div className="player-section">
            <p>{username}</p>
            <GameBoard grid={grid} />
            {nextPiece && (
              <div className="next-piece">
                <GameBoard grid={nextPiece} />
              </div>
            )}
            {gameOver && <p className="game-over">Game Over</p>}
            {win && <p className="win">You Win !</p>}
          </div>

          <div className="opponent-section">
            <p>{opponentName}'s Game</p>
            <GameBoard grid={opponentGrid} />
          </div>
        </div>
      )}
    </>
  );

}

export default MultiGame;
