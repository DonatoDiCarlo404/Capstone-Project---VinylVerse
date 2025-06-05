import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [vinyls, setVinyls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomVinyls = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/vinyl/random');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setVinyls(data);
      } catch (err) {
        console.error('Failed to fetch vinyls:', err);
        setError('Errore caricamento dei vinili');
      } finally {
        setLoading(false);
      }
    };
    fetchRandomVinyls();
  }, []);

  if (loading) return <div className="container py-5">Caricamento...</div>;
  if (error) return <div className="container py-5 text-danger">{error}</div>;

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-4 fw-bold">Benvenuti in VinylVerse</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            Scopri e colleziona i tuoi dischi in vinile preferiti.
            Esplora la nostra vasta collezione di vinili nuovi e vintage.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <button className="btn btn-primary btn-lg px-4 gap-3">
              Sfoglia la Collezione
            </button>
            <button className="btn btn-outline-secondary btn-lg px-4">
              Scopri di più
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="container py-5">
        <h2 className="text-center mb-4">Scopri Nuovi Vinili</h2>
        <div className="row g-4">
          {vinyls.map((vinyl) => (
            <div key={vinyl.id} className="col-md-3">
              <div className="card h-100">
                <img
                  src={vinyl.coverImage}
                  className="card-img-top"
                  alt={vinyl.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/300x300?text=No+Image';
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{vinyl.title}</h5>
                  <p className="card-text">{vinyl.artist}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      {vinyl.year} - {vinyl.genre.join(', ')}
                    </small>
                  </p>
                  <Link to={`/vinyl/${vinyl.id}`} className="btn btn-primary">
                    Dettagli
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="row mt-5">
        <h2 className="text-center mb-4">Generi più amati</h2>
        {['Rock', 'Jazz', 'Hip Hop', 'Electronic'].map((genre) => (
          <div key={genre} className="col-md-3 mb-4">
            <Link
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="text-decoration-none"
            >
              <div className="card bg-dark text-white hover-overlay h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <h3 className="card-title mb-3">{genre}</h3>
                  <small className="text-white">
                    Esplora {genre.toLowerCase()}
                    <i className="bi bi-arrow-right-circle ms-2"></i>
                  </small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;