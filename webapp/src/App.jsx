import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// ── Carga diferida de páginas (code splitting) ─────────────────────────────────
// Reduce el bundle inicial de 649 KB a ~150 KB. Cada página carga al navegarla.
const Home     = lazy(() => import('./pages/Home'));
const Horarios = lazy(() => import('./pages/Horarios'));
const Perfil   = lazy(() => import('./pages/Perfil'));
const Admin    = lazy(() => import('./pages/Admin'));
const Login    = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const Blog     = lazy(() => import('./pages/Blog'));
const Galeria  = lazy(() => import('./pages/Galeria'));

// ── Spinner de transición de página ───────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">
          progress_activity
        </span>
        <p className="text-on-surface-variant text-sm font-semibold">Cargando...</p>
      </div>
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
