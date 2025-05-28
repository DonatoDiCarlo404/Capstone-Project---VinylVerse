const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Gestione errori Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Errore di validazione',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Gestione errori ID non validi
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'ID non valido'
        });
    }

    // Gestione errori Discogs
    if (err.message.includes('Discogs')) {
        return res.status(503).json({
            message: 'Servizio Discogs non disponibile'
        });
    }

    // Errore generico
    res.status(err.status || 500).json({
        message: err.message || 'Errore interno del server'
    });
};

module.exports = errorHandler;