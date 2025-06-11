import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginFormComponent from '../components/auth/LoginFormComponent';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <LoginFormComponent onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default Login;