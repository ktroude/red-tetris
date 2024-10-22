import './AppInput.css'

function AppInput({ placeholder, label, onChange, onKeyDown }) {
    return (
        <div className='AppInput-container'>
            <label htmlFor="input" className="form-label">{label}</label>
            <input
                className='AppInput'
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                onChange={onChange}
            />
        </div>
    );
}

export default AppInput;
