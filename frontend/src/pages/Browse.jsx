import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SpinnerComponent from '../components/layout/SpinnerComponent';
import { ThemeContext } from '../modules/context';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') || 'rock';
  const page = parseInt(searchParams.get('page')) || 1;
  const fromPopularGenres = searchParams.get('from') === 'popular';
  const [vinyls, setVinyls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useContext(ThemeContext);

  const ITEMS_PER_PAGE = fromPopularGenres ? 10 : 4;
  const genres = [
    'Rock', 'Jazz', 'Electronic', 'Classical',
    'Hip Hop', 'Pop', 'Reggae', 'Blues',
    'Folk', 'Country', 'Soul', 'Funk'
  ];

  const handleGenreChange = (e) => {
    const newGenre = e.target.value.toLowerCase();
    // Mantiene il parametro 'from' solo quando viene dalla sezione generi
    const params = {
      genre: newGenre,
      page: 1
    };
    if (fromPopularGenres) {
      params.from = 'popular';
    }
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
  const fetchVinyls = async () => {
    try {
      setLoading(true);
      const baseUrl = 'https://vinylverse-backend.onrender.com/api/vinyl';
      
      // Usa rotte diverse per home e generi
      const endpoint = fromPopularGenres 
        ? `/genre-search?genre=${genre}&page=${page}`
        : '/home-random';

      const response = await fetch(`${baseUrl}${endpoint}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      setVinyls(data.discogs.results);
      setPagination(fromPopularGenres ? data.discogs.pagination : null);

    } catch (err) {
      console.error('Failed to fetch vinyls:', err);
      setError(`Errore nel caricamento dei vinili ${genre}`);
    } finally {
      setLoading(false);
    }
  };

  fetchVinyls();
}, [genre, page, fromPopularGenres]);

  const handlePageChange = (newPage) => {
    const params = {
      genre,
      page: newPage
    };
    if (fromPopularGenres) {
      params.from = 'popular';
    }
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <SpinnerComponent />;
  }

  if (error) return <div className="container py-5 text-danger">{error}</div>;

  return (
    <div className="container py-5">
      {fromPopularGenres && (
        <nav className={`navbar navbar-axpand-lb mb-4 ${
                theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
            }`}
            data-bs-theme={theme}>
          <div className="container">
            <span className="navbar-brand">Trova vinili esplorando tra i generi disponibili</span>
            <div className="ms-auto">
              <select
                className="form-select"
                value={genre}
                onChange={handleGenreChange}
              >
                {genres.map((g) => (
                  <option key={g} value={g.toLowerCase()}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </nav>
      )}

      <h2 className="mb-4 text-capitalize text-center text-success">
        I 50 Vinili {genre} più popolari
      </h2>

      <div className="row g-4">
        {vinyls.map((vinyl) => (
          <div key={vinyl.id} className="col-md-3 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={vinyl.cover_image}
                className="card-img-top"
                alt={vinyl.title}
                style={{ height: '300px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/300x300?text=No+Image';
                }}
              />
              <div className={`card-body d-flex flex-column ${
                theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
            }`}
            data-bs-theme={theme}>
                <h5 className="card-title">{vinyl.title}</h5>
                <p className="card-text">{vinyl.artist}</p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Anno: {vinyl.year || 'N/A'}</small>
                  <small className="text-muted">
                    {Array.isArray(vinyl.format)
                      ? vinyl.format.join(', ')
                      : (vinyl.format || 'Vinyl')}
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-muted">
                    Generi: {Array.isArray(vinyl.genre)
                      ? vinyl.genre.join(', ')
                      : (vinyl.genre || 'N/A')}
                  </small>
                </div>
                <div className="mt-auto text-center">
                <Link
                  to={`/vinyl/${vinyl.id}`}
                  className="btn btn-success w-100"
                >
                  Vedi Album
                </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className={`d-flex justify-content-center mt-5 ${
                theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
            }`}
            data-bs-theme={theme}>
          <nav aria-label="Page navigation" className="mt-3">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Precedente
                </button>
              </li>
              {[...Array(pagination.pages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === pagination.pages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Successivo
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Browse;