import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach((elem) => {
      observer.observe(elem);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative w-full h-[870px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxPZXbvzxQ6w8RgzYnzNcibUivdriJ72Blq3FJUo013R9NARmiIG9cDjOmftN6Zs7Cbxgw861_ilgH48dLGa18j2dCn4or3_xnZ2Xrf1APyaOw859j2hE2tBzBibPD1ejZW7ZrNPt9daXq4BWozQ1SO8VnJ8rTQWrHsXPi4siIw0CyoNzih8I1_Af5Y7DSa4bgRHl6C3rHCtJsa5uFKF-765ZiktuLGH-sakhe1YM81xTuAIx7HErE')"}}
          ></div>
          <div className="absolute inset-0 bg-primary/70"></div>
        </div>
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto fade-in-up">
          <h1 className="font-display-lg text-display-lg text-on-primary mb-6 leading-tight">
            Precisión en el <br/><span className="text-secondary-fixed">Rendimiento</span>
          </h1>
          <p className="font-body-lg text-body-lg text-surface-variant mb-8 max-w-2xl mx-auto">
            Eleva tu nivel con entrenamiento de élite, instalaciones de última generación y una comunidad impulsada por la excelencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/horarios" className="bg-secondary-container text-on-secondary-container font-label-bold text-label-bold px-8 py-4 rounded-xl shadow-[0_4px_14px_rgba(255,133,27,0.39)] hover:shadow-[0_6px_20px_rgba(255,133,27,0.23)] hover:-translate-y-1 transition-all duration-300 inline-block">
              Unirse al Club
            </Link>
            <Link to="/horarios" className="bg-transparent border-2 border-on-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-xl hover:bg-on-primary hover:text-primary transition-all duration-300 inline-block">
              Explorar Programas
            </Link>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-bright" id="about">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4 text-gradient">Nuestra Filosofía</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mx-auto">
              Creemos en formar campeones dentro y fuera de la cancha a través de una dedicación implacable, dominio táctico y acondicionamiento físico.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            <div className="md:col-span-2 glass-panel rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden group fade-in-up">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500 z-0" 
                style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBx81IZApdAUiyXX8DKZjW1G_P-Hfbd9c8s6R4FK8YxEEmf19zuFvRAIHDvMpKCVqMg5BKdi9ZBOxl7auF9TFwGx6vHon2Szi6FLTu8fxKEUpcueywPG2qOWlWak5eUsjmEv0FXjJHSkSpp8cjM76ytwbjWvayglTuU1xz0q9DSGwvabmdnJ3pKpgWXkalw1tblEeUQ1DOQnf9aogs8oYAUjoyetwwWtxNsQr7n4g2pyIX1K7urXOz5')"}}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 to-transparent z-10"></div>
              <div className="relative z-20">
                <span className="material-symbols-outlined text-secondary-fixed mb-4 text-[40px]" style={{fontVariationSettings: "'FILL' 1"}}>strategy</span>
                <h3 className="font-headline-md text-headline-md text-on-primary mb-2">Supremacía Táctica</h3>
                <p className="font-body-md text-body-md text-surface-variant">Análisis avanzado y regímenes de entrenamiento enfocados en la estrategia diseñados para el juego moderno.</p>
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm hover:shadow-md transition-shadow fade-in-up" style={{transitionDelay: '100ms'}}>
              <span className="material-symbols-outlined text-primary mb-4 text-[32px]">fitness_center</span>
              <h3 className="font-label-bold text-label-bold text-primary mb-2 text-lg">Acondicionamiento de Élite</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">Programas de fuerza y agilidad de última generación adaptados para el salto vertical y la potencia explosiva.</p>
            </div>

            <div className="bg-primary-container text-on-primary-container rounded-2xl p-8 flex flex-col justify-center items-center text-center fade-in-up" style={{transitionDelay: '200ms'}}>
              <span className="font-display-lg text-display-lg text-secondary-fixed mb-2">50+</span>
              <span className="font-label-bold text-label-bold">Campeonatos Ganados</span>
            </div>

            <div className="md:col-span-2 bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm flex items-center gap-6 fade-in-up" style={{transitionDelay: '300ms'}}>
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary-container text-[32px]">groups</span>
              </div>
              <div>
                <h3 className="font-label-bold text-label-bold text-primary mb-1 text-lg">Comunidad y Cultura</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Únete a una red de atletas apasionados comprometidos con el crecimiento mutuo y el apoyo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface" id="training">
        <div className="max-w-container-max mx-auto">
          <div className="flex justify-between items-end mb-12 fade-in-up">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-2 text-gradient">Programas de Entrenamiento</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Desarrollo a medida para cada etapa de tu viaje atlético.</p>
            </div>
            <Link to="/horarios" className="hidden md:flex items-center gap-2 text-primary font-label-bold text-label-bold hover:text-secondary transition-colors">
              Ver Todo <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 group fade-in-up">
              <div className="h-48 overflow-hidden relative">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlqxahNtWljiBwI46ZmnYUJG84neqxrSEjrGJvBW-YmSAsFh9TYgr58H6Dc0Wzp269tx5H_ajP1KmtVBp_GpQIvZXQA2Jh7ob2ZyfpYdnfd7nzYwBHzMLDTkvEmL1HEx0fb6h61vGdSBcnTsMaFqyJGzGypxQ6T4FTHItCQQDUihZU98Uwyn0CoTYccoZ5GVoiQSl4VataZ1e4YfYcfjCu30WvNII3sifS2rg63aaaUoLBRHfbXrkm')"}}
                ></div>
                <div className="absolute top-4 left-4 bg-surface text-primary px-3 py-1 rounded-full font-caption text-caption">Edades 8-14</div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Academia Juvenil</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-sm">Enfocados en los fundamentos, habilidades motoras y en fomentar el amor por el juego en un ambiente positivo.</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-primary">$150/mes</span>
                  <Link to="/horarios" className="text-secondary font-label-bold text-label-bold hover:underline">Inscríbete Ahora</Link>
                </div>
              </div>
            </div>

            <div className="bg-primary border border-tertiary rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative fade-in-up" style={{transitionDelay: '100ms'}}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-tertiary-fixed-dim"></div>
              <div className="h-48 overflow-hidden relative">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-80" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCXAYvvvwH2JfsX48kRiRLy97T6PzOxRkzQs2-6gxR0aWt5Fg6v_1bJZYYkYOpBUC3q2QXhOwFTm3AqHqkFBNyUGtKSPrph4_AUqZMvB9u9a2YHOZ9KJI95EYEohzYr3fP7_4q4wmFIvXezqBMoQBKixodfZUB8Mnz9SPmGCI-Z-a6AGUUUD9vnESn_8OjEMmEIrYkb9TZt7_xZq8ZNLGmYB5uYvIJI8ffLbNjrBdl_mLXrcE6sqRH')"}}
                ></div>
                <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full font-caption text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> Nivel Élite
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-on-primary mb-2">Profesional Senior</h3>
                <p className="font-body-md text-body-md text-surface-variant mb-6 text-sm">Entrenamiento de alta intensidad para atletas competitivos que apuntan a niveles universitarios o profesionales.</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-on-primary">$300/mes</span>
                  <Link to="/horarios" className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-label-bold text-label-bold text-sm hover:bg-secondary hover:text-on-secondary transition-colors inline-block">Aplicar</Link>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 group fade-in-up" style={{transitionDelay: '200ms'}}>
              <div className="h-48 overflow-hidden relative">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDypaWYWlvNTdKYh9THn4pmy-oSBZo-BTbVDEUarD_GZDjPXVfOYPo8jUVv9KXMj9juHnN8qXY9HB35WD_GsfwUeI34NEqeexzt95guVQ5jLgJd0nWIenEWpFIJ-UoG6hpx50biTYEkvKfoYzbNEwnjpelmvOrNf0t_4ex6MZAfqlMkfRXjIqmHmyrpUL5U6V4mo4C8f7NXxe6l9GblunHR9WXfg-fW_FtUeWYRhjT7OqpgiCcKSw8k')"}}
                ></div>
                <div className="absolute top-4 left-4 bg-surface text-primary px-3 py-1 rounded-full font-caption text-caption">Adultos 18+</div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Liga Recreativa</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-sm">Mantente activo, mejora tus habilidades y disfruta del juego competitivo en un entorno estructurado y divertido.</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-primary">$100/mes</span>
                  <Link to="/horarios" className="text-secondary font-label-bold text-label-bold hover:underline">Unirse a la Liga</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
