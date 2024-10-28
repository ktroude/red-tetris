import React, { useContext, useState, useEffect } from 'react';
import AppButton from '../../components/App-Button/AppButton';
import AppInput from '../../components/App-Input/AppInput';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './History.css';
import '../Home/Home.css';

function History() {
    const { username } = useContext(UserContext);
    const apiUrl = process.env.REACT_APP_API_URL;  // Get the API URL from environment variables
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!username) return;

        const fetchHistory = async () => {
            try {
                const response = await axios.post(apiUrl + '/history', { username });
                console.log(response.data);
                setHistory(response.data);  // Mettre à jour l’état ici
            } catch (e) {
                console.log(e);
            }
        };

        fetchHistory();
    }, [username]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className='home-container'>
            <AppButton onClick={() => navigate('/home')}>GO BACK TO HOME PAGE</AppButton>
            <div className='history-container scrollable home-container-scrollable'>
                {history && history.length > 0 ? (
                    history.map((match) => (
                        <div key={match.id}>
                            {match.gameType === "SOLO" ? (
                                <div>
                                    <p><strong>Game Date:</strong> {formatDate(match.id)}</p>
                                    <p><strong>Username:</strong> {match.username}</p>
                                    <p><strong>Score:</strong> {match.score}</p>
                                    <p><strong>Game Type:</strong> Solo</p>
                                </div>
                            ) : (
                                <div>
                                    <p><strong>Game Date:</strong> {formatDate(match.id)}</p>
                                    <p><strong>Winner:</strong> {match.winnerUsername}</p>
                                    <p><strong>Loser:</strong> {match.loserUsername}</p>
                                    <p><strong>Game Type:</strong> Multiplayer</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No match history available.</p>
                )}
            </div>
        </div>
    );
}

export default History;