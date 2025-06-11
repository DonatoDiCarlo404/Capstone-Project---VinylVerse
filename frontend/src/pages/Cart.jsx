import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Gestione del checkout
  const handleCheckout = () => {
    alert('Acquisto completato con successo, Grazie! Il team di VinylVerse.');
    clearCart();
    navigate('/');
  };

  // Gestione rimozione con conferma
  const handleRemove = (id) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo articolo dal carrello?')) {
      removeFromCart(id);
    }
  };

  // Validazione della quantità
  const handleQuantityChange = (id, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) {
      updateQuantity(id, 1);
    } else if (quantity > 10) {
      updateQuantity(id, 10);
    } else {
      updateQuantity(id, quantity);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Il tuo Carrello</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <i className="bi bi-vinyl empty-cart-icon"></i>
          <h3 className="empty-cart-title">Il tuo carrello è vuoto</h3>
          <p className="empty-cart-text">
            Non hai ancora aggiunto nessun vinile al carrello.<br />
            Esplora il nostro catalogo e trova i tuoi album preferiti!
          </p>
          <button
            className="btn btn-primary empty-cart-button"
            onClick={() => navigate('/search')}
          >
            <i className="bi bi-search me-2"></i>
            Inizia a Cercare
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map(item => (
                <div key={item.id} className="card mb-4 cart-item">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <img
                          src={item.cover_image || "https://via.placeholder.com/150"}
                          alt={item.title}
                          className="img-fluid rounded shadow-sm"
                        />
                      </div>
                      <div className="col-md-4">
                        <h5 className="card-title mb-1">{item.title}</h5>
                        <p className="card-text text-muted">{item.artist}</p>
                      </div>
                      <div className="col-md-2">
                        <div className="quantity-control">
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            max="10"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <p className="h5 mb-0">€{(item.price * item.quantity).toFixed(2)}</p>
                        {item.price > 29.99 && (
                          <small className="text-muted">
                            Edizione Speciale
                          </small>
                        )}
                      </div>
                      <div className="col-md-2 text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemove(item.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="card checkout-card sticky-top" style={{ top: '2rem' }}>
                <div className="card-body">
                  <h5 className="card-title mb-4">Riepilogo Ordine</h5>

                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotale</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Spedizione</span>
                    <span>Gratuita</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <strong>Totale</strong>
                    <strong>€{total.toFixed(2)}</strong>
                  </div>

                  <button
                    className="btn btn-outline-danger w-100 mb-3"
                    onClick={() => {
                      if (window.confirm('Sei sicuro di voler svuotare il carrello?')) {
                        clearCart();
                      }
                    }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Svuota Carrello
                  </button>

                  <button
                    className="btn btn-success w-100"
                    onClick={handleCheckout}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Procedi al Checkout
                  </button>

                  <button
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={() => navigate('/search')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Continua ad Esplorare
                  </button>

                  <button
                    className="btn btn-primary w-100 mt-2"
                    onClick={() => navigate(-1)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Indietro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;