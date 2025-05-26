class DiscogsService {
  constructor() {
    this.baseURL = 'https://api.discogs.com';
    this.headers = {
      'User-Agent': 'VinylVerse/1.0',
      'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`
    };
  }

  async searchVinyl(query) {
    try {
      const url = new URL(`${this.baseURL}/database/search`);
      url.searchParams.append('q', query);
      url.searchParams.append('type', 'release');
      url.searchParams.append('format', 'vinyl');

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
      return await response.json();
    } catch (error) {
      console.error('Errore dettagli Discogs:', error);
      throw error;
    }
  }
}

module.exports = new DiscogsService();