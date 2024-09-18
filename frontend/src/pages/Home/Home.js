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
        if (roomName.length > 0 && checkUsername(roomName)) {
            navigate(`/multi/${roomName}/${username}`);
        }
    }

    function navigateToSolo() {
        if (username.length > 0 && checkUsername(username)) {
            console.log("NAV SOLO ", username);
            navigate(`/solo/${username}`);
        }
    }

    return (
        <div className='home-container'>
            {!isMultiChoosen && (
                <>
                    <div className='button-container'>
                        <AppButton onClick={handleClick}>Start Multi</AppButton>
                        <AppButton onClick={() => navigateToSolo()}>Start Solo</AppButton>
                    </div>
                </>
            )}
            {isMultiChoosen && (
                <>
                    <AppInput
                        label="Join a room"
                        placeholder={"Room name to join"}
                        onChange={(event) => handleInputChange(setRoomName, event)}
                    />
                    <AppButton onClick={() => navigateToMulti(roomName)}>PLAY</AppButton>
                </>
            )}
        </div>
    );
}

export default Home;

