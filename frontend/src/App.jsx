import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/layout/LayoutComponent';
import Home from './pages/Home';
import Browse from './pages/Browse';
import VinylDetail from './pages/VinylDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import VinylDetailComponent from './components/vinyl/VinylDetailComponent';

function App() {
  return (
   <AuthProvider>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/vinyl/:id" element={<VinylDetailComponent />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
   </AuthProvider> 
  );
}

export default App;