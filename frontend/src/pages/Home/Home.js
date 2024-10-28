import React, { useContext, useState } from 'react';
import AppButton from '../../components/App-Button/AppButton';
import AppInput from '../../components/App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import './Home.css';

function Home() {
    const [roomName, setRoomName] = useState('');
    const [isMultiChoosen, setIsMultiChoosen] = useState(false);
    const navigate = useNavigate();
    const { username } = useContext(UserContext);
    const [isError, setIsError] = useState(false);

    const handleInputChange = (setterFunction, event) => {
        setterFunction(event.target.value);
    };

    function handleClick() {
        setIsMultiChoosen(true);
    }

    function checkUsername(username) {
        const regex = /^[a-zA-Z0-9]{2,15}$/;
        return regex.test(username);
    }

    function navigateToMulti() {
        if (!checkUsername(roomName)) {
            setIsError(true);
        } else {
            navigate(`/multi/${roomName}/${username}`);
        }
    }

    function navigateToSolo() {
            navigate(`/solo/${username}`);
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            navigateToMulti();
        }
    }

    return (
        <div className='home-container'>
            {!isMultiChoosen && (
                <>
                    <div className='button-container'>
                        <AppButton onClick={handleClick}>Start Multi</AppButton>
                        <AppButton onClick={() => navigateToSolo()}>Start Solo</AppButton>
                        <AppButton onClick={() => navigate(`/history/${username}`)}>History</AppButton>
                    </div>
                </>
            )}
            {isMultiChoosen && (
                <>
                    <AppInput
                        label="Join a room"
                        placeholder={"Room name to join"}
                        onChange={(event) => handleInputChange(setRoomName, event)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="display-flex-row">
                        <AppButton onClick={() => navigateToMulti(roomName)}>PLAY</AppButton>
                        <AppButton onClick={() => setIsMultiChoosen(false)}>BACK</AppButton>
                    </div>
                    {isError && <p className="error-message">Error: Username must be 2-15 characters long and contain only alphanumeric characters.</p>}
                </>
            )}
        </div>
    );
}

export default Home;

