const express = require('express');
const router = express.Router();
const Vinyl = require('../models/Vinyl');
const Comment = require('../models/Comment');
const DiscogsService = require('../services/discogs.service');
const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});
const NodeCache = require('node-cache');
const previewCache = new NodeCache({ stdTTL: 86400 });

// GET - Search by artist
router.get('/search/artist', async (req, res) => {
    try {
        const { query, page = 1 } = req.query;
        
        // Modifica i parametri di ricerca
        const searchParams = new URLSearchParams({
            q: `"${query}"`,     // Aggiungi le virgolette per ricerca esatta
            type: 'artist',      
            per_page: '50',      // Aumenta per avere più risultati da filtrare
            sort: 'want',
            sort_order: 'desc'
        });

        const response = await fetch(
            `https://api.discogs.com/database/search?${searchParams}`,
            {
                headers: {
                    'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
                    'User-Agent': 'VinylVerse/1.0'
                }
            }
        );

        if (!response.ok) throw new Error('Discogs API error');
        const data = await response.json();

        // Filtra meglio i risultati
        const filteredResults = data.results.filter(artist => 
            artist.title.toLowerCase().includes(query.toLowerCase()) &&
            artist.type === 'artist'
        );

        // Trasforma i risultati filtrati in profili artista
        const artistProfiles = filteredResults.slice(0, 20).map(artist => ({
            id: artist.id,
            name: artist.title,
            thumb: artist.cover_image || artist.thumb,
            type: 'artist',
            url: artist.uri
        }));

        res.json({
            discogs: {
                results: artistProfiles,
                pagination: {
                    ...data.pagination,
                    items: artistProfiles.length
                }
            }
        });

    } catch (error) {
        console.error('Artist search error:', error);
        res.status(500).json({ error: 'Error searching artist' });
    }
});

// GET - Search by album title
router.get('/search/album', async (req, res) => {
    try {
        const { query, page = 1 } = req.query;
        
        const searchParams = new URLSearchParams({
            q: query,                // Rimuoviamo title:" per una ricerca più ampia
            type: 'master',          // Usiamo master per risultati migliori
            format: 'vinyl',
            per_page: '50',
            sort: 'want',
            sort_order: 'desc'
        });

        const response = await fetch(
            `https://api.discogs.com/database/search?${searchParams}`,
            {
                headers: {
                    'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
                    'User-Agent': 'VinylVerse/1.0'
                }
            }
        );

        if (!response.ok) throw new Error('Discogs API error');
        const data = await response.json();

        // Filtra per match precisi e verifica immagini
        const searchQuery = query.toLowerCase();
        const filteredResults = data.results.filter(album => {
            const albumTitle = album.title.toLowerCase();
            const queryWords = searchQuery.split(' ');
            const titleMatch = queryWords.every(word => albumTitle.includes(word));
            const hasValidImage = album.cover_image && !album.cover_image.includes('spacer.gif');
            return titleMatch && hasValidImage;
        });

        res.json({
            discogs: {
                results: filteredResults.slice(0, 20),
                pagination: {
                    ...data.pagination,
                    items: filteredResults.length
                }
            }
        });

    } catch (error) {
        console.error('Album search error:', error);
        res.status(500).json({ error: 'Error searching album' });
    }
});

// Rotte per home e generi

// GET - Vinili in home con ricerca casuale
router.get('/home-random', async (req, res) => {
  try {
    const searchParams = new URLSearchParams({
      type: 'release',
      format: 'vinyl',
      per_page: '50',    // Aumentato per avere più scelta
      sort: 'want',
      sort_order: 'desc'
    });

    const response = await fetch(
      `https://api.discogs.com/database/search?${searchParams}`,
      {
        headers: {
          'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
          'User-Agent': 'VinylVerse/1.0'
        }
      }
    );

    if (!response.ok) throw new Error('Discogs API error');
    const data = await response.json();

    const randomResults = [...data.results]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);    // Prendiamo 12 album invece di 4

    res.json({
      discogs: {
        results: randomResults,
        pagination: null
      }
    });
  } catch (error) {
    console.error('Error fetching random vinyls:', error);
    res.status(500).json({ error: 'Error fetching random vinyls' });
  }
});

// GET - Vinili per genere
router.get('/genre-search', async (req, res) => {
  try {
    const { genre, page = 1 } = req.query;

    // Modifica la query per essere più specifica
    const searchParams = new URLSearchParams({
      q: '',                     // Lasciamo vuoto per usare i filtri
      genre: genre,              // Usiamo il filtro genre di Discogs
      type: 'release',
      format: 'vinyl',
      per_page: '100',          // Richiediamo più risultati per filtrarli
      sort: 'want',
      sort_order: 'desc'
    });

    const response = await fetch(
      `https://api.discogs.com/database/search?${searchParams}`,
      {
        headers: {
          'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
          'User-Agent': 'VinylVerse/1.0'
        }
      }
    );

    if (!response.ok) throw new Error('Discogs API error');
    const data = await response.json();

    // Filtra i risultati per ottenere solo quelli del genere specificato
    const filteredResults = data.results.filter(vinyl => {
      const genres = Array.isArray(vinyl.genre) ? vinyl.genre : [vinyl.genre];
      return genres.some(g => g.toLowerCase() === genre.toLowerCase());
    });

    // Prendi i primi 50 risultati filtrati
    const top50Results = filteredResults.slice(0, 50);

    // Pagina i risultati: 10 per pagina
    const startIndex = (parseInt(page) - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedResults = top50Results.slice(startIndex, endIndex);

    res.json({
      discogs: {
        results: paginatedResults,
        pagination: {
          items: 50,
          pages: 5,
          per_page: 10,
          page: parseInt(page)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching genre vinyls:', error);
    res.status(500).json({ error: 'Error fetching genre vinyls' });
  }
});

// GET - Lista generi disponibili
router.get('/genres', async (req, res) => {
  try {
    // Define a static list of genres or fetch from your database
    const genres = [
      'Rock',
      'Jazz',
      'Hip Hop',
      'Electronic',
      'Classical',
      'Pop',
      'Blues',
      'R&B',
      'Soul',
      'Funk',
      'Country',
      'Reggae',
      'Metal',
      'Folk',
      'Latin'
    ];

    res.json({ genres });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Error fetching genres' });
  }
});

// Rotte dettaglio vinile

// GET - Dettaglio vinile
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        // Determine the correct API endpoint
        let discogsUrl;
        if (type === 'master') {
            discogsUrl = `https://api.discogs.com/masters/${id}`;
        } else {
            discogsUrl = `https://api.discogs.com/releases/${id}`;
        }

        console.log('Fetching from Discogs URL:', discogsUrl); // Debug log

        const response = await fetch(discogsUrl, {
            headers: {
                'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
                'User-Agent': 'VinylVerse/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Discogs API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Discogs API response:', data); // Debug log

        res.json(data);
    } catch (error) {
        console.error('Error in vinyl route:', error);
        res.status(500).json({ error: error.message });
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

// GET - Dettagli artista
router.get('/artist/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch artista
        const artistResponse = await fetch(
            `https://api.discogs.com/artists/${id}`,
            {
                headers: {
                    'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
                    'User-Agent': 'VinylVerse/1.0'
                }
            }
        );

        if (!artistResponse.ok) throw new Error('Artista non trovato');
        const artistData = await artistResponse.json();

        // Fetch MAIN RELEASES invece di releases
        const mainReleasesResponse = await fetch(
            `https://api.discogs.com/artists/${id}/releases?sort=year&sort_order=desc&per_page=100&role=main`,
            {
                headers: {
                    'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
                    'User-Agent': 'VinylVerse/1.0'
                }
            }
        );

        const mainReleasesData = await mainReleasesResponse.json();

        // Filtra solo gli album principali
        const mainAlbums = mainReleasesData.releases.filter(release => {
            const isMainAlbum = 
                release.role === "Main" &&
                !release.title.toLowerCase().includes('live') &&
                !release.title.toLowerCase().includes('tour') &&
                !release.title.toLowerCase().includes('remix') &&
                !release.title.match(/\d{2}[-/.]\d{2}[-/.]\d{4}/);

            return isMainAlbum;
        });

        res.json({
            artist: {
                ...artistData,
                releases: mainAlbums
            }
        });

    } catch (error) {
        console.error('Errore nel recupero dettagli artista:', error);
        res.status(500).json({ error: 'Errore nel recupero dettagli artista' });
    }
});

module.exports = router;