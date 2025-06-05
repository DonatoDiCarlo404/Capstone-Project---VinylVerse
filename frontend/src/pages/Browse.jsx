import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre');
  const page = parseInt(searchParams.get('page')) || 1;
  const [vinyls, setVinyls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchVinylsByGenre = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/vinyl/search?genre=${genre}&page=${page}&per_page=${ITEMS_PER_PAGE}`
        );
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setVinyls(data.discogs.results || []);
        setPagination(data.discogs.pagination);
      } catch (err) {
        console.error('Failed to fetch vinyls:', err);
        setError(`Errore nel caricamento dei vinili ${genre}`);
      } finally {
        setLoading(false);
      }
    };

    if (genre) {
      fetchVinylsByGenre();
    }
  }, [genre, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ genre, page: newPage });
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="container py-5">Caricamento...</div>;
  if (error) return <div className="container py-5 text-danger">{error}</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-capitalize">
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
              <div className="card-body">
                <h5 className="card-title">{vinyl.title}</h5>
                <p className="card-text">{vinyl.artist}</p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Anno: {vinyl.year || 'N/A'}</small>
                  <small className="text-muted">
                    {vinyl.format?.join(', ') || 'Vinyl'}
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-muted">
                    Generi: {vinyl.genre?.join(', ')}
                  </small>
                </div>
                <Link 
                  to={`/vinyl/${vinyl.id}`} 
                  className="btn btn-primary w-100"
                >
                  Vedi Album
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <nav aria-label="Page navigation">
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