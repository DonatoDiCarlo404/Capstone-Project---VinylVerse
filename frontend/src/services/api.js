const API_URL = 'http://localhost:3001/api';

export const testConnessione = async () => {
  try {
    const response = await fetch(`${API_URL}/test`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore di connessione:', error);
    throw error;
  }
};