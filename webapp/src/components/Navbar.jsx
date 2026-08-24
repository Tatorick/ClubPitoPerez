import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Horarios', path: '/horarios' },
    { name: 'Precios', path: '/horarios#precios' },
    { name: 'Blog', path: '/blog' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Sobre Nosotros', path: '/#about' },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 bg-surface dark:bg-primary border-b border-outline-variant transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img alt="Pito Pérez Voleibol Club Logo" className="h-12 md:h-16 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-gGkzly7uISZFSdfCQ1t29d4cPhaUkWyRZNzI5Hab5W6b7u3aV1QhtzLhA39R2yxtiFf2fhDs7fjw3N7i2SVL28PXAMOgnBo15oAvtqfmB9WU7jYSk09mVBZhdJT2PNe5WVp_QaqTmL_ibrTd44bdJpk5rXQK04QSZ0jynH-k91ybxPhy-bkVNQVDpLm6eQ2dZ_42ZkbdCdgw_MBKJSwux0vKOaL3SA4he4v7-Q6Ykoie4BhTvVdYNdCBl-kQEfXg7w" />
            <div className="hidden md:flex flex-col text-primary dark:text-on-primary ml-2 leading-tight justify-center">
              <span className="font-caption text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Club</span>
              <span className="text-headline-md font-headline-md font-bold -mt-1">Pito Pérez</span>
            </div>
          </Link>
        </div>

        {/* Links desktop */}
        <ul className="hidden md:flex gap-gutter items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`font-body-md transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-secondary font-bold border-b-2 border-secondary pb-1'
                    : 'text-on-surface-variant dark:text-primary-fixed-dim hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Acciones desktop */}
        <div className="hidden md:flex gap-base items-center">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="font-label-bold text-label-bold text-secondary hover:text-primary px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Admin
                </Link>
              )}
              <Link
                to="/perfil"
                className="font-label-bold text-label-bold text-primary hover:text-secondary px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                {user.user_metadata?.nombre?.split(' ')[0] || user.email.split('@')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="font-label-bold text-label-bold bg-surface-variant text-on-surface-variant px-4 py-2 rounded hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-label-bold text-label-bold text-primary hover:text-secondary px-4 py-2 transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="font-label-bold text-label-bold bg-secondary text-on-secondary px-6 py-2 rounded shadow-sm hover:-translate-y-0.5 transition-transform inline-block">
                Únete al Club
              </Link>
            </>
          )}
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          className="md:hidden text-primary p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {/* Menú mobile desplegable */}
      {mobileOpen && (
        <div className="md:hidden fixed top-20 left-0 right-0 z-40 bg-surface border-b border-outline-variant shadow-lg animate-[fadeIn_0.15s_ease-out]">
          <ul className="flex flex-col px-margin-mobile py-4 gap-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg font-body-md transition-colors ${
                    location.pathname === link.path
                      ? 'bg-secondary/10 text-secondary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            <li className="border-t border-outline-variant mt-2 pt-3">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link to="/perfil" className="flex items-center gap-2 px-4 py-3 rounded-lg text-primary font-label-bold hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    Mi Perfil — {user.user_metadata?.nombre?.split(' ')[0] || user.email.split('@')[0]}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-lg text-secondary font-label-bold hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-lg text-error font-label-bold hover:bg-error-container/20 transition-colors w-full text-left">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="block px-4 py-3 rounded-lg text-primary font-label-bold hover:bg-surface-container transition-colors text-center">
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" className="block bg-secondary text-on-secondary font-label-bold px-4 py-3 rounded-lg text-center hover:opacity-90 transition-opacity">
                    Únete al Club
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
