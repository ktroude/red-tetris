import React, { useState } from 'react';
import { SHAPES } from './shapes';
import GameBoard from '../GameBoard/GameBoard';
import './TetrisBackground.css';

const getRandomShape = () => {
  const shapes = Object.values(SHAPES);
  return shapes[Math.floor(Math.random() * shapes.length)];
};

const TetrisBackground = ({ xPercentage, yPercentage }) => {
  const [currentPiece] = useState(getRandomShape());
  const timer = getRandomTimer(2, 7);

  function getRandomTimer(min, max) {
    return Math.random() * (max - min) + min;
  }

  const pieceStyle = {
    left: `${xPercentage}%`,
    bottom: `${yPercentage}%`,
    position: 'absolute',
    animation: `fall linear ${timer}s infinite`,
  };

  return (
      <div className="falling-piece" style={pieceStyle}>
        <GameBoard grid={currentPiece} showBorders={false} />
      </div>
  );
};

export default TetrisBackground;
