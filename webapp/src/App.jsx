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
          <Route path="/" element={<Home />} />
          <Route path="/horarios" element={<Horarios />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
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
