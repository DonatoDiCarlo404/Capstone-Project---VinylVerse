const express = require('express');
const router = express.Router();
const Vinyl = require('../models/Vinyl');
const DiscogsService = require('../services/discogs.service');

// GET - Ricerca vinili (combina DB locale e Discogs)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Cerca nel DB locale
    const localResults = await Vinyl.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } }
      ]
    });

    // Cerca su Discogs
    const discogsResults = await DiscogsService.searchVinyl(query);

    res.json({
      local: localResults,
      discogs: discogsResults.results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Filtra vinili per genere
router.get('/filter/genre/:genre', async (req, res) => {
  try {
    const vinyls = await Vinyl.find({ genre: req.params.genre });
    res.json(vinyls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Importa vinile da Discogs al DB locale
router.post('/import/:discogsId', async (req, res) => {
  try {
    const discogsVinyl = await DiscogsService.getVinylDetails(req.params.discogsId);
    
    const vinyl = new Vinyl({
      title: discogsVinyl.title,
      artist: discogsVinyl.artists[0].name,
      year: discogsVinyl.year,
      genre: discogsVinyl.genres,
      format: discogsVinyl.formats[0].name,
      coverImage: discogsVinyl.images?.[0]?.uri,
      tracklist: discogsVinyl.tracklist.map(track => ({
        position: track.position,
        title: track.title,
        duration: track.duration
      })),
      price: req.body.price || 29.99, // Prezzo di default se non specificato
      discogsId: discogsVinyl.id
    });

    await vinyl.save();
    res.status(201).json(vinyl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Dettaglio vinile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let vinyl;

    // Verifica se l'id è un ObjectId valido di MongoDB
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vinyl = await Vinyl.findById(id);
      if (vinyl) {
        return res.json({
          source: 'local',
          data: vinyl
        });
      }
    }

    // Se non è un ObjectId o non è stato trovato localmente, cerca su Discogs
    try {
      const discogsVinyl = await DiscogsService.getVinylDetails(id);
      return res.json({
        source: 'discogs',
        data: discogsVinyl
      });
    }  catch (discogsError) {
      console.error('Errore Discogs:', discogsError);
      return res.status(404).json({ 
        message: 'Vinile non trovato né localmente né su Discogs' 
      });
    }

  } catch (error) {
    console.error('Errore dettaglio vinile:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;