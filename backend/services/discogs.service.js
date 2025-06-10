class DiscogsService {
  constructor() {
    this.baseURL = 'https://api.discogs.com';
    this.headers = {
      'User-Agent': 'VinylVerse/1.0',
      'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`
    };
  }

  /**
   * Metodo helper privato per la randomizzazione degli array
   */
  #shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  #calculateArtistRelevance(artist, query) {
    let score = 0;
    const artistName = artist.title?.toLowerCase() || '';
    const queryLower = query.toLowerCase();

    // Match esatto del nome dell'artista
    if (artistName === queryLower) {
      score += 100;
    }
    // Match all'inizio del nome
    else if (artistName.startsWith(queryLower)) {
      score += 75;
    }
    // Match parziale del nome
    else if (artistName.includes(queryLower)) {
      score += 50;
    }

    // Bonus per immagine profilo
    if (artist.thumb || artist.cover_image) {
      score += 10;
    }

    // Bonus per descrizione/profilo
    if (artist.profile) {
      score += 5;
    }

    return score;
}

  #calculateGeneralRelevance(item) {
    let score = 0;

    // Popolarità base
    if (item.community?.want) {
      score += item.community.want;
    }

    // Bonus per anno recente
    if (item.year) {
      score += Math.min(item.year / 1000, 20);
    }

    return score;
  }

  /**
   * Ricerca vinili dal form principale
   */
  async searchVinylFromForm(query, searchType, page = 1) {
    try {
      const url = new URL(`${this.baseURL}/database/search`);
      url.searchParams.append('per_page', '50');

      if (searchType === 'artist') {
        return await this.searchArtists(query, page);
      } else {
        return await this.searchAlbums(query, searchType === 'title', page);
      }
    } catch (error) {
      console.error('Errore ricerca form:', error);
      throw error;
    }
  }

  async searchArtists(query, page = 1) {
    console.log('Searching for artist:', query);  // Debug log
    
    const url = new URL(`${this.baseURL}/database/search`);
    url.searchParams.append('type', 'artist');
    url.searchParams.append('q', query);
    url.searchParams.append('per_page', '50');

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) throw new Error(`Errore API Discogs: ${response.statusText}`);

    const data = await response.json();
    console.log('Raw API response:', data);  // Debug log

    // Filtra e ordina gli artisti per rilevanza
    const artistResults = data.results
      .filter(item => {
        console.log('Filtering item:', item);  // Debug log
        return item.type === 'artist';
      })
      .map(artist => {
        const relevanceScore = this.#calculateArtistRelevance(artist, query);
        console.log('Artist with score:', artist.title, relevanceScore);  // Debug log
        return {
          id: artist.id,
          name: artist.title,
          thumb: artist.thumb || artist.cover_image,
          type: 'artist',
          resourceUrl: artist.resource_url,
          profile: artist.profile || '',
          relevanceScore
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log('Filtered and scored results:', artistResults);  // Debug log

    // Selezione risultati per la pagina corrente
    const itemsPerPage = 12;
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedResults = artistResults.slice(startIndex, startIndex + itemsPerPage);

    const finalResults = {
      results: paginatedResults.map(({ relevanceScore, ...artist }) => artist),
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(artistResults.length / itemsPerPage),
        items: artistResults.length,
        per_page: itemsPerPage
      }
    };

    console.log('Final results:', finalResults);  // Debug log
    return finalResults;
}

  async searchAlbums(query, isTitleSearch = false, page = 1) {
    const url = new URL(`${this.baseURL}/database/search`);
    url.searchParams.append('format', 'vinyl');
    url.searchParams.append('type', 'release');

    if (isTitleSearch) {
      url.searchParams.append('release_title', query);
    } else {
      url.searchParams.append('q', query);
    }

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) throw new Error(`Errore API Discogs: ${response.statusText}`);

    const data = await response.json();
    const uniqueAlbums = new Map();

    data.results.forEach(item => {
      if (!item.cover_image || !item.title || !item.id) return;

      if (isTitleSearch && !item.title.toLowerCase().includes(query.toLowerCase())) {
        return;
      }

      const artist = item.artist || item.title.split(' - ')[0];
      const uniqueKey = `${item.title}_${artist}`.toLowerCase();
      const relevanceScore = this.#calculateGeneralRelevance(item);

      if (!uniqueAlbums.has(uniqueKey) ||
        relevanceScore > uniqueAlbums.get(uniqueKey).relevanceScore) {
        uniqueAlbums.set(uniqueKey, {
          ...item,
          relevanceScore
        });
      }
    });

    const filteredResults = Array.from(uniqueAlbums.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore || (b.year || 0) - (a.year || 0));

    const itemsPerPage = 12;
    const paginatedResults = filteredResults.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return {
      results: paginatedResults.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist || item.title.split(' - ')[0],
        year: item.year,
        cover_image: item.cover_image,
        format: item.format?.join(', ') || 'Vinyl',
        genre: item.genre || [],
        community: item.community || {}
      })),
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(filteredResults.length / itemsPerPage),
        items: filteredResults.length,
        per_page: itemsPerPage
      }
    };
  }

  /**
   * Ricerca vinili (generi, random, generale)
   */
  async searchVinyl(query, page = 1, per_page = 10, options = {}) {
    try {
      const url = new URL(`${this.baseURL}/database/search`);

      // Parametri base comuni
      url.searchParams.append('format', 'vinyl');
      url.searchParams.append('format_exact', 'Vinyl');

      if (options.random) {
        // Per vinili random nella home
        const randomPage = Math.floor(Math.random() * 100) + 1; // Random page between 1-100
        const randomGenres = ['rock', 'jazz', 'electronic', 'classical', 'pop', 'hip hop'];
        const randomGenre = randomGenres[Math.floor(Math.random() * randomGenres.length)];

        url.searchParams.append('genre', randomGenre);
        url.searchParams.append('page', randomPage);
        url.searchParams.append('per_page', '100');
        url.searchParams.append('sort', 'want');
      } else if (options.genre) {
        // Per ricerca per genere
        url.searchParams.append('genre', options.genre);
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', per_page);
        url.searchParams.append('sort', 'want');
      } else {
        // Per ricerca generale/artista
        if (query) url.searchParams.append('q', query);
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', per_page);
      }

      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) throw new Error(`Discogs API error: ${response.statusText}`);

      const data = await response.json();

      if (!data || !data.results) {
        throw new Error('Invalid response format from Discogs API');
      }

      let results = data.results.filter(item =>
        item.cover_image && item.title && item.id
      );

      if (options.random) {
        // Shuffle e prendi 4 album random
        results = this.#shuffleArray([...results]).slice(0, 4);
      }

      return {
        results: results.map(item => ({
          ...item,
          id: item.id
        })),
        pagination: data.pagination
      };

    } catch (error) {
      console.error('Discogs search error:', error);
      throw error;
    }
  }

  /**
   * Ottiene i dettagli di un vinile specifico
   */
  async getVinylDetails(discogsId) {
    try {
      const response = await fetch(`${this.baseURL}/releases/${discogsId}`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Errore API Discogs: ${response.statusText}`);
      }

      const data = await response.json();

      const preview_urls = {};
      if (data.videos) {
        data.tracklist.forEach((track, index) => {
          const matchingVideo = data.videos.find(video =>
            video.title.toLowerCase().includes(track.title.toLowerCase()) &&
            video.uri.includes('youtube.com')
          );

          if (matchingVideo) {
            const videoId = matchingVideo.uri.split('v=')[1];
            preview_urls[`track_${index + 1}`] = {
              preview_url: `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&disablekb=1&enablejsapi=1&fs=0&modestbranding=1&start=30&end=60&showinfo=0&rel=0`,
              title: track.title,
              duration: '0:30'
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

  /**
   * Ottiene i dettagli di un artista
   */
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

  /**
   * Ottiene le release di un artista
   */
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