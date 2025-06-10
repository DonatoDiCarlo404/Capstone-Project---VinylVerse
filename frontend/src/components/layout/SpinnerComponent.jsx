const SpinnerComponent = () => {
    return (
        <div className="d-flex justify-content-center align-items-center">
            <div 
                className="spinner-border text-primary" 
                style={{ width: '3rem', height: '3rem' }} 
                role="status"
            >
                <span className="visually-hidden">Caricamento...</span>
            </div>
        </div>
    );
};

export default SpinnerComponent;