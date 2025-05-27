const express = require('express');
const router = express.Router();
const Artist = require('../models/artist');
const Vinyl = require('../models/vinyl');
const DiscogsService = require('../services/discogs.service');

// GET - Lista tutti gli artisti
router.get('/', async (req, res) => {
    try {
        const artists = await Artist.find();
        res.json(artists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Dettagli di un artista specifico
router.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            return res.status(404).json({ message: 'Artista non trovato' });
        }

        const discography = await Vinyl.find({ artist: artist._id });
        res.json({
            ...artist.toObject(),
            discography
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Importa un artista da Discogs
router.post('/import/:discogsId', async (req, res) => {
    try {
        const artistData = await DiscogsService.getArtistDetails(req.params.discogsId);
        
        // Cerca l'artista per discogsId o nome
        let artist = await Artist.findOne({
            $or: [
                { discogsId: req.params.discogsId },
                { name: artistData.name }
            ]
        });

        if (artist) {
            // Aggiorna i dati esistenti
            artist = await Artist.findOneAndUpdate(
                { _id: artist._id },
                {
                    biography: artistData.profile,
                    image: artistData.images?.[0]?.uri,
                    genres: artistData.genres || [],
                    discogsId: req.params.discogsId
                },
                { new: true }
            );
        } else {
            // Crea nuovo artista
            artist = new Artist({
                name: artistData.name,
                biography: artistData.profile,
                image: artistData.images?.[0]?.uri,
                genres: artistData.genres || [],
                discogsId: req.params.discogsId
            });
            await artist.save();
        }

        // Importa i vinili
        const releases = await DiscogsService.getArtistReleases(req.params.discogsId);
        for (const release of releases.releases.slice(0, 5)) {
            let vinyl = await Vinyl.findOne({ discogsId: release.id });
            if (!vinyl) {
                const vinylData = await DiscogsService.getVinylDetails(release.id);
                vinyl = new Vinyl({
                    title: vinylData.title,
                    artist: artist._id,
                    year: vinylData.year,
                    genre: vinylData.genres,
                    price: 29.99,
                    discogsId: release.id
                });
                await vinyl.save();
            }
        }

        // Aggiorna la discografia
        const discography = await Vinyl.find({ artist: artist._id });
        res.status(200).json({
            message: 'Artista importato/aggiornato con successo',
            artist,
            discography
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET - Discografia artista
router.get('/:id/discography', async (req, res) => {
    try {
        const vinyls = await Vinyl.find({ artist: req.params.id })
         .sort({ year: -1 });
        res.json(vinyls);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
    
module.exports = router;    