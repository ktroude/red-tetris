
import { useState } from 'react';
import AppButton from '../App-Button/AppButton';
import AppInput from '../App-Input/AppInput';
import './Home.css';

function Home() {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <div className='home-container'>
            <div className='room-container'>
                <AppInput 
                    placeholder="Room Name"
                    onChange={handleInputChange}
                />
                <AppButton>Create</AppButton>
            </div>
            <div className='button-container'>
                <AppButton>Start Multi</AppButton>
                <AppButton>Start Solo</AppButton>
            </div>

        </div>
    );
}

export default Home;
