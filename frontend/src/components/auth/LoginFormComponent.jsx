import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginFormComponent = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Credenziali non valide');
      }

      const data = await response.json();

      // Salva il token
      localStorage.setItem('token', data.token);

      // Chiama la funzione login del context
      await login(formData);

      // Debug
      console.log('Login effettuato, token salvato:', data.token);

      // Controlla se esiste un returnTo nel localStorage
      const returnTo = localStorage.getItem('returnTo');
      if (returnTo) {
        // Se esiste, pulisci il localStorage e naviga alla pagina salvata
        localStorage.removeItem('returnTo');
        navigate(returnTo);
      } else {
        // Altrimenti, comportamento di default
        if (onSuccess) onSuccess();
        navigate('/');
      }
    } catch (error) {
      console.error('Errore login:', error);
      setError(error.message || 'Errore durante il login');
    }
  };

    return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Accedi</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Accedi
          </button>
          <div className="text-center mt-3">
            <p className="mb-0">Non hai un account?</p>
            <Link to="/register" className="text-primary link-opacity-50-hover link-offset-2">
              Registrati qui
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginFormComponent;