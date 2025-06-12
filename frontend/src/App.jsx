import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Layout from './components/layout/LayoutComponent';
import Home from './pages/Home';
import Browse from './pages/Browse';
import { LoadingProvider } from './context/LoadingContext';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import VinylDetailComponent from './components/vinyl/VinylDetailComponent';
import SearchComponent from './components/search/SearchComponent';
import ArtistProfileComponent from './components/layout/ArtistProfileComponent';
import { CartProvider } from './context/CartContext';
import UserProfileComponent from './components/layout/UserProfileComponent';

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchComponent />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/browse/:genre" element={<Browse />} />
                <Route path="/artist/:id" element={<ArtistProfileComponent />} />
                <Route path="/vinyl/:id" element={<VinylDetailComponent />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<UserProfileComponent />} />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;