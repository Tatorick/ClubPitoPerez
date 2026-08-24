import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Entrenamiento', path: '/' },
    { name: 'Horarios', path: '/horarios' },
    { name: 'Precios', path: '/horarios#precios' },
    { name: 'Sobre Nosotros', path: '/#about' },
  ];

  return (
    <nav className={`sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 bg-surface dark:bg-primary border-b border-outline-variant transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img alt="Pito Pérez Voleibol Club Logo" className="h-12 md:h-16 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-gGkzly7uISZFSdfCQ1t29d4cPhaUkWyRZNzI5Hab5W6b7u3aV1QhtzLhA39R2yxtiFf2fhDs7fjw3N7i2SVL28PXAMOgnBo15oAvtqfmB9WU7jYSk09mVBZhdJT2PNe5WVp_QaqTmL_ibrTd44bdJpk5rXQK04QSZ0jynH-k91ybxPhy-bkVNQVDpLm6eQ2dZ_42ZkbdCdgw_MBKJSwux0vKOaL3SA4he4v7-Q6Ykoie4BhTvVdYNdCBl-kQEfXg7w" />
          <div className="hidden md:flex flex-col text-primary dark:text-on-primary ml-2 leading-tight justify-center">
            <span className="font-caption text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Club</span>
            <span className="text-headline-md font-headline-md font-bold -mt-1">Pito Pérez</span>
          </div>
        </Link>
      </div>
      
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

      <div className="flex gap-base items-center">
        <Link to="/login" className="font-label-bold text-label-bold text-primary hover:text-secondary px-4 py-2 transition-colors">
          Iniciar Sesión
        </Link>
        <Link to="/registro" className="font-label-bold text-label-bold bg-secondary text-on-secondary px-6 py-2 rounded shadow-sm hover:-translate-y-0.5 transition-transform inline-block">
          Únete al Club
        </Link>
      </div>
      
      <button className="md:hidden text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>menu</span>
      </button>
    </nav>
  );
}
