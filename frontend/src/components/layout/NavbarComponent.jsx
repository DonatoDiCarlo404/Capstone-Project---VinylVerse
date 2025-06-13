import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LogoutButton from '../auth/LogoutButtonComponent';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">VinylVerse</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link position-relative" to="/cart">
                Carrello
                <i className="bi bi-cart3 ms-2"></i>
                {itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {itemCount}
                    <span className="visually-hidden">prodotti nel carrello</span>
                  </span>
                )}
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.username || 'Profilo'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link to="/profile" className="dropdown-item">
                        <i className="bi bi-person me-2"></i>
                        Il mio profilo
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li className='text-center'>
                      <LogoutButton />
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;