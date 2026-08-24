// Datos de ejemplo — Año Lectivo 2024-2025
// Los estados se DERIVAN de las transacciones, no se almacenan directamente.

// Mes de referencia para la demo (simula que hoy es Mayo 2025)
export const DEMO_HOY = { mes: 'MAY', anioMes: 4, anio: 2025 }; // mes 0-indexed

export const MESES_LECTIVOS = [
  { codigo: 'AGO', nombre: 'Agosto',      anio: 2024, mesIdx: 7,  tipo: 'matricula', montoPension: 50.00 },
  { codigo: 'SEP', nombre: 'Septiembre',  anio: 2024, mesIdx: 8,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'OCT', nombre: 'Octubre',     anio: 2024, mesIdx: 9,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'NOV', nombre: 'Noviembre',   anio: 2024, mesIdx: 10, tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'DIC', nombre: 'Diciembre',   anio: 2024, mesIdx: 11, tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'ENE', nombre: 'Enero',       anio: 2025, mesIdx: 0,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'FEB', nombre: 'Febrero',     anio: 2025, mesIdx: 1,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'MAR', nombre: 'Marzo',       anio: 2025, mesIdx: 2,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'ABR', nombre: 'Abril',       anio: 2025, mesIdx: 3,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'MAY', nombre: 'Mayo',        anio: 2025, mesIdx: 4,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'JUN', nombre: 'Junio',       anio: 2025, mesIdx: 5,  tipo: 'pension',   montoPension: 35.00 },
  { codigo: 'JUL', nombre: 'Julio',       anio: 2025, mesIdx: 6,  tipo: 'pension',   montoPension: 35.00 },
];

/**
 * Deriva el estado de cada mes basándose en las transacciones registradas.
 * Estados: 'pagado' | 'adelanto' | 'pendiente' | 'vencido' | 'futuro'
 */
export function derivarEstadoMeses(transacciones) {
  const { anioMes: mesActualIdx, anio: anioActual } = DEMO_HOY;

  // Mapa: codigo_mes -> transaccion que lo cubre
  const mesCubierto = {};
  (transacciones || []).forEach(txn => {
    (txn.mesesCubiertos || []).forEach(cod => {
      mesCubierto[cod] = txn;
    });
  });

  return MESES_LECTIVOS.map(mes => {
    const txn = mesCubierto[mes.codigo];
    const esPasado  = mes.anio < anioActual || (mes.anio === anioActual && mes.mesIdx < mesActualIdx);
    const esActual  = mes.anio === anioActual && mes.mesIdx === mesActualIdx;
    const esFuturo  = mes.anio > anioActual || (mes.anio === anioActual && mes.mesIdx > mesActualIdx);

    if (txn) {
      // Si el mes es futuro y está pagado → es un adelanto
      const estado = esFuturo ? 'adelanto' : 'pagado';
      return { ...mes, estado, transaccion: txn };
    }
    if (esPasado)  return { ...mes, estado: 'vencido',   transaccion: null };
    if (esActual)  return { ...mes, estado: 'pendiente',  transaccion: null };
    return           { ...mes, estado: 'futuro',    transaccion: null };
  });
}

export const MOCK_MEMBERS = [
  // ─── Miembro 1: Juliana Pérez — casi al día, un mes vencido ───────────────
  {
    id: 1,
    foto: null,
    nombres: 'PÉREZ BARROS JULIANA RAFAELA',
    cedula: '0150911071',
    fechaNacimiento: '17/01/2014',
    genero: 'FEMENINO',
    nacionalidad: 'ECUATORIANA',
    direccion: 'Ciudadela Las Palmas, Calle 5ta y 8va, Guayaquil',
    categoria: 'U12',
    discapacidad: 'NO', tipoDiscapacidad: '', porcentajeDiscapacidad: '',
    nee: 'NO', usaLentes: 'SÍ',
    padre: { nombres: 'PÉREZ VÁSQUEZ CARLOS ANDRÉS',   cedula: '0912345678', telefono: '0991234567', ocupacion: 'Ingeniero Civil' },
    madre: { nombres: 'BARROS GÓMEZ GINA JACQUELINE',  cedula: '0987654321', telefono: '0992756714', ocupacion: 'Profesora' },
    representante: 'Madre',
    facturacion: { ruc: '0987654321001', nombre: 'BARROS GÓMEZ GINA JACQUELINE', direccion: 'Ciudadela Las Palmas, Guayaquil', telefono: '0992756714', correo: 'gina.barros@gmail.com' },
    transacciones: [
      { id: 'j1', fecha: '12/08/2024', montoReal: 50.00, notas: 'Matrícula año lectivo 2024-2025',
        comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        mesesCubiertos: ['AGO'] },
      { id: 'j2', fecha: '03/09/2024', montoReal: 35.00, notas: '',
        comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        mesesCubiertos: ['SEP'] },
      { id: 'j3', fecha: '07/10/2024', montoReal: 35.00, notas: '',
        comprobante: null,
        mesesCubiertos: ['OCT'] },
      // Pago de dos meses juntos (NOV+DIC) con un solo comprobante
      { id: 'j4', fecha: '10/12/2024', montoReal: 70.00, notas: 'Abono noviembre y diciembre juntos',
        comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        mesesCubiertos: ['NOV', 'DIC'] },
      { id: 'j5', fecha: '06/01/2025', montoReal: 35.00, notas: '',
        comprobante: null,
        mesesCubiertos: ['ENE'] },
      { id: 'j6', fecha: '03/02/2025', montoReal: 35.00, notas: '',
        comprobante: null,
        mesesCubiertos: ['FEB'] },
      // MAR está vencido (sin transacción)
      // Pago adelantado de ABR y MAY
      { id: 'j7', fecha: '01/04/2025', montoReal: 70.00, notas: 'Pago adelantado de abril y mayo',
        comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        mesesCubiertos: ['ABR', 'MAY'] },
      // JUN y JUL sin pagar (futuros)
    ]
  },

  // ─── Miembro 2: Jessica Smith — 3 meses vencidos, luego ponerse al día ────
  {
    id: 2,
    foto: null,
    nombres: 'SMITH JESSICA CAROLINA',
    cedula: '0102938475',
    fechaNacimiento: '05/03/2010',
    genero: 'FEMENINO',
    nacionalidad: 'ECUATORIANA',
    direccion: 'Urb. Villa Club, Mz. 7 Villa 3, Samborondón',
    categoria: 'U16',
    discapacidad: 'NO', tipoDiscapacidad: '', porcentajeDiscapacidad: '',
    nee: 'NO', usaLentes: 'NO',
    padre: { nombres: 'SMITH JOHN ROBERT',             cedula: '0998765432', telefono: '0991122334', ocupacion: 'Administrador de Empresas' },
    madre: { nombres: 'CAROLINA JIMÉNEZ DE SMITH',     cedula: '0911223344', telefono: '0999887766', ocupacion: 'Médico' },
    representante: 'Padre',
    facturacion: { ruc: '0998765432001', nombre: 'SMITH JOHN ROBERT', direccion: 'Urb. Villa Club, Samborondón', telefono: '0991122334', correo: 'jsmith@empresa.com' },
    transacciones: [
      { id: 's1', fecha: '20/08/2024', montoReal: 50.00, notas: 'Matrícula',
        comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        mesesCubiertos: ['AGO'] },
      { id: 's2', fecha: '01/09/2024', montoReal: 40.00, notas: '',
        comprobante: null,
        mesesCubiertos: ['SEP'] },
      { id: 's3', fecha: '05/10/2024', montoReal: 40.00, notas: '',
        comprobante: null,
        mesesCubiertos: ['OCT'] },
      // NOV, DIC, ENE sin pagar → vencidos
      // Luego en febrero pagan los 3 meses vencidos de golpe + el actual
      { id: 's4', fecha: '15/02/2025', montoReal: 160.00, notas: 'Pago de meses NOV, DIC, ENE y FEB pendientes',
        comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        mesesCubiertos: ['NOV', 'DIC', 'ENE', 'FEB'] },
      // MAR vencido (sin pagar)
      // ABR, MAY, JUN, JUL futuros
    ]
  },

  // ─── Miembro 3: Ana Torres — completamente al día ─────────────────────────
  {
    id: 3,
    foto: null,
    nombres: 'TORRES MENDOZA ANA LUCÍA',
    cedula: '0923456789',
    fechaNacimiento: '22/07/2012',
    genero: 'FEMENINO',
    nacionalidad: 'ECUATORIANA',
    direccion: 'Av. Francisco de Orellana, Edificio World Trade Center, Guayaquil',
    categoria: 'U14',
    discapacidad: 'NO', tipoDiscapacidad: '', porcentajeDiscapacidad: '',
    nee: 'NO', usaLentes: 'NO',
    padre: { nombres: 'TORRES ARIAS MARIO ALEJANDRO', cedula: '0934567890', telefono: '0987654321', ocupacion: 'Contador' },
    madre: { nombres: 'MENDOZA SILVA PATRICIA ELENA', cedula: '0945678901', telefono: '0976543210', ocupacion: 'Arquitecta' },
    representante: 'Madre',
    facturacion: { ruc: '0945678901001', nombre: 'MENDOZA SILVA PATRICIA ELENA', direccion: 'Av. Francisco de Orellana, Guayaquil', telefono: '0976543210', correo: 'p.mendoza@correo.ec' },
    transacciones: [
      { id: 'a1', fecha: '15/08/2024', montoReal: 50.00,  notas: 'Matrícula',    comprobante: null, mesesCubiertos: ['AGO'] },
      { id: 'a2', fecha: '02/09/2024', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['SEP'] },
      { id: 'a3', fecha: '01/10/2024', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['OCT'] },
      { id: 'a4', fecha: '04/11/2024', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['NOV'] },
      { id: 'a5', fecha: '03/12/2024', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['DIC'] },
      { id: 'a6', fecha: '07/01/2025', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['ENE'] },
      { id: 'a7', fecha: '05/02/2025', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['FEB'] },
      { id: 'a8', fecha: '04/03/2025', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['MAR'] },
      { id: 'a9', fecha: '03/04/2025', montoReal: 35.00,  notas: '',             comprobante: null, mesesCubiertos: ['ABR'] },
      // Pago adelantado de mayo y junio en la misma transacción
      { id: 'a10', fecha: '03/04/2025', montoReal: 70.00, notas: 'Adelanto de mayo y junio', comprobante: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', mesesCubiertos: ['MAY', 'JUN'] },
      // JUL sin pagar (futuro)
    ]
  }
];
