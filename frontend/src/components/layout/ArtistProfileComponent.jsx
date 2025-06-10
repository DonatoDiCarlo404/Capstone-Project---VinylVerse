import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ArtistProfileComponent = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [artistRes, releasesRes] = await Promise.all([
          fetch(`/api/vinyl/artist/${id}`),
          fetch(`/api/vinyl/artist/${id}/releases`)
        ]);

        const artistData = await artistRes.json();
        const releasesData = await releasesRes.json();

        setArtist(artistData);
        setReleases(releasesData.releases);
      } catch (error) {
        console.error('Errore nel caricamento dati artista:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <img 
            src={artist?.images?.[0]?.uri || 'placeholder.jpg'} 
            alt={artist?.name}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-8">
          <h1>{artist?.name}</h1>
          <p className="text-muted">{artist?.profile}</p>
        </div>
      </div>

      <h2 className="mt-5 mb-4">Discografia</h2>
      <div className="row g-4">
        {releases.map(release => (
          <div key={release.id} className="col-md-3">
            <div className="card h-100">
              <img 
                src={release.thumb || 'placeholder.jpg'} 
                className="card-img-top"
                alt={release.title}
              />
              <div className="card-body">
                <h5 className="card-title">{release.title}</h5>
                <p className="card-text">
                  <small className="text-muted">{release.year}</small>
                </p>
                <Link 
                  to={`/vinyl/${release.id}`}
                  className="btn btn-primary"
                >
                  Dettagli
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistProfileComponent;