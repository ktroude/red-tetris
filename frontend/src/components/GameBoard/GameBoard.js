import React from 'react';
import './GameBoard.css';

const GameBoard = ({ grid }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, 30px)` }}>
      {grid.flat().map((cell, index) => (
        <div
          key={index}
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: cell === 0 ? 'white' : 'black',
            border: '1px solid gray',
          }}
        />
      ))}
    </div>
  );
};


export default GameBoard;
