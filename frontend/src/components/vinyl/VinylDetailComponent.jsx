import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import SpinnerComponent from '../layout/SpinnerComponent';

const VinylDetailComponent = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [vinyl, setVinyl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vinyl details
        const vinylResponse = await fetch(`http://localhost:3001/api/vinyl/${id}`);
        if (!vinylResponse.ok) throw new Error('Vinile non trovato');
        const vinylData = await vinylResponse.json();

        // Transform tracklist data
        const transformedData = {
          ...vinylData,
          tracklist: vinylData.tracklist.map(track => ({
            ...track,
            duration: track.duration?.trim() || '-',
            preview_url: track.preview_url || null
          }))
        };

        // Fetch comments
        const commentsResponse = await fetch(`http://localhost:3001/api/comments/vinyl/${id}`);
        if (!commentsResponse.ok) throw new Error('Errore nel caricamento dei commenti');
        const commentsData = await commentsResponse.json();

        // Add artificial delay for spinner (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        setVinyl(transformedData);
        setComments(commentsData);
      } catch (err) {
        console.error('Errore:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePreview = (preview) => {
    setCurrentPreview(preview);
    setShowPlayer(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Token utilizzato:', token);

      const commentData = {
        vinylId: id,
        text: newComment,
        rating: newRating
      };
      console.log('Dati commento:', commentData);

      const response = await fetch('http://localhost:3001/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nell\'aggiunta del commento');
      }

      setComments(prevComments => [data, ...prevComments]);
      setNewComment('');
      setNewRating(0);
    } catch (err) {
      console.error('Errore dettagliato:', err);
      alert(err.message);
    }
  };

  const handleEditComment = async (commentId, newText, newRating) => {
    try {
      console.log('Modifica commento:', { commentId, newText, newRating }); // Debug

      const response = await fetch(`http://localhost:3001/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: newText,
          rating: newRating
        })
      });

      if (!response.ok) throw new Error('Failed to update comment');

      const updatedComment = await response.json();
      console.log('Commento aggiornato:', updatedComment); // Debug

      setComments(comments.map(c =>
        c._id === commentId ? updatedComment : c
      ));
      setEditingComment(null);
      setEditText('');
      setEditRating(0);
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Errore durante la modifica del commento');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo commento?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <SpinnerComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!vinyl) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          Vinile non trovato
        </div>
      </div>
    );
  }

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
                e.target.src = '/vinyl-placeholder.jpg';
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
                    {vinyl.tracklist.map((track, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{track.title}</td>
                        <td>{track.duration}</td>
                        <td>
                          {/* Mostra sempre il bottone, ma disabilitato se non c'è preview */}
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => track.preview_url && handlePreview(track)}
                            title={track.preview_url ? "Ascolta Anteprima" : "Anteprima non disponibile"}
                            disabled={!track.preview_url}
                          >
                            <i className={`bi bi-${track.preview_url ? 'play-circle' : 'dash-circle'}`}></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-4">
              <h5 className="mb-3">Commenti e Recensioni</h5>

              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="form-group">
                    <textarea
                      className="form-control mb-2"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Scrivi un commento..."
                      rows="3"
                      required
                    />
                    <input
                      type="number"
                      className="form-control mb-2"
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      min="1"
                      max="5"
                      placeholder="Valutazione (1-5)"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Pubblica Commento
                  </button>
                </form>
              ) : (
                <div className="alert alert-info">
                  Effettua il login per lasciare un commento
                </div>
              )}

              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment._id} className="card mb-3">
                    <div className="card-body">
                      {editingComment === comment._id ? (
                        // Form di modifica
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleEditComment(comment._id, editText, editRating);
                        }}>
                          <textarea
                            className="form-control mb-2"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows="3"
                            required
                          />
                          <input
                            type="number"
                            className="form-control mb-2"
                            value={editRating}
                            onChange={(e) => setEditRating(Number(e.target.value))}
                            min="1"
                            max="5"
                            required
                          />
                          <div className="btn-group">
                            <button type="submit" className="btn btn-primary btn-sm">
                              Salva
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingComment(null);
                                setEditText('');
                                setEditRating(0);
                              }}
                            >
                              Annulla
                            </button>
                          </div>
                        </form>
                      ) : (
                        // Visualizzazione commento
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1">{comment.text}</p>
                            <div className="text-muted small">
                              <span className="me-2">
                                <i className="bi bi-person"></i> {comment.user?.username || 'Utente'}
                              </span>
                              <span>
                                <i className="bi bi-calendar3"></i> {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              <span className="ms-2">
                                <i className="bi bi-star-fill text-warning"></i> {comment.rating}
                              </span>
                            </div>
                          </div>

                          {isAuthenticated && user?.id === comment.user?._id && (
                            <div className="btn-group">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  setEditingComment(comment._id);
                                  setEditText(comment.text);
                                  setEditRating(comment.rating);
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteComment(comment._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPreview?.title || 'Anteprima (30s)'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {currentPreview?.preview_url && (
            <div className="audio-preview-container">
              <iframe
                src={currentPreview.preview_url}
                title={currentPreview.title}
                allow="autoplay"
                className="audio-preview-frame"
                style={{
                  width: '100%',
                  height: '80px',
                  border: 'none',
                  borderRadius: '4px'
                }}
              ></iframe>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VinylDetailComponent;