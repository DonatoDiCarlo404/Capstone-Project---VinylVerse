import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const UserProfileComponent = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Non autorizzato');
                }

                const data = await response.json();
                setUserData(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);
    
    console.log('Reviews:', userData?.reviews);

    if (loading) return <div>Caricamento...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return(
        <div className="container py-5">
            <div className="row">
                <div className="col-12">
                    <h2>Il Mio Profilo</h2>
                    {userData && (
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">Informazioni Utente</h5>
                                        <p><strong>Username:</strong> {userData?.profile?.username}</p>
                                        <p><strong>Email:</strong> {userData?.profile?.email}</p>
                                        <p><strong>Membro dal:</strong> {new Date(userData?.profile?.createdAt).toLocaleDateString()}</p>

                                        {/* Statistiche Utente */}
                                        <hr className="my-4" />
                                        <div className="d-flex justify-content-around text-center">
                                            <div>
                                                <h3 className="mb-0">{userData.reviews?.length || 0}</h3>
                                                <small className="text-muted">Recensioni</small>
                                            </div>
                                            <div className="border-start border-2"></div>
                                            <div>
                                                <h3 className="mb-0">{userData.profile?.orderHistory?.length || 0}</h3>
                                                <small className="text-muted">Ordini</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resto del codice invariato per ordini e recensioni */}
                            <div className="col-md-8">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="card-title mb-0">Dischi Acquistati</h5>
                                            <span className="badge bg-primary">
                                                {userData.profile?.orderHistory?.length || 0} ordini
                                            </span>
                                        </div>
                                        {userData.profile?.orderHistory?.length > 0 ? (
                                            <ul className="list-unstyled">
                                                {userData.profile.orderHistory.map(order => (
                                                    <li key={order._id} className="mb-2">
                                                        {order.items?.map(item => item.vinyl?.title).join(', ')}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Nessun disco acquistato</p>
                                        )}
                                    </div>
                                </div>

                                {/* Sezione Recensioni invariata */}
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="card-title mb-0">Recensioni</h5>
                                            <span className="badge bg-primary">
                                                {userData.reviews?.length || 0} recensioni
                                            </span>
                                        </div>
                                        {/* Resto del codice per le recensioni invariato */}
                                        {userData.reviews?.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {userData.reviews.map(review => (
                                                    <li key={review.id} className="list-group-item">
                                                        {/* Contenuto recensione invariato */}
                                                        <div className="border-start border-4 border-primary ps-3">
                                                            <h6 className="mb-1 text-primary">{review.vinylTitle}</h6>
                                                            <p className="mb-1 small text-muted">di {review.vinylArtist}</p>
                                                            <p className="mb-2">{review.text}</p>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">
                                                                    Recensito il {new Date(review.createdAt).toLocaleDateString()}
                                                                </small>
                                                                <div className="text-warning">
                                                                    {[...Array(review.rating || 0)].map((_, index) => (
                                                                        <i
                                                                            key={`star-${review.id}-${index}`}
                                                                            className="bi bi-star-fill"
                                                                        ></i>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-3">
                                                <i className="bi bi-chat-square-text display-4 text-muted"></i>
                                                <p className="mt-2">Nessuna recensione pubblicata</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileComponent;