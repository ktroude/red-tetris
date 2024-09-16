import './AppInput.css'

function AppInput({ placeholder, label, onChange }) {
    return (
        <div className='AppInput-container'>
            <label htmlFor="input" className="form-label">{label}</label>
            <input
                className='AppInput'
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
}

export default AppInput;
