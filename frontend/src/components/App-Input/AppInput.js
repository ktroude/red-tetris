import React, { useEffect, useRef } from 'react';
import './AppInput.css';

function AppInput({ placeholder, label, onChange, onKeyDown }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className='AppInput-container'>
            <label htmlFor="input" className="form-label">{label}</label>
            <input
                ref={inputRef}
                className='AppInput'
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                onChange={onChange}
            />
        </div>
    );
}

export default AppInput;
