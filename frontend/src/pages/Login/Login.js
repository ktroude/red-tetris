import React, { useContext, useState } from 'react';
import './Login.css';
import AppButton from '../../components/App-Button/AppButton';
import AppInput from '../../components/App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';

function Login() {
    const { setUsername } = useContext(UserContext);
    const [inputValue, setInputValue] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    function handleClick() {
        if (!checkUserName(inputValue)) {
            setIsError(true);
        } else {
            setUsername(inputValue);
            navigate(`/home`);
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            handleClick();
        }
    }

    function checkUserName(username) {
        const regex = /^[a-zA-Z0-9]{2,15}$/;
        return regex.test(username);
    }

    return (
        <div className="app-container">
            <AppInput
                label={"Your username"}
                placeholder="Username"
                value={inputValue}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
            />
            <AppButton onClick={handleClick}>START</AppButton>
            {isError && <p className="error-message">Error: Roomname must be 2-15 characters long and contain only alphanumeric characters.</p>}
        </div>
    );
}

export default Login;
