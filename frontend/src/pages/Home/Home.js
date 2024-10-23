import React, { useContext, useState } from 'react';
import AppButton from '../../components/App-Button/AppButton';
import AppInput from '../../components/App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import './Home.css';
import TetrisBackground from '../../components/Tetris-Background.js/TetrisBackground';

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
                            onKeyDown={handleKeyDown}
                        />
                        <AppButton onClick={() => navigateToMulti(roomName)}>PLAY</AppButton>
                        {isError && <p className="error-message">Error: Username must be 2-15 characters long and contain only alphanumeric characters.</p>}
                    </>
                )}
            </div>
        </>
    );
}

export default Home;

