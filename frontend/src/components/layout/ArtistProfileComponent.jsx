import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import SpinnerComponent from './SpinnerComponent';

const ArtistProfileComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/vinyl/artist/${id}`);
        if (!response.ok) throw new Error('Artist not found');
        const data = await response.json();

        setArtist(data.artist);

        // Filtro migliorato e log per debug
        const mainAlbums = data.artist.releases
          .filter(release => {
            console.log('Processing release:', release); // Debug log

            const excludeWords = [
              'live', 'tour', 'sampler', 'promo', 'collection',
              'compilation', 'box set', 'special', 'edition',
              'radio', 'interview', 'story', 'review', 'epk'
            ];

            const title = release.title.toLowerCase();
            const isExcluded = excludeWords.some(word => title.includes(word));

            return (
              !isExcluded &&
              !release.title.match(/\d{2}[-/.]\d{2}/) &&
              !release.format?.toLowerCase().includes('single')
            );
          })
          .map(release => ({
            ...release,
            // Usiamo l'ID corretto per il master release
            master_id: release.main_release || release.master_id || release.id
          }))
          .sort((a, b) => (b.year || 0) - (a.year || 0));

        setReleases(mainAlbums);
      } catch (error) {
        setError('Error fetching artist details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [id]);

  if (loading) {
    return <SpinnerComponent />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container py-5">
      <button
      className="btn btn-secondary mb-4"
      onClick={() => {
        // Store complete artist data including image
        if (artist) {
          localStorage.setItem('lastSearchResults', JSON.stringify({
            artist: {
              ...artist,
              thumb: artist.images?.[0]?.uri || null, // Add thumb property
              id: artist.id,
              name: artist.name
            },
            query: artist.name
          }));
        }
        navigate('/search');
      }}
    >
      <i className="bi bi-arrow-left me-2"></i>
      Torna alla Ricerca
    </button>
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
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Anno</th>
              <th>Titolo</th>
              <th>Tipo</th>
              <th>Label</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {releases.map(release => (
              <tr key={release.id}>
                <td>{release.year || 'N/A'}</td>
                <td>{release.title?.replace(`${artist?.name} - `, '') || release.title}</td>
                <td>{release.type || 'Album'}</td>
                <td>{release.label || 'N/A'}</td>
                <td>
                  <Link
                    to={`/vinyl/${release.master_id}?type=release`}
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setLoading(true);
                      console.log('Navigating to release:', {
                        title: release.title,
                        id: release.master_id,
                        originalId: release.id
                      });
                    }}
                  >
                    Album
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default ArtistProfileComponent;