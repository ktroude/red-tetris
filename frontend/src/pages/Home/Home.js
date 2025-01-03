import React, { useContext, useState } from 'react';
import AppButton from '../../components/App-Button/AppButton';
import AppInput from '../../components/App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import { GamemodeContext } from '../../Context/GamemodeContext';
import './Home.css';
import TetrisBackground from '../../components/Tetris-Background.js/TetrisBackground';

function Home() {
    const [roomName, setRoomName] = useState('');
    const [isMultiChoosen, setIsMultiChoosen] = useState(false);
    const navigate = useNavigate();
    const { username } = useContext(UserContext);
    const [isError, setIsError] = useState(false);
    const {gamemode, setGamemode, GamemodeType} = useContext(GamemodeContext);


    console.log(GamemodeType);

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
        <>
            <TetrisBackground xPercentage={3} />
            <TetrisBackground xPercentage={11} />
            <TetrisBackground xPercentage={19} />
            <TetrisBackground xPercentage={27} />
            <TetrisBackground xPercentage={35} />
            <TetrisBackground xPercentage={43} />
            <TetrisBackground xPercentage={51} />
            <TetrisBackground xPercentage={59} />
            <TetrisBackground xPercentage={67} />
            <TetrisBackground xPercentage={75} />
            <TetrisBackground xPercentage={83} />
            <TetrisBackground xPercentage={91} />
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
                        <p className="white-text">Select a gamemode</p>
                         <div className="display-flex-row">
                            {GamemodeType &&
                                GamemodeType.map((type) => {
                                    const isSelected = gamemode === type; // Vérifie si le mode de jeu est sélectionné
                                    return (
                                        <AppButton
                                            key={type}
                                            onClick={() => setGamemode(type)} // Met à jour le mode de jeu dans le contexte
                                            classe={isSelected ? 'selected-gamemode' : ''} // Applique une classe CSS si sélectionné
                                        >
                                            {type}
                                        </AppButton>
                                    );
                                })
                            }
                        </div>
                        <div className="display-flex-row">
                            <AppButton onClick={() => navigateToMulti(roomName)}>PLAY</AppButton>
                            <AppButton onClick={() => setIsMultiChoosen(false)}>BACK</AppButton>
                        </div>
                        {isError && <p className="error-message">Error: Username must be 2-15 characters long and contain only alphanumeric characters.</p>}
                    </>
                )}
            </div>
        </>
    );
}

export default Home;

