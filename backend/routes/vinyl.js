const express = require('express');
const router = express.Router();
const Vinyl = require('../models/Vinyl');
const Comment = require('../models/Comment');
const DiscogsService = require('../services/discogs.service');

// GET - Ricerca vinili (combina DB locale e Discogs)
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, per_page = 8, genre } = req.query;
    
    // Se c'è un genere specificato, usa quello come query di ricerca
    const searchTerm = genre || query;
    
    // Cerca su Discogs con paginazione
    const discogsResults = await DiscogsService.searchVinyl(searchTerm, parseInt(page), parseInt(per_page));

    // Filtra i risultati di Discogs per genere se specificato
    const filteredDiscogsResults = genre
      ? discogsResults.results.filter(item =>
          item.genre?.some(g => 
            genre.toLowerCase() === 'hip hop' 
              ? g.toLowerCase().includes('hip hop') || g.toLowerCase().includes('rap')
              : g.toLowerCase() === genre.toLowerCase()
          )
        )
      : discogsResults.results;

    res.json({
      discogs: {
        results: filteredDiscogsResults,
        pagination: {
          page: parseInt(page),
          pages: discogsResults.pagination.pages,
          items: discogsResults.pagination.items,
          per_page: parseInt(per_page)
        }
      }
    });
  } catch (error) {
    console.error('Errore ricerca:', error);
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
    // Verifica se il vinile esiste già
    let vinyl = await Vinyl.findOne({ discogsId: req.params.discogsId });
    
    if (!vinyl) {
      const discogsVinyl = await DiscogsService.getVinylDetails(req.params.discogsId);
      
      vinyl = new Vinyl({
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
        price: req.body.price || 29.99,
        discogsId: discogsVinyl.id
      });

      await vinyl.save();
    }

    res.status(201).json({
      message: vinyl.isNew ? 'Vinile importato con successo' : 'Vinile già presente',
      vinyl
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Media voti per un vinile
router.get('/:id/rating', async (req, res) => {
  try {
    const comments = await Comment.find({ vinyl: req.params.id });
    const averageRating = comments.reduce((acc, comment) => acc + comment.rating, 0) / comments.length;
    
    res.json({ 
      averageRating: averageRating || 0,
      totalRatings: comments.length 
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Pre ascolto audio per un vinile
router.get('/:id/preview', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prima cerca nel DB locale se l'ID è un ObjectId valido
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const vinyl = await Vinyl.findById(id);
            if (vinyl && vinyl.preview_urls) {
                return res.json({
                    source: 'local',
                    preview_urls: vinyl.preview_urls
                });
            }
        }

        // Se non trovato localmente cerca su Discogs
        const discogsVinyl = await DiscogsService.getVinylDetails(id);
        return res.json({
            source: 'discogs',
            preview_urls: discogsVinyl.preview_urls
        });

    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET - Lista vinili casuali da Discogs
router.get('/random', async (req, res) => {
  try {
    // Lista più ampia di generi per la ricerca casuale
    const searchTerms = [
      'rock', 'jazz', 'electronic', 'classical', 
      'blues', 'funk', 'soul', 'metal',
      'punk', 'reggae', 'indie', 'alternative'
    ];
    
    // Seleziona 3 termini casuali per una ricerca più variegata
    const randomTerms = searchTerms
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Esegui ricerca con termine casuale
    const randomTerm = randomTerms[0];
    const discogsResults = await DiscogsService.searchVinyl(randomTerm, 1);
    
    // Mappa e filtra i risultati
    const vinyls = discogsResults.results
      .filter(item => item.cover_image && item.title)
      .map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist || 'Unknown Artist',
        year: item.year || 'N/A',
        genre: Array.isArray(item.genre) ? item.genre : [],
        coverImage: item.cover_image
      }))
      .slice(0, 4);

    res.json(vinyls);
  } catch (error) {
    console.error('Error fetching random vinyls:', error);
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

// GET - Dettaglio vinile con tracklist
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await DiscogsService.getVinylDetails(id);
    res.json(response);
  } catch (error) {
    console.error('Error fetching vinyl details:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;