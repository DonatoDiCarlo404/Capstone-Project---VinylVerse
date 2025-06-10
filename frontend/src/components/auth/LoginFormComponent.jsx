import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginFormComponent = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

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

      // Callback di successo se fornita
      if (onSuccess) onSuccess();

      // Reindirizza alla home
      navigate('/');
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
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginFormComponent;