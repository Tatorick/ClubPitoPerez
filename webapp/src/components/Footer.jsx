import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-section-gap px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter bg-primary text-on-primary mt-auto">
      <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-4">
          <img alt="Pito Pérez Voleibol Club Logo" className="h-12 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApLdsZ4Z6PoN1TdAbSh3dItn0eeldsFlshe2IM7HaRLBAqbnf_4YPcb6yf8c7Z6_8ou03RWuOLL04z4_Fev2hXzsVqeXl8SacE9XTu4Iq1iJY5tA_RPLII-YRNBqaaSDpQkRJr0jND9qz8qjBA6OUogBMvdrdBV9k9QgvzZtkaV8yDsL6yP1NfSP1YbZxWk38kY0UfoWstKXgq23AKlhk3gvqdhwKzvpifVqalm-UaZOs5dRnGtjc8i4sPVlL7MhCTnA" />
          <div className="font-headline-md text-on-primary hidden sm:block">PITO PÉREZ VOLEIBOL CLUB</div>
        </div>
        <p className="font-body-md text-body-md text-on-primary-fixed-variant max-w-sm">
          Elevando a los atletas a través de un entrenamiento de precisión y un compromiso con la excelencia competitiva.
        </p>
        <p className="font-caption text-caption text-on-primary-fixed-variant mt-4">
          © 2024 Pito Pérez Voleibol Club. Precisión en el Rendimiento.
        </p>
      </div>
      
      <div>
        <h5 className="font-label-bold text-label-bold mb-4">Explorar</h5>
        <ul className="space-y-2 flex flex-col">
          <Link to="#" className="font-body-md text-body-md text-on-primary-fixed-variant hover:text-secondary-fixed-dim transition-colors">Política de Privacidad</Link>
          <Link to="#" className="font-body-md text-body-md text-on-primary-fixed-variant hover:text-secondary-fixed-dim transition-colors">Términos de Servicio</Link>
        </ul>
      </div>
      
      <div>
        <h5 className="font-label-bold text-label-bold mb-4">Conectar</h5>
        <ul className="space-y-2 flex flex-col">
          <Link to="#" className="font-body-md text-body-md text-on-primary-fixed-variant hover:text-secondary-fixed-dim transition-colors">Contáctanos</Link>
          <Link to="#" className="font-body-md text-body-md text-on-primary-fixed-variant hover:text-secondary-fixed-dim transition-colors">Carreras</Link>
        </ul>
      </div>
    </footer>
  );
}
