import React, { useState } from 'react';
import './AppInput.css'

function AppInput({ placeholder, onChange }) {
    return (
        <div className='AppInput-container'>
            <label htmlFor="input" className="form-label">CREATE A ROOM</label>
            <input
                className='AppInput'
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
}

export default AppInput;
