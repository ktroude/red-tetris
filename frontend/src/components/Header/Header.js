import React, { useEffect, useState } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header({ isLogin = false, musicRef }) {
    const navigate = useNavigate();
    const [volume, setVolume] = useState(0.5); // Initial volume set to 0.5
    const [isVolumeControlVisible, setVolumeControlVisible] = useState(false); // State to control the visibility of the volume control box
    const [timer, setTimer] = useState(null); // State to manage the timer

    // Load volume from localStorage when the component mounts
    useEffect(() => {
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) {
            const parsedVolume = parseFloat(savedVolume);
            setVolume(parsedVolume); // Set the volume state
            if (musicRef?.current) {
                musicRef.current.volume = parsedVolume; // Apply the volume to the music
            }
        }
    }, [musicRef]);

    // Update the music volume when the range input changes
    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume); // Update the volume state
        localStorage.setItem('volume', newVolume); // Save the volume to localStorage

        if (musicRef.current) {
            musicRef.current.volume = newVolume; // Apply the new volume to the music
        }
    };

    // Handle mute/unmute functionality
    const toggleMute = () => {
        if (volume === 0) {
            setVolume(0.5); // Set volume to 50% when unmuting
            if (musicRef.current) musicRef.current.volume = 0.5;
        } else {
            setVolume(0); // Mute the volume
            if (musicRef.current) musicRef.current.volume = 0;
        }
    };

    // Show the volume control box on mouse enter
    const handleMouseEnterVolumeControl = () => {
        setVolumeControlVisible(true); // Show the volume control
        // Clear the timer if it's already set
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
    };

    // Hide the volume control box on mouse leave
    const handleMouseLeaveVolumeControl = () => {
        // Set a timer to hide the volume control after 500ms
        const newTimer = setTimeout(() => {
            setVolumeControlVisible(false); // Hide the volume control
        }, 500);

        // Update the timer state
        setTimer(newTimer);
    };

    // Cleanup the timer when the component unmounts
    useEffect(() => {
        return () => {
            if (timer) {
                clearTimeout(timer); // Clear the timer to avoid memory leaks
            }
        };
    }, [timer]);

    return (
        <header className="header-container">
            {isLogin && // Conditional rendering based on the isLogin prop
            <h1 className="header-title max">Red Tetris</h1>
            }
            {!isLogin && // Conditional rendering based on the isLogin prop
            <>
                <nav className="header-nav side">
                    <ul className="nav-links">
                        <li><a onClick={() => navigate('/')}>Login</a></li>
                        <li><a onClick={() => navigate('/home')}>Home</a></li>
                        <li><a onClick={() => navigate('/home')}>Scores</a></li>
                    </ul>
                </nav>
            <h1 className="header-title middle">Red Tetris</h1>
            <div 
                    className="volume-control side" 
                    onMouseEnter={handleMouseEnterVolumeControl} // Show the volume control box on hover
                    onMouseLeave={handleMouseLeaveVolumeControl} // Hide the volume control box on mouse leave
                >
                    <button 
                        className="volume-button" 
                        onClick={() => setVolumeControlVisible(!isVolumeControlVisible)} // Toggle the visibility of the volume control
                    >
                        <i className={`fa ${volume === 0 ? 'fa-volume-off' : 'fa-volume-up'}`} aria-hidden="true"></i>
                    </button>
                    <div className={`volume-slider-container ${!isVolumeControlVisible ? 'hidden' : ''}`}>
                        <div className='volume-setting-box'>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange} // Handle volume change
                            />
                            <button onClick={toggleMute} className='mute-button'>
                                {volume === 0 ? 'Unmute' : 'Mute'}
                            </button>
                        </div>
                    </div>
                </div>
            </>
            }
        </header>
    );
}

export default Header;
