import React from 'react';
import './GameBoard.css';

const GameBoard = ({ grid, showBorders = true }) => {
  return (
    <div style={{ minHeight: 60, display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, 30px)` }}>
      {grid.flat().map((cell, index) => {
        let className = 'cell';

        switch (cell) {
          case 0:
              className = 'empty-cell';
            break;
          case 1:
            className += ' cyan';
            break;
          case 2:
            className += ' blue';
            break;
          case 3:
            className += ' orange';
            break;
          case 4:
            className += ' yellow';
            break;
          case 5:
            className += ' green';
            break;
          case 6:
            className += ' purple';
            break;
          case 7:
            className += ' red';
            break;
          case 9:
            className += ' white';
            break;
          default:
            className = 'empty-cell';
            break;
        }

        if (!showBorders) {
          if (className === 'cell empty-cell') {
            className = 'no-display';
          }
          className += ' no-border';
          console.log('classname = ' + className);
        }
        else {
          className += ' border'
        }
        return <div key={index} className={className} />;
      })}
    </div>
  );
};

export default GameBoard;
