import React, { useState } from 'react';
import './Login.css';
import AppButton from '../App-Button/AppButton';
import AppInput from '../App-Input/AppInput';

function Login() {
    const [username, setUsername] = useState('');
    const [isError, setIsError] = useState(false);

    const handleInputChange = (event) => {
      setUsername(event.target.value);
    };


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
        <AppInput
            placeholder="Username"
            onChange={handleInputChange}
        />
        <AppButton onClick={handleClick}>PLAY</AppButton>
  
        {isError && <p className="error-message">Error: Username must be 2-15 characters long and contain only alphanumeric characters.</p>}
      </div>
    );
  }
  
  export default Login;
  