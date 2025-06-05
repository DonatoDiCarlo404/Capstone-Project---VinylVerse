import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

const VinylDetailComponent = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);
  const { id } = useParams();
  const [vinyl, setVinyl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVinylDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/vinyl/detail/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setVinyl(data);
      } catch (err) {
        console.error('Failed to fetch vinyl details:', err);
        setError('Errore nel caricamento dei dettagli del vinile');
      } finally {
        setLoading(false);
      }
    };

    fetchVinylDetails();
  }, [id]);

  const handlePreview = (preview) => {
    setCurrentPreview(preview);
    setShowPlayer(true);
  };

  if (loading) return <div className="container py-5">Caricamento...</div>;
  if (error) return <div className="container py-5 text-danger">{error}</div>;
  if (!vinyl) return <div className="container py-5">Vinile non trovato</div>;

  return (
    <>
      <div className="container py-5">
        <div className="row">
          <div className="col-md-4">
            <img 
              src={vinyl.images?.[0]?.uri}
              alt={vinyl.title}
              className="img-fluid rounded shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/400x400?text=No+Image';
              }}
            />
          </div>
          <div className="col-md-8">
            <h2 className="mb-3">{vinyl.title}</h2>
            <h4 className="text-muted mb-4">{vinyl.artist}</h4>
            
            <div className="mb-4">
              <p><strong>Anno:</strong> {vinyl.year}</p>
              <p><strong>Etichetta:</strong> {vinyl.label}</p>
              <p><strong>Generi:</strong> {vinyl.genres?.join(', ')}</p>
              <p><strong>Formato:</strong> {vinyl.format}</p>
              {vinyl.country && <p><strong>Paese:</strong> {vinyl.country}</p>}
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Tracklist</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>#</th>
                      <th>Titolo</th>
                      <th style={{ width: '15%' }}>Durata</th>
                      <th style={{ width: '10%' }}>Anteprima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vinyl.tracklist.map((track, index) => {
                      const preview = vinyl.preview_urls?.[`track_${index + 1}`];
                      return (
                        <tr key={index}>
                          <td>{track.position}</td>
                          <td>{track.title}</td>
                          <td>{track.duration || '-'}</td>
                          <td className="text-center">
                            {preview ? (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handlePreview(preview)}
                                title="Ascolta anteprima"
                              >
                                <i className="bi bi-play-circle"></i>
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                disabled
                                title="Anteprima non disponibile"
                              >
                                <i className="bi bi-play-fill"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {vinyl.notes && (
              <div className="mb-4">
                <h5>Note</h5>
                <p className="text-muted">{vinyl.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        show={showPlayer}
        onHide={() => setShowPlayer(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPreview?.title || 'Anteprima'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {currentPreview?.preview_url && (
            <div className="ratio ratio-16x9">
              <iframe
                src={currentPreview.preview_url}
                title={currentPreview.title}
                allowFullScreen
              ></iframe>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VinylDetailComponent;