import React, { useContext, useState } from 'react';
import './Login.css';
import AppButton from '../../components-utils/App-Button/AppButton';
import AppInput from '../../components-utils/App-Input/AppInput';
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
        console.log("Username entered: ", inputValue);
        if (!checkUserName(inputValue)) {
            setIsError(true);
        } else {
            setUsername(inputValue);
            navigate(`/home`);
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
                onChange={handleInputChange}
            />
            <AppButton onClick={handleClick}>START</AppButton>

            {isError && <p className="error-message">Error: Username must be 2-15 characters long and contain only alphanumeric characters.</p>}
        </div>
    );
}

export default Login;
