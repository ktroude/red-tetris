import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isError, setIsError] = useState(false);

  function handleClick() {
    console.log("Username entered: ", username);
    if (!checkUserName(username)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  }

  function checkUserName(username) {
    const regex = /^[a-zA-Z0-9]{2,15}$/;
    return regex.test(username);
  }

  return (
    <div className="app-container">
      <label htmlFor="exampleInput" className="form-label">Your Username</label>

      <input 
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button onClick={handleClick}>PLAY</button>

      {isError && <p className="error-message">Error: Username must be 2-15 characters long and contain only alphanumeric characters.</p>}
    </div>
  );
}

export default App;
