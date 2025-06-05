class DiscogsService {
  constructor() {
    this.baseURL = 'https://api.discogs.com';
    this.headers = {
      'User-Agent': 'VinylVerse/1.0',
      'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`
    };
  }

  async searchVinyl(query, page = 1, per_page = 10) { // Cambio default a 10
    try {
      const url = new URL(`${this.baseURL}/database/search`);

      // Parametri di ricerca ottimizzati
      url.searchParams.append('q', query);
      url.searchParams.append('type', 'release');
      url.searchParams.append('format', 'vinyl');
      url.searchParams.append('sort', 'want'); // Ordina per popolarità
      url.searchParams.append('format_exact', 'Vinyl');
      url.searchParams.append('per_page', '50'); // Manteniamo 50 risultati totali
      url.searchParams.append('page', '1');

      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        throw new Error(`Errore API Discogs: ${response.statusText}`);
      }

      const data = await response.json();

      // Filtra e ordina per popolarità
      const filteredResults = data.results
        .filter(item => (
          item.cover_image &&
          item.title &&
          item.community?.want > 100
        ))
        .sort((a, b) => (b.community?.want || 0) - (a.community?.want || 0))
        .slice(0, 50);

      // Gestisci la paginazione locale - 10 per pagina
      const startIndex = (page - 1) * 10; // Forza 10 risultati per pagina
      const endIndex = startIndex + 10;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      return {
        ...data,
        results: paginatedResults,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(50 / 10), // 5 pagine di 10 risultati ciascuna
          items: 50,
          per_page: 10 // Forza 10 risultati per pagina
        }
      };
    } catch (error) {
      console.error('Discogs search error:', error);
      throw error;
    }
  }

  async getVinylDetails(discogsId) {
  try {
    const response = await fetch(`${this.baseURL}/releases/${discogsId}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Errore API Discogs: ${response.statusText}`);
    }

    const data = await response.json();

    // Associa i video alle tracce corrispondenti
    const preview_urls = {};
    if (data.videos && data.videos.length > 0) {
      data.tracklist.forEach((track, index) => {
        // Cerca un video che corrisponda al titolo della traccia
        const matchingVideo = data.videos.find(video => 
          video.title.toLowerCase().includes(track.title.toLowerCase())
        );

        if (matchingVideo) {
          preview_urls[`track_${index + 1}`] = {
            preview_url: matchingVideo.uri,
            title: track.title,
            duration: matchingVideo.duration,
            description: matchingVideo.description
          };
        }
      });
    }

    return {
      id: data.id,
      title: data.title,
      artist: data.artists?.[0]?.name,
      year: data.year,
      genres: data.genres || [],
      styles: data.styles || [],
      tracklist: data.tracklist.map(track => ({
        position: track.position,
        title: track.title,
        duration: track.duration || 'N/A'
      })),
      images: data.images || [],
      label: data.labels?.[0]?.name,
      format: data.formats?.[0]?.name,
      country: data.country,
      notes: data.notes,
      community: data.community,
      preview_urls
    };
  } catch (error) {
    console.error('Errore dettagli Discogs:', error);
    throw error;
  }
}


  async getArtistDetails(artistId) {
    try {
      const response = await fetch(`${this.baseURL}/artists/${artistId}`, {
        headers: this.headers
      });
      if (!response.ok) {
        throw new Error(`Errore API Discogs: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Errore dettagli artista Discogs:', error);
      throw error;
    }
  }


  async getArtistReleases(artistId) {
    try {
      const url = new URL(`${this.baseURL}/artists/${artistId}/releases`);
      url.searchParams.append('sort', 'year');
      url.searchParams.append('per_page', '10');

      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        throw new Error(`Errore API Discogs: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Errore releases artista Discogs:', error);
      throw error;
    }
  }
}

module.exports = new DiscogsService();