class DiscogsService {
  constructor() {
    this.baseURL = 'https://api.discogs.com';
    this.headers = {
      'User-Agent': 'VinylVerse/1.0',
      'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`
    };
  }

  async searchVinyl(query, page = 1) {
    try {
      const url = new URL(`${this.baseURL}/database/search`);
      url.searchParams.append('q', query);
      url.searchParams.append('type', 'release');
      url.searchParams.append('format', 'vinyl');
      url.searchParams.append('per_page', '20');
      url.searchParams.append('page', page.toString());

      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        throw new Error(`Errore API Discogs: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Errore ricerca Discogs:', error);
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
        
        // Estrai i preview URLs dai video YouTube
        const preview_urls = {};
        
        if (data.videos && data.videos.length > 0) {
            // Filtra solo i video di YouTube
            data.videos.forEach((video, index) => {
                if (video.uri.includes('youtube.com')) {
                    // Estrai l'ID del video YouTube
                    const videoId = video.uri.split('v=')[1];
                    if (videoId) {
                        preview_urls[`track_${index + 1}`] = {
                            url: video.uri,
                            title: video.title,
                            duration: video.duration
                        };
                    }
                }
            });
        }

        console.log('Preview URLs trovati:', preview_urls); // Debug log

        return {
            ...data,
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