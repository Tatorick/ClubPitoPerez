import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1KDs8UTPjF/?mibextid=wwXIfr',
      handle: 'Club Pito Perez',
      color: 'hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/clubpitoperezcuenca?igsi=NzYyYTZsODkza3N4',
      handle: '@clubpitoperezcuenca',
      color: 'hover:bg-[#E4405F]/20 hover:text-[#E4405F] hover:border-[#E4405F]/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@clubpitoperezcuenca?_r=1&_t=ZS-99BCar7r8Jk',
      handle: '@clubpitoperezcuenca',
      color: 'hover:bg-[#00F2FE]/20 hover:text-[#00F2FE] hover:border-[#00F2FE]/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.28 6.28 0 0 0 1.88-4.49V8.65a8.28 8.28 0 0 0 4.84 1.54V6.74c-.33-.01-.65-.03-.95-.05z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-[#000613] text-on-primary border-t border-slate-800/80 relative overflow-hidden mt-auto">
      {/* Glow decorativo de fondo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Banner Superior de Llamado a la Acción */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-10">
        <div className="bg-gradient-to-r from-primary-container/90 via-slate-900 to-primary-container/90 border border-slate-700/60 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-secondary/15 to-transparent pointer-events-none" />
          
          <div className="text-center md:text-left z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary-fixed border border-secondary/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Inscripciones Abiertas
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              ¿Listo para entrenar con los mejores de Cuenca?
            </h3>
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              Únete a nuestras categorías infantiles, formativas o de alto rendimiento y alcanza tu máximo potencial en la cancha.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto shrink-0">
            <Link
              to="/registro"
              className="bg-secondary text-white font-label-bold text-sm px-6 py-3.5 rounded-xl hover:bg-[#ff851b] hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5 transition-all text-center"
            >
              Inscribirme Ahora
            </Link>
            <Link
              to="/horarios"
              className="bg-slate-800/80 border border-slate-600 text-slate-200 font-label-bold text-sm px-6 py-3.5 rounded-xl hover:bg-slate-700 hover:text-white transition-all text-center"
            >
              Ver Horarios
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Principal del Footer */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Columna 1: Identidad, Logo y Redes Sociales */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-secondary/30 rounded-full blur-sm group-hover:bg-secondary/50 transition-colors" />
                <img
                  alt="Pito Pérez Voleibol Club Logo"
                  className="relative h-14 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-gGkzly7uISZFSdfCQ1t29d4cPhaUkWyRZNzI5Hab5W6b7u3aV1QhtzLhA39R2yxtiFf2fhDs7fjw3N7i2SVL28PXAMOgnBo15oAvtqfmB9WU7jYSk09mVBZhdJT2PNe5WVp_QaqTmL_ibrTd44bdJpk5rXQK04QSZ0jynH-k91ybxPhy-bkVNQVDpLm6eQ2dZ_42ZkbdCdgw_MBKJSwux0vKOaL3SA4he4v7-Q6Ykoie4BhTvVdYNdCBl-kQEfXg7w"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-caption text-[11px] text-secondary uppercase tracking-[0.25em] font-bold">Club Deportivo</span>
                <span className="font-headline-md text-xl font-bold text-white group-hover:text-secondary-fixed transition-colors">Pito Pérez Voleibol</span>
              </div>
            </Link>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Formación técnica, táctica y humana en Cuenca, Ecuador. Elevando a atletas con disciplina, pasión y excelencia competitiva.
            </p>

            {/* Redes Sociales */}
            <div className="mt-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-3">
                Síguenos en Redes Sociales
              </span>
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar nuestro perfil de ${social.name}`}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 transition-all duration-300 ${social.color} hover:-translate-y-1 hover:shadow-md group`}
                  >
                    <span className="transition-transform group-hover:scale-110">
                      {social.icon}
                    </span>
                    <span className="text-xs font-semibold">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div className="lg:col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/horarios" className="text-slate-300 hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>
                  Horarios de Entreno
                </Link>
              </li>
              <li>
                <Link to="/horarios#precios" className="text-slate-300 hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>
                  Membresías & Tarifas
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-slate-300 hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>
                  Galería Multimedia
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-300 hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>
                  Blog & Torneos
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-slate-300 hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Categorías y Formación */}
          <div className="lg:col-span-3 md:col-span-1">
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Programas Deportivos
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">sports_volleyball</span>
                <div>
                  <span className="font-medium text-white block">Iniciación Infantil (U10 - U12)</span>
                  <span className="text-xs text-slate-400">Fundamentos y desarrollo motriz</span>
                </div>
              </li>
              <li className="text-slate-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">military_tech</span>
                <div>
                  <span className="font-medium text-white block">Formativa Junior (U14 - U16)</span>
                  <span className="text-xs text-slate-400">Táctica y perfeccionamiento técnico</span>
                </div>
              </li>
              <li className="text-slate-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">trophy</span>
                <div>
                  <span className="font-medium text-white block">Varsity & Alto Rendimiento</span>
                  <span className="text-xs text-slate-400">Competencia de nivel intercolegial</span>
                </div>
              </li>
              <li className="text-slate-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">fitness_center</span>
                <div>
                  <span className="font-medium text-white block">Acondicionamiento y Salto</span>
                  <span className="text-xs text-slate-400">Potencia explosiva y resistencia</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto y Ubicación */}
          <div className="lg:col-span-3 md:col-span-2 lg:col-span-3">
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Contacto & Sede
            </h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <div>
                  <span className="font-medium text-white block">Sede Cuenca</span>
                  <span className="text-xs text-slate-400">Cuenca, Azuay, Ecuador</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div>
                  <span className="font-medium text-white block">Horario de Entrenamientos</span>
                  <span className="text-xs text-slate-400">Lunes a Viernes: 06:00 - 20:30<br/>Sábados: Partidos y Cancha Abierta</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <div>
                  <span className="font-medium text-white block">Cuerpo Técnico</span>
                  <span className="text-xs text-slate-400">Kevin Culcay (FIV 1) & Marcos Pérez (FIV 3)</span>
                </div>
              </div>

              {/* Botón Acceso Atletas */}
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-secondary-fixed bg-secondary/15 border border-secondary/30 px-3.5 py-2 rounded-lg hover:bg-secondary/25 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">account_circle</span>
                  Portal de Atletas & Administración
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Línea Divisoria y Barra Inferior */}
      <div className="border-t border-slate-800/80 bg-black/40">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center md:text-left">
            <span>© {currentYear} Club Pito Pérez Voleibol Club. Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4 text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="text-secondary">🏐</span> Pasión, Técnica y Excelencia en Cuenca, Ecuador
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
