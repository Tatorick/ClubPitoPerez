import { useState } from 'react';

export default function Horarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const openModal = (planName) => {
    setSelectedPlan(planName);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="bg-background text-on-background font-body-md w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col gap-section-gap">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-gutter">
        <h1 className="font-display-lg text-display-lg text-primary">Entrena como un Profesional.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Explora nuestros horarios de entrenamiento de élite y niveles de membresía diseñados para elevar tu juego al siguiente nivel.
        </p>
      </section>

      {/* Schedule Section */}
      <section className="flex flex-col gap-gutter">
        <h2 className="font-headline-lg text-headline-lg text-primary border-b border-outline-variant pb-2">Horario Semanal de Entrenamiento</h2>
        <div className="overflow-x-auto bg-surface border border-outline-variant rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-variant text-on-surface font-label-bold text-label-bold">
                <th className="p-4 border-b border-outline-variant">Hora</th>
                <th className="p-4 border-b border-outline-variant">Lunes</th>
                <th className="p-4 border-b border-outline-variant">Miércoles</th>
                <th className="p-4 border-b border-outline-variant">Viernes</th>
                <th className="p-4 border-b border-outline-variant">Sábado</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface-variant">
              <tr className="hover:bg-surface-bright transition-colors border-b border-outline-variant">
                <td className="p-4 font-label-bold text-primary">06:00 AM - 08:00 AM</td>
                <td className="p-4">Acondicionamiento</td>
                <td className="p-4">-</td>
                <td className="p-4">Acondicionamiento</td>
                <td className="p-4 text-secondary font-label-bold">Cancha Abierta</td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors border-b border-outline-variant">
                <td className="p-4 font-label-bold text-primary">04:00 PM - 06:00 PM</td>
                <td className="p-4 text-primary-container font-label-bold">Junior Varsity</td>
                <td className="p-4 text-primary-container font-label-bold">Junior Varsity</td>
                <td className="p-4">-</td>
                <td className="p-4">-</td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="p-4 font-label-bold text-primary">06:30 PM - 08:30 PM</td>
                <td className="p-4 text-tertiary-container font-label-bold">Varsity y Élite</td>
                <td className="p-4 text-tertiary-container font-label-bold">Varsity y Élite</td>
                <td className="p-4 text-tertiary-container font-label-bold">Varsity y Élite</td>
                <td className="p-4">Día de Partido</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="flex flex-col gap-gutter" id="precios">
        <h2 className="font-headline-lg text-headline-lg text-primary border-b border-outline-variant pb-2 text-center md:text-left">Inversión en tu Futuro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Annual Registration */}
          <div className="bg-surface border border-outline-variant rounded-lg p-10 flex flex-col items-center text-center gap-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
            <span className="material-symbols-outlined text-secondary text-display-lg" style={{fontSize: '48px'}}>assignment_turned_in</span>
            <h3 className="font-headline-md text-headline-md text-primary">Matrícula Anual</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Asegura tu lugar en el club y accede a todos nuestros beneficios exclusivos durante todo el año.</p>
            <div className="mt-auto">
              <button className="font-label-bold text-label-bold bg-primary text-on-primary px-8 py-3 rounded hover:bg-primary-container transition-colors shadow-sm">Consultar Detalles</button>
            </div>
          </div>
          {/* Monthly Fee */}
          <div className="bg-surface border-2 border-tertiary-container rounded-lg p-10 flex flex-col items-center text-center gap-4 shadow-[0_4px_4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-transform duration-300 relative">
            <div className="absolute top-0 right-0 bg-tertiary-container text-on-tertiary-container font-label-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Más Popular</div>
            <span className="material-symbols-outlined text-secondary text-display-lg" style={{fontSize: '48px'}}>calendar_month</span>
            <h3 className="font-headline-md text-headline-md text-primary">Mensualidad</h3>
            <div className="font-headline-lg text-headline-lg text-primary">$55<span className="font-body-md text-body-md text-on-surface-variant">/mes</span></div>
            <p className="font-body-md text-body-md text-on-surface-variant">Entrenamiento continuo de alto rendimiento con nuestros entrenadores certificados.</p>
            <div className="mt-auto w-full">
              <button className="w-full font-label-bold text-label-bold bg-secondary-container text-on-secondary-container px-8 py-3 rounded hover:bg-secondary transition-colors shadow-sm" onClick={() => openModal('Mensualidad')}>Inscribirse Ahora</button>
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
          </div>
        </div>
      )}
    </div>
  );
}
