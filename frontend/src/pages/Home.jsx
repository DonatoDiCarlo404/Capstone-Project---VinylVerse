import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import SpinnerComponent from '../components/layout/SpinnerComponent';

const Home = () => {
  const [randomVinyls, setRandomVinyls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomVinyls = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/vinyl/home-random');

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        setRandomVinyls(data.discogs.results);
      } catch (err) {
        console.error('Error fetching random vinyls:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomVinyls();
  }, []);

  // Dividi gli album in gruppi di 4 per il carosello
  const vinylGroups = [];
  for (let i = 0; i < randomVinyls.length; i += 4) {
    vinylGroups.push(randomVinyls.slice(i, i + 4));
  }

  if (loading) {
    return <div> <SpinnerComponent /> Enter VinylVerse...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container py-4">
      {/* Hero Section - Invariata */}
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-4 fw-bold">Benvenuti in VinylVerse</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            Scopri e colleziona i tuoi dischi in vinile preferiti.
            Esplora la nostra vasta collezione di vinili nuovi e vintage.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Link to="/search" className="btn btn-primary btn-lg px-4 gap-3">
              Sfoglia la Collezione
              <i className="bi bi-search ms-2"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Sezione Carosello Nuovi Vinili */}
      <div className="container py-5">
        <h2 className="text-center mb-4">Scopri Nuovi Vinili</h2>
        <Carousel interval={5000} className="vinyl-carousel">
          {vinylGroups.map((group, index) => (
            <Carousel.Item key={index}>
              <div className="row g-4">
                {group.map((vinyl) => (
                  <div key={vinyl.id} className="col-md-3">
                    <div className="card h-100 d-flex flex-column">
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
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{vinyl.title}</h5>
                        <p className="card-text">{vinyl.artist}</p>
                        <p className="card-text">
                          <small className="text-muted">
                            {vinyl.year} - {vinyl.genre?.join(', ')}
                          </small>
                        </p>
                        <div className="mt-auto text-center">
                          <Link
                            to={`/vinyl/${vinyl.id}`}
                            className="btn btn-primary"
                          >
                            Vedi Album
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Sezione Generi - Invariata */}
      <div className="row mt-5">
        <h2 className="text-center mb-4">Generi più amati</h2>
        {['Rock', 'Jazz', 'Hip Hop', 'Electronic'].map((genre) => (
          <div key={genre} className="col-md-3 mb-4">
            <Link
              to={`/browse?genre=${genre.toLowerCase()}&from=popular`}
              className="text-decoration-none"
            >
              <div className="card bg-dark text-white hover-overlay h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <h3 className="card-title mb-3">{genre}</h3>
                  <small className="text-white">
                    Esplora
                    <i className="bi bi-music-note-beamed ms-2"></i>
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