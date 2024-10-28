import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import './History.css';
import '../Home/Home.css';

function History() {
    const { username } = useContext(UserContext);
    const apiUrl = process.env.REACT_APP_API_URL; // Get the API URL from environment variables
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!username) return;

        const fetchHistory = async () => {
            try {
                const response = await axios.post(apiUrl + '/history', { username });
                console.log(response.data);
                setHistory(response.data); // Mettre à jour l’état ici
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

    const scoreItemStyle = {
        backgroundColor: '#333', // Fond sombre
        color: 'white', // Couleur du texte
        border: '1px solid #ff0000', // Bord rouge
        borderRadius: '5px', // Coins arrondis
        padding: '10px', // Espacement interne
        margin: '0', // Enlever les marges pour éviter l'espacement
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)', // Ombre pour effet de profondeur
        transition: 'transform 0.2s', // Transition pour effet de survol
    };

    return (
        <div className='home-container'>
            <div className='history-container scrollable home-container-scrollable'>
                {history && history.length > 0 ? (
                    history.map((match) => (
                        <div key={match.id} style={scoreItemStyle}>
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
