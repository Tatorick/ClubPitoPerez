import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Horarios from './pages/Horarios';
import Perfil from './pages/Perfil';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Blog from './pages/Blog';
import Galeria from './pages/Galeria';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const isNoLayout = location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/registro';

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className={`flex flex-col min-h-screen ${location.pathname.startsWith('/admin') ? 'h-screen overflow-hidden' : ''}`}>
      {!isNoLayout && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/horarios" element={<Horarios />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas — requieren sesión activa */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          {/* Ruta de admin — requiere sesión + rol admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isNoLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
