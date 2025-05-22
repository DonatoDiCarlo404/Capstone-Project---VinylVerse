import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/LayoutComponent.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import VinylDetail from './pages/VinylDetail.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/vinyl/:id" element={<VinylDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;