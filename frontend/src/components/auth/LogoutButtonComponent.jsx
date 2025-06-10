import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LogoutButtonComponent = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Rimuovi il token
    localStorage.removeItem('token');
    // Chiama la funzione logout del context
    logout();
    // Reindirizza alla home
    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout} 
      className="btn btn-outline-danger"
      title="Esci"
    >
      <i className="bi bi-box-arrow-right"></i> Logout
    </button>
  );
};

export default LogoutButtonComponent;