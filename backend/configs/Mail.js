const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendRegistrationEmail = async (userEmail, username) => {
    const msg = {
        to: userEmail,
        from: 'donato.dicarlo404@gmail.com',
        subject: 'Benvenuto su VinylVerse!',
        html: `
            <h1>Benvenuto su VinylVerse!</h1>
            <p>Ciao ${username},</p>
            <p>Grazie per esserti registrato alla nostra piattaforma dedicata ai vinili!</p>
            <p>Buon ascolto!</p>
            <p>Il team di VinylVerse</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('Email di registrazione inviata');
    } catch (error) {
        console.error('Errore invio email:', error);
    }
};

const sendOrderConfirmationEmail = async (userEmail, username, orderDetails) => {
    const msg = {
        to: userEmail,
        from: 'donato.dicarlo404@gmail.com', 
        subject: 'Conferma Ordine - VinylVerse',
        html: `
            <h1>Grazie per il tuo ordine!</h1>
            <p>Ciao ${username},</p>
            <p>Abbiamo ricevuto il tuo ordine:</p>
            <ul>
                ${orderDetails.items.map(item => `
                    <li>${item.title} - ${item.artist} (Quantità: ${item.quantity})</li>
                `).join('')}
            </ul>
            <p><strong>Totale: €${orderDetails.total}</strong></p>
            <p>Grazie per il tuo acquisto!</p>
            <p>Il team di VinylVerse</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('Email di conferma ordine inviata');
    } catch (error) {
        console.error('Errore invio email:', error);
    }
};

module.exports = {
    sendRegistrationEmail,
    sendOrderConfirmationEmail
};