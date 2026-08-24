import { Link } from 'react-router-dom';

export default function Perfil() {
  return (
    <div className="bg-background text-on-background font-body-md w-full max-w-[container-max] mx-auto px-margin-desktop md:px-margin-desktop py-section-gap">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-gutter mb-12">
        <div className="flex items-center gap-gutter">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-md">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj6uTaHEC8E1yH9JEgdUunGe9Vr1wPOr0MzTDIK41swOjaW9AA3yA7fx2AOS-3C1hl1j8FoYv8Hjl5OIjBsMICAhTL5dWHa7DIbr2eSlWuYaiDnIgmpzYcfZvSz5sAI8cv5xwpaPPg0NI6kPH0vjwF9IiyXZWWeIZs7MP2lJfs365iCbz7EzRTjvBhzs90UMlmbKOjQmr0B7kYsFlUt70veulsDR4TRu-Kpc837164gn5GUq6ru_TM"
              alt="Profile"
            />
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg hidden md:block text-primary">¡Bienvenida de nuevo, Sarah!</h1>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:hidden text-primary">¡Bienvenida de nuevo, Sarah!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">¿Lista para arrasar en tu próxima sesión de entrenamiento?</p>
          </div>
        </div>
        <button className="flex items-center gap-2 font-label-bold text-label-bold bg-surface-container text-primary px-6 py-3 rounded-lg hover:bg-surface-variant transition-colors shadow-sm mt-4 md:mt-0">
          <span className="material-symbols-outlined">edit</span> Editar Perfil
        </button>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* My Schedule Widget */}
        <section className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm p-8 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">calendar_month</span> Mi Horario
            </h2>
            <Link to="/horarios" className="font-label-bold text-label-bold text-secondary hover:underline">Ver Calendario</Link>
          </div>
          
          <div className="flex flex-col gap-base">
            <div className="bg-surface-container p-6 rounded-lg border-l-4 border-secondary flex justify-between items-center">
              <div>
                <div className="font-label-bold text-label-bold text-secondary mb-1">PRÓXIMAMENTE</div>
                <h3 className="font-body-lg text-body-lg text-primary font-semibold">Práctica de Élite y Tácticas</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> Hoy, 6:00 PM - 8:00 PM
                </p>
              </div>
              <div className="text-right">
                <div className="font-headline-md text-headline-md text-primary">Cancha 1</div>
                <div className="font-caption text-caption text-on-surface-variant bg-surface-variant px-2 py-1 rounded mt-1 inline-block">Arena Principal</div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-surface-variant flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
              <div>
                <h3 className="font-body-lg text-body-lg text-primary font-semibold">Fuerza y Acondicionamiento</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> Jue, 26 de Oct, 5:30 PM
                </p>
              </div>
              <div className="text-right">
                <div className="font-headline-md text-headline-md text-primary">Gimnasio</div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Status & Stats */}
        <div className="flex flex-col gap-gutter">
          <section className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-tertiary-container">workspace_premium</span> Estado de la Cuenta
            </h2>
            <div className="mb-6">
              <div className="font-caption text-caption text-on-surface-variant mb-1">NIVEL ACTUAL</div>
              <div className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                Pro Élite
                <span className="bg-tertiary-container text-on-tertiary-container text-xs px-2 py-1 rounded font-bold tracking-wider">ACTIVO</span>
              </div>
            </div>
            <div className="pt-6 border-t border-surface-variant flex justify-between items-center">
              <div>
                <div className="font-caption text-caption text-on-surface-variant mb-1">PRÓXIMA FACTURACIÓN</div>
                <div className="font-body-md text-body-md font-semibold text-primary">15 de Nov, 2024</div>
              </div>
              <button className="font-label-bold text-label-bold text-primary hover:text-secondary underline">Administrar</button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-base">
            <div className="bg-primary text-on-primary rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="font-headline-lg text-headline-lg text-secondary-fixed">24</div>
              <div className="font-caption text-caption text-primary-fixed-dim">Sesiones Asistidas</div>
            </div>
            <div className="bg-surface-container-high rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="font-headline-lg text-headline-lg text-primary">8</div>
              <div className="font-caption text-caption text-on-surface-variant">Partidos Ganados</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
