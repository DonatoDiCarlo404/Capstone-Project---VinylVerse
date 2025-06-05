import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { vinylAPI } from "../services/api";
import { VinylCoverComponent } from "../components/vinyl/VinylCoverComponent";


const Browse = () => {
  const [vinyls, setVinyls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVinyls = async () => {
      try {
        console.log('Inizio fetching vinili...');
        const data = await vinylAPI.getAll();
        console.log('Vinili caricati;', data);
        setVinyls(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching vinyls:', err);
        setError('Errore nel caricamento dei vinili');
      } finally {
        setLoading(false);
      }
    };

    fetchVinyls();
  }, []);

  if (loading) return <div className="container py-4">Caricamento...</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Browse Vinyl Records</h2>
      
      {/* Filtri */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search records..."
          />
        </div>
        <div className="col-md-3">
          <select className="form-select">
            <option value="">All Genres</option>
            <option value="rock">Rock</option>
            <option value="jazz">Jazz</option>
            <option value="electronic">Electronic</option>
            <option value="classical">Classical</option>
          </select>
        </div>
      </div>

      {/* Griglia Vinili */}
      <div className="row g-4">
        {vinyls.map((vinyl) => (
          <div key={vinyl._id} className="col-md-3">
            <div className="card h-100">
              < VinylCoverComponent vinyl={vinyl} />
              <div className="card-body">
                <h5 className="card-title">{vinyl.title}</h5>
                <p className="card-text">{vinyl.artist}</p>
                <p className="card-text">
                  <small className="text-muted">{vinyl.genre.join(', ')}</small>
                </p>
                <p className="card-text fw-bold">€{vinyl.price}</p>
                <Link 
                  to={`/vinyl/${vinyl._id}`} 
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Browse;