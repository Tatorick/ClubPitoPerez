import { useState } from 'react';
import { GRUPOS, HORARIOS_SEMANA, HORARIOS_SABADO } from '../data/horariosData';
import { useClubConfig } from '../hooks/useClubConfig';

export default function Horarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const { precioPension } = useClubConfig();

  const openModal = (planName) => {
    setSelectedPlan(planName);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Función para renderizar la celda de un grupo de forma elegante
  const renderCell = (grupoId) => {
    if (!grupoId) return <td className="p-4 bg-surface/30"></td>;
    const grupo = GRUPOS[grupoId];
    if (!grupo) return <td className="p-4">{grupoId}</td>;
    
    return (
      <td className={`p-4 border-l-4 ${grupo.estilo.replace('border-', 'border-l-')} bg-white/50 backdrop-blur-sm transition-all hover:shadow-md cursor-default group`}>
        <div className="flex flex-col h-full justify-center">
          <span className="font-bold text-sm leading-tight group-hover:scale-105 transition-transform origin-left">{grupo.nombre}</span>
          {grupo.profesor && <span className="text-[11px] opacity-80 mt-1">{grupo.profesor}</span>}
          {grupo.anios && <span className="text-[10px] font-semibold opacity-60 mt-0.5">{grupo.anios}</span>}
        </div>
      </td>
    );
  };

  return (
    <div className="bg-background text-on-background font-body-md w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col gap-section-gap">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-gutter relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-32 bg-primary/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>
        <h1 className="font-display-lg text-display-lg text-primary">Entrena como un Profesional.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Explora nuestros horarios de entrenamiento de élite y niveles de membresía diseñados para elevar tu juego al siguiente nivel.
        </p>
      </section>

      {/* Schedule Section */}
      <section className="flex flex-col gap-gutter">
        <h2 className="font-headline-lg text-headline-lg text-primary border-b border-outline-variant pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">calendar_month</span>
          Horario Semanal de Entrenamiento
        </h2>
        
        <div className="overflow-x-auto bg-surface/80 backdrop-blur-md border border-outline-variant rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-variant/50 text-on-surface font-label-bold text-label-bold uppercase tracking-wider text-xs">
                <th className="p-4 border-b border-outline-variant/50 rounded-tl-xl w-32">Hora</th>
                <th className="p-4 border-b border-outline-variant/50">Lunes</th>
                <th className="p-4 border-b border-outline-variant/50">Martes</th>
                <th className="p-4 border-b border-outline-variant/50">Miércoles</th>
                <th className="p-4 border-b border-outline-variant/50">Jueves</th>
                <th className="p-4 border-b border-outline-variant/50">Viernes</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface-variant divide-y divide-outline-variant/30">
              {HORARIOS_SEMANA.map((slot, i) => (
                <tr key={i} className="hover:bg-surface-bright/40 transition-colors">
                  <td className="p-4 font-label-bold text-primary whitespace-nowrap bg-surface-variant/10">{slot.hora}</td>
                  {renderCell(slot.Lunes)}
                  {renderCell(slot.Martes)}
                  {renderCell(slot.Miércoles)}
                  {renderCell(slot.Jueves)}
                  {renderCell(slot.Viernes)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Schedule Sábado */}
        <div className="mt-4">
          <h3 className="font-headline-md text-headline-md text-secondary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">weekend</span>
            Horarios de Sábado
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {HORARIOS_SABADO.map((slot, i) => {
              const grupo = GRUPOS[slot.grupo];
              return (
                <div key={i} className={`p-5 rounded-2xl border-l-4 ${grupo.estilo.replace('border-', 'border-l-')} flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow bg-white/50 backdrop-blur-sm`}>
                  <div className="font-bold text-lg">{slot.hora}</div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">{grupo.nombre}</div>
                    <div className="text-xs opacity-80">{grupo.profesor}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="flex flex-col gap-gutter" id="precios">
        <h2 className="font-headline-lg text-headline-lg text-primary border-b border-outline-variant pb-2 text-center md:text-left">Inversión en tu Futuro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Annual Registration */}
          <div className="bg-surface border border-outline-variant rounded-lg p-10 flex flex-col items-center text-center gap-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
            <span className="material-symbols-outlined text-secondary text-display-lg" style={{fontSize: '48px'}}>assignment_turned_in</span>
            <h3 className="font-headline-md text-headline-md text-primary">Matrícula Anual</h3>
            <div className="font-headline-lg text-headline-lg text-primary">$40<span className="font-body-md text-body-md text-on-surface-variant">/año</span></div>
            <p className="font-body-md text-body-md text-on-surface-variant">Asegura tu lugar en el club y accede a todos nuestros beneficios exclusivos durante todo el año.</p>
            <div className="mt-auto">
              <button className="font-label-bold text-label-bold bg-primary text-on-primary px-8 py-3 rounded hover:bg-primary-container transition-colors shadow-sm" onClick={() => openModal('Matrícula')}>Inscribirse Ahora</button>
            </div>
          </div>
          {/* Monthly Fee */}
          <div className="bg-surface border-2 border-tertiary-container rounded-lg p-10 flex flex-col items-center text-center gap-4 shadow-[0_4px_4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-transform duration-300 relative">
            <div className="absolute top-0 right-0 bg-tertiary-container text-on-tertiary-container font-label-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Más Popular</div>
            <span className="material-symbols-outlined text-secondary text-display-lg" style={{fontSize: '48px'}}>calendar_month</span>
            <h3 className="font-headline-md text-headline-md text-primary">Mensualidad</h3>
            <div className="font-headline-lg text-headline-lg text-primary">${precioPension}<span className="font-body-md text-body-md text-on-surface-variant">/mes</span></div>
            <p className="font-body-md text-body-md text-on-surface-variant">Entrenamiento continuo de alto rendimiento con nuestros entrenadores certificados.</p>
            <div className="mt-auto w-full">
              <button className="w-full font-label-bold text-label-bold bg-secondary-container text-on-secondary-container px-8 py-3 rounded hover:bg-secondary transition-colors shadow-sm" onClick={() => openModal('Mensualidad')}>Inscribirse Ahora</button>
            </div>
          </div>
          {/* Seguro Médico */}
          <div className="bg-surface border border-outline-variant rounded-lg p-10 flex flex-col items-center text-center gap-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
            <span className="material-symbols-outlined text-secondary text-display-lg" style={{fontSize: '48px'}}>health_and_safety</span>
            <h3 className="font-headline-md text-headline-md text-primary">Seguro Médico</h3>
            <div className="font-headline-lg text-headline-lg text-primary">$15<span className="font-body-md text-body-md text-on-surface-variant">/año</span></div>
            <p className="font-body-md text-body-md text-on-surface-variant">Cobertura médica anual opcional, protegiendo al deportista en todo momento.</p>
            <div className="mt-auto">
              <button className="font-label-bold text-label-bold bg-primary text-on-primary px-8 py-3 rounded hover:bg-primary-container transition-colors shadow-sm" onClick={() => openModal('Seguro Médico')}>Ver más</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sign-up Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center glass-modal p-margin-mobile">
          <div className="bg-surface rounded-xl p-10 max-w-md w-full relative shadow-[0_24px_24px_rgba(0,0,0,0.1)]">
            <button className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors" onClick={closeModal}>
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>close</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Únete a Pito Pérez Voleibol Club</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Estás seleccionando el plan <span className="font-label-bold text-secondary">{selectedPlan}</span>.
            </p>
            {selectedPlan === 'Seguro Médico' ? (
              <div className="flex flex-col gap-4">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  El <strong>Seguro Médico</strong> es un beneficio opcional que tiene un costo de <strong>$15 anuales</strong>.
                </p>
                <ul className="list-disc pl-5 font-body-md text-body-md text-on-surface-variant space-y-2">
                  <li>Cubre hasta <strong>$1500 USD</strong> en gastos médicos por accidentes durante los entrenamientos o competiciones oficiales.</li>
                  <li>Atención en red de clínicas afiliadas de primer nivel.</li>
                  <li>Asistencia médica inmediata.</li>
                </ul>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 text-sm">
                  Acércate a la oficina principal del club para firmar la solicitud de afiliación.
                </p>
                <button className="w-full font-label-bold text-label-bold bg-secondary-container text-on-secondary-container px-4 py-3 rounded hover:bg-secondary transition-colors shadow-sm mt-4" type="button" onClick={closeModal}>Entendido</button>
              </div>
            ) : (
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface mb-1">Nombre Completo</label>
                  <input className="w-full border border-outline-variant rounded p-2 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-bright text-on-surface" type="text" />
                </div>
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface mb-1">Correo Electrónico</label>
                  <input className="w-full border border-outline-variant rounded p-2 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-bright text-on-surface" type="email" />
                </div>
                <button className="w-full font-label-bold text-label-bold bg-secondary-container text-on-secondary-container px-4 py-3 rounded hover:bg-secondary transition-colors shadow-sm mt-4" type="button">Proceder al Pago</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
