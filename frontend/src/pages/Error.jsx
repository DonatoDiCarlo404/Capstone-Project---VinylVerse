import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <div className="container text-center py-5">
            <h1 className="display-1">404</h1>
            <h2 className="mb-4">Oops! Pagina non trovata</h2>
            <p className="lead mb-4">
                La pagina che stai cercando non esiste o è stata spostata.
            </p>
            <Link to="/" className="btn btn-primary">
                Torna alla Home
            </Link>
        </div>
    );
};

export default Error;