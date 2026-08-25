import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, CATEGORIAS } from '../data/blogData';
import { ALBUMES } from '../data/galeriaData';

// ── Entrenadores del Club ──────────────────────────────────────────────────────
const ENTRENADORES = [
  {
    nombre: 'Kevin Culcay',
    rol: 'Entrenador Principal',
    certificacion: 'FIV 1',
    iniciales: 'KC',
    accentColor: 'bg-secondary',
    bio: 'Entrenador certificado FIV nivel 1 con amplia experiencia en competencias nacionales. Lidera el desarrollo técnico y táctico de las categorías mayores del Club Pito Pérez. Especialista en formación de jugadoras de alto rendimiento.',
    especialidades: ['Táctica Avanzada', 'Categorías U14–U16', 'Alto Rendimiento'],
    icon: 'military_tech',
  },
  {
    nombre: 'Marcos Pérez',
    rol: 'Entrenador Principal Infantil',
    certificacion: 'FIV 3',
    iniciales: 'MP',
    accentColor: 'bg-blue-500',
    bio: 'Entrenador certificado FIV nivel 3 con pasión por el desarrollo formativo. Responsable de las categorías infantiles y la iniciación al voleibol de alta calidad. Enfocado en los fundamentos técnicos y el amor por el deporte.',
    especialidades: ['Formación Base', 'Categorías U10–U12', 'Técnica Fundamental'],
    icon: 'sports_volleyball',
  },
];

export default function Home() {
  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Últimos 3 posts para preview
  const previewPosts = BLOG_POSTS.slice(0, 3);
  // Primer álbum para preview
  const previewAlbum = ALBUMES[0];

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <header className="relative w-full min-h-[100svh] sm:min-h-0 sm:h-[700px] md:h-[870px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxPZXbvzxQ6w8RgzYnzNcibUivdriJ72Blq3FJUo013R9NARmiIG9cDjOmftN6Zs7Cbxgw861_ilgH48dLGa18j2dCn4or3_xnZ2Xrf1APyaOw859j2hE2tBzBibPD1ejZW7ZrNPt9daXq4BWozQ1SO8VnJ8rTQWrHsXPi4siIw0CyoNzih8I1_Af5Y7DSa4bgRHl6C3rHCtJsa5uFKF-765ZiktuLGH-sakhe1YM81xTuAIx7HErE"
            alt="Jugadoras de voleibol del Club Pito Pérez"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto fade-in-up">
          <h1 className="font-display-lg text-display-lg text-on-primary mb-6 leading-tight">
            Precisión en el <br/><span className="text-secondary-fixed">Rendimiento</span>
          </h1>
          <p className="font-body-lg text-body-lg text-surface-variant mb-8 max-w-2xl mx-auto">
            Eleva tu nivel con entrenamiento de élite, instalaciones de última generación y una comunidad impulsada por la excelencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registro" className="bg-secondary-container text-on-secondary-container font-label-bold text-label-bold px-8 py-4 rounded-xl shadow-[0_4px_14px_rgba(255,133,27,0.39)] hover:shadow-[0_6px_20px_rgba(255,133,27,0.23)] hover:-translate-y-1 transition-all duration-300 inline-block">
              Unirse al Club
            </Link>
            <Link to="/horarios" className="bg-transparent border-2 border-on-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-xl hover:bg-on-primary hover:text-primary transition-all duration-300 inline-block">
              Explorar Programas
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sobre Nosotros ───────────────────────────────────────────────────── */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-bright" id="about">
        <div className="max-w-container-max mx-auto">

          {/* Título sección */}
          <div className="text-center mb-16 fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-secondary inline-block" />
              <span className="font-caption text-caption text-secondary uppercase tracking-widest">Quiénes Somos</span>
              <span className="w-8 h-0.5 bg-secondary inline-block" />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Nuestra Filosofía</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mx-auto">
              Creemos en formar campeonas dentro y fuera de la cancha a través de una dedicación implacable, dominio táctico y acondicionamiento físico.
            </p>
          </div>

          {/* Bento grid filosofía (existente) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)] mb-20">
            <div className="md:col-span-2 glass-panel rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden group fade-in-up">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500 z-0"
                style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBx81IZApdAUiyXX8DKZjW1G_P-Hfbd9c8s6R4FK8YxEEmf19zuFvRAIHDvMpKCVqMg5BKdi9ZBOxl7auF9TFwGx6vHon2Szi6FLTu8fxKEUpcueywPG2qOWlWak5eUsjmEv0FXjJHSkSpp8cjM76ytwbjWvayglTuU1xz0q9DSGwvabmdnJ3pKpgWXkalw1tblEeUQ1DOQnf9aogs8oYAUjoyetwwWtxNsQr7n4g2pyIX1K7urXOz5')"}}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 to-transparent z-10" />
              <div className="relative z-20">
                <span className="material-symbols-outlined text-secondary-fixed mb-4 text-[40px]" style={{fontVariationSettings:"'FILL' 1"}}>strategy</span>
                <h3 className="font-headline-md text-headline-md text-on-primary mb-2">Supremacía Táctica</h3>
                <p className="font-body-md text-body-md text-surface-variant">Análisis avanzado y regímenes de entrenamiento enfocados en la estrategia diseñados para el juego moderno.</p>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm hover:shadow-md transition-shadow fade-in-up" style={{transitionDelay:'100ms'}}>
              <span className="material-symbols-outlined text-primary mb-4 text-[32px]">fitness_center</span>
              <h3 className="font-label-bold text-label-bold text-primary mb-2 text-lg">Acondicionamiento de Élite</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">Programas de fuerza y agilidad de última generación adaptados para el salto vertical y la potencia explosiva.</p>
            </div>
            <div className="bg-primary-container text-on-primary-container rounded-2xl p-8 flex flex-col justify-center items-center text-center fade-in-up" style={{transitionDelay:'200ms'}}>
              <span className="font-display-lg text-display-lg text-secondary-fixed mb-2">50+</span>
              <span className="font-label-bold text-label-bold">Campeonatos Ganados</span>
            </div>
            <div className="md:col-span-2 bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm flex items-center gap-6 fade-in-up" style={{transitionDelay:'300ms'}}>
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary-container text-[32px]">groups</span>
              </div>
              <div>
                <h3 className="font-label-bold text-label-bold text-primary mb-1 text-lg">Comunidad y Cultura</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Únete a una red de atletas apasionadas comprometidas con el crecimiento mutuo y el apoyo.</p>
              </div>
            </div>
          </div>

          {/* ── Historia del Club ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 fade-in-up">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-0.5 bg-secondary inline-block" />
                <span className="font-caption text-caption text-secondary uppercase tracking-widest">Nuestra Historia</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6 leading-tight">
                Un Club Forjado con Pasión por el Voleibol
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 leading-relaxed">
                El Club Pito Pérez Voleibol nació del sueño de crear un espacio donde niñas y jóvenes de Guayaquil puedan desarrollar su máximo potencial en el voleibol, con disciplina, valores y amor por el deporte.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                Desde nuestros inicios, hemos formado jugadoras que hoy representan a sus colegios, a la provincia y al país. Nuestra metodología combina técnica de alto nivel con desarrollo personal, asegurando que cada jugadora crezca no solo en la cancha, sino también como persona.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { valor: '8+', label: 'Años formando atletas' },
                  { valor: '150+', label: 'Jugadoras egresadas' },
                  { valor: '3', label: 'Categorías activas' },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4 bg-surface rounded-xl border border-outline-variant">
                    <div className="font-display-lg text-[32px] text-secondary font-bold leading-none">{stat.valor}</div>
                    <div className="text-xs text-on-surface-variant mt-1 font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-80 shadow-xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1540206395-68808572332e?w=800&q=80')"}}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-secondary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                🏐 Club Pito Pérez V.C.
              </div>
            </div>
          </div>

          {/* ── Nuestros Entrenadores ─────────────────────────────────────────── */}
          <div className="fade-in-up">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="w-8 h-0.5 bg-secondary inline-block" />
                <span className="font-caption text-caption text-secondary uppercase tracking-widest">Cuerpo Técnico</span>
                <span className="w-8 h-0.5 bg-secondary inline-block" />
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-3">Nuestros Entrenadores</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                Un equipo técnico certificado y comprometido con la excelencia deportiva de cada jugadora.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {ENTRENADORES.map((coach, i) => (
                <div
                  key={coach.nombre}
                  className="bg-primary-container rounded-2xl overflow-hidden shadow-xl group hover:-translate-y-1 transition-all duration-300"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Top accent bar */}
                  <div className={`h-1.5 w-full ${coach.accentColor}`} />

                  <div className="p-8">
                    {/* Avatar + nombre */}
                    <div className="flex items-start gap-5 mb-6">
                      <div className="relative shrink-0">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white/10 ${coach.accentColor}`}>
                          {coach.iniciales}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                          <span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings:"'FILL' 1"}}>
                            {coach.icon}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-primary leading-tight">{coach.nombre}</h3>
                        <p className="font-body-md text-body-md text-on-primary-container mt-1 text-sm">{coach.rol}</p>
                        <span className={`inline-flex items-center gap-1 mt-2 px-3 py-0.5 rounded-full text-xs font-bold text-white ${coach.accentColor}`}>
                          <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                          Certificación {coach.certificacion}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="font-body-md text-body-md text-on-primary-container text-sm leading-relaxed mb-6 opacity-80">
                      {coach.bio}
                    </p>

                    {/* Especialidades */}
                    <div>
                      <p className="text-xs text-on-primary-container/60 font-bold uppercase tracking-wider mb-2">Especialidades</p>
                      <div className="flex flex-wrap gap-2">
                        {coach.especialidades.map(esp => (
                          <span key={esp} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-on-primary border border-white/10">
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Programas de Entrenamiento ───────────────────────────────────────── */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface" id="training">
        <div className="max-w-container-max mx-auto">
          <div className="flex justify-between items-end mb-12 fade-in-up">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Programas de Entrenamiento</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Desarrollo a medida para cada etapa de tu viaje atlético.</p>
            </div>
            <Link to="/horarios" className="hidden md:flex items-center gap-2 text-primary font-label-bold text-label-bold hover:text-secondary transition-colors">
              Ver Todo <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 group fade-in-up">
              <div className="h-48 overflow-hidden relative">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlqxahNtWljiBwI46ZmnYUJG84neqxrSEjrGJvBW-YmSAsFh9TYgr58H6Dc0Wzp269tx5H_ajP1KmtVBp_GpQIvZXQA2Jh7ob2ZyfpYdnfd7nzYwBHzMLDTkvEmL1HEx0fb6h61vGdSBcnTsMaFqyJGzGypxQ6T4FTHItCQQDUihZU98Uwyn0CoTYccoZ5GVoiQSl4VataZ1e4YfYcfjCu30WvNII3sifS2rg63aaaUoLBRHfbXrkm')"}} />
                <div className="absolute top-4 left-4 bg-surface text-primary px-3 py-1 rounded-full font-caption text-caption">Edades 8-14</div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Academia Juvenil</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-sm">Enfocados en los fundamentos, habilidades motoras y en fomentar el amor por el juego en un ambiente positivo.</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-primary">$35/mes</span>
                  <Link to="/registro" className="text-secondary font-label-bold text-label-bold hover:underline">Inscríbete Ahora</Link>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-primary border border-tertiary rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative fade-in-up" style={{transitionDelay:'100ms'}}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-tertiary-fixed-dim" />
              <div className="h-48 overflow-hidden relative">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-80" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCXAYvvvwH2JfsX48kRiRLy97T6PzOxRkzQs2-6gxR0aWt5Fg6v_1bJZYYkYOpBUC3q2QXhOwFTm3AqHqkFBNyUGtKSPrph4_AUqZMvB9u9a2YHOZ9KJI95EYEohzYr3fP7_4q4wmFIvXezqBMoQBKixodfZUB8Mnz9SPmGCI-Z-a6AGUUUD9vnESn_8OjEMmEIrYkb9TZt7_xZq8ZNLGmYB5uYvIJI8ffLbNjrBdl_mLXrcE6sqRH')"}} />
                <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full font-caption text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span> Nivel Élite
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-on-primary mb-2">Categoría Competitiva</h3>
                <p className="font-body-md text-body-md text-surface-variant mb-6 text-sm">Entrenamiento de alta intensidad para atletas competitivas que apuntan a torneos provinciales y nacionales.</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-on-primary">$40/mes</span>
                  <Link to="/registro" className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-label-bold text-label-bold text-sm hover:bg-secondary hover:text-on-secondary transition-colors inline-block">Aplicar</Link>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 group fade-in-up" style={{transitionDelay:'200ms'}}>
              <div className="h-48 overflow-hidden relative">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuDypaWYWlvNTdKYh9THn4pmy-oSBZo-BTbVDEUarD_GZDjPXVfOYPo8jUVv9KXMj9juHnN8qXY9HB35WD_GsfwUeI34NEqeexzt95guVQ5jLgJd0nWIenEWpFIJ-UoG6hpx50biTYEkvKfoYzbNEwnjpelmvOrNf0t_4ex6MZAfqlMkfRXjIqmHmyrpUL5U6V4mo4C8f7NXxe6l9GblunHR9WXfg-fW_FtUeWYRhjT7OqpgiCcKSw8k')"}} />
                <div className="absolute top-4 left-4 bg-surface text-primary px-3 py-1 rounded-full font-caption text-caption">Adultos 18+</div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Liga Recreativa</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-sm">Mantente activa, mejora tus habilidades y disfruta del juego competitivo en un entorno estructurado y divertido.</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-primary">$30/mes</span>
                  <Link to="/registro" className="text-secondary font-label-bold text-label-bold hover:underline">Unirse</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Preview del Blog ─────────────────────────────────────────────────── */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-bright">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 fade-in-up gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-0.5 bg-secondary inline-block" />
                <span className="font-caption text-caption text-secondary uppercase tracking-widest">Últimas Publicaciones</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary">Blog del Club</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Noticias, torneos y consejos técnicos de nuestros entrenadores.</p>
            </div>
            <Link
              to="/blog"
              className="flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shrink-0"
            >
              Ver Blog Completo
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {previewPosts.map((post, i) => {
              const cat = CATEGORIAS[post.categoria];
              return (
                <Link
                  key={post.id}
                  to="/blog"
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col fade-in-up"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={post.imagen} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${cat.bg}`}>{cat.label}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-xs text-secondary font-semibold mb-2">{post.fecha}</p>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2 leading-tight line-clamp-2 group-hover:text-secondary transition-colors">
                      {post.titulo}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 flex-grow">{post.extracto}</p>
                    <div className="mt-4 flex items-center gap-1 text-secondary font-semibold text-sm">
                      Leer más <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Preview de la Galería ────────────────────────────────────────────── */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-primary-container relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-secondary rounded-full blur-[80px]" />
          <div className="absolute -right-20 top-0 w-80 h-80 bg-blue-400 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-container-max mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 fade-in-up gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-0.5 bg-secondary inline-block" />
                <span className="font-caption text-caption text-secondary uppercase tracking-widest">Momentos del Club</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-primary">Galería Multimedia</h2>
              <p className="font-body-md text-body-md text-on-primary-container/70 mt-2">
                {previewAlbum.titulo} · {previewAlbum.fotos.length} fotos
              </p>
            </div>
            <Link
              to="/galeria"
              className="flex items-center gap-2 bg-secondary text-white font-label-bold text-label-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300 shrink-0"
            >
              Ver Galería Completa
              <span className="material-symbols-outlined text-[20px]">photo_library</span>
            </Link>
          </div>

          {/* Grid preview: primera foto grande, 4 pequeñas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-80 md:h-96 fade-in-up">
            {/* Foto grande */}
            <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden group cursor-pointer relative">
              <img
                src={previewAlbum.fotos[0].url}
                alt={previewAlbum.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold">🥇 1er Lugar</span>
              </div>
            </div>
            {/* 4 fotos pequeñas */}
            {previewAlbum.fotos.slice(1, 5).map((foto, i) => (
              <div key={foto.id} className="rounded-xl overflow-hidden group cursor-pointer relative">
                <img
                  src={foto.thumb}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {/* Última foto con overlay "Ver más" */}
                {i === 3 && (
                  <Link to="/galeria" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center">
                    <span className="material-symbols-outlined text-3xl mb-1">add_circle</span>
                    <span className="text-xs font-bold">+{previewAlbum.fotos.length - 5} más</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
