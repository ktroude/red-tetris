import './AppButton.css'


function AppButton({ onClick, classe, children }) {
    classe += ' AppButton';

    return (
        <button className={classe} onClick={onClick}>
            {children}
        </button>
    );
}

export default AppButton;