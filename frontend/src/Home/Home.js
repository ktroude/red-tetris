import React, { useContext, useState } from 'react';
import AppButton from '../App-Button/AppButton';
import AppInput from '../App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';
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

    function checkUserName(username) {
        const regex = /^[a-zA-Z0-9]{2,15}$/;
        return regex.test(username);
    }

    function navigateToMulti(name) {
        if (name.length > 0 && checkUserName(name)) {
            navigate(`/multi/${name}`);
        }
    }

    function navigateToSolo() {
        if (username.length > 0 && checkUserName(username)) {
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
                        label="Join an opponent"
                        placeholder={"Opponent username"}
                        onChange={(event) => handleInputChange(setRoomName, event)}
                    />
                    <AppButton onClick={() => navigateToMulti(roomName)}>JOIN</AppButton>
                    <p className='form-label'>OR CREATE YOUR GAME</p>
                    <AppButton onClick={() => navigateToMulti(username)}>CREATE</AppButton>
                </>
            )}
        </div>
    );
}

export default Home;

