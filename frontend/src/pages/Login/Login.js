import React, { useContext, useState } from 'react';
import './Login.css';
import AppButton from '../../components/App-Button/AppButton';
import AppInput from '../../components/App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import TetrisBackground from '../../components/Tetris-Background.js/TetrisBackground';

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
        <>
            <TetrisBackground xPercentage={5} yPercentage={10} showBorders={false} />
            <TetrisBackground xPercentage={18} yPercentage={50} showBorders={false} />
            <TetrisBackground xPercentage={13} yPercentage={34} showBorders={false} />
            <TetrisBackground xPercentage={25} yPercentage={82} showBorders={false} />
            <TetrisBackground xPercentage={30} yPercentage={42} showBorders={false} />
            <TetrisBackground xPercentage={35} yPercentage={14} showBorders={false}/>
            <TetrisBackground xPercentage={42} yPercentage={34} showBorders={false} />
            <TetrisBackground xPercentage={50} yPercentage={52} showBorders={false} />
            <TetrisBackground xPercentage={58} yPercentage={21} showBorders={false} />
            <TetrisBackground xPercentage={65} yPercentage={63} showBorders={false} />
            <TetrisBackground xPercentage={72} yPercentage={89} showBorders={false} />
            <TetrisBackground xPercentage={80} yPercentage={2} showBorders={false} />
            <TetrisBackground xPercentage={86} yPercentage={56} showBorders={false} />
            <TetrisBackground xPercentage={93} yPercentage={23} showBorders={false} />
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
        </>
    );
}

export default Login;
