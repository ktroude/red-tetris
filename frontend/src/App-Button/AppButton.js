import './AppButton.css'


function AppButton({ onClick, children }) {
    return (
        <button className='AppButton' onClick={onClick}>
            {children}
        </button>
    );
}

export default AppButton;