import React, { useEffect } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header({ isLogin = false }) {

    const navigate = useNavigate();

        // Utiliser useEffect pour surveiller les changements de isLogin
        useEffect(() => {
            console.log(`isLogin has changed: ${isLogin}`);
            // Tu peux faire d'autres actions ici si nécessaire
        }, [isLogin]); // Cela va se déclencher à chaque fois que isLogin change

    return (
        <header className="header-container">
            <h1 className="header-title">Red Tetris</h1>
            <nav className="header-nav">
                <ul className="nav-links">
                    <li><a onClick={() => navigate('/')}>Login</a></li>
                    {!isLogin &&
                    <>
                        <li><a onClick={() => navigate('/home')}>Home</a></li>
                        <li><a onClick={() => navigate('/home')}>Scores</a></li>
                    </>
                    }
                </ul>
            </nav>
        </header>
    );
}

export default Header;
