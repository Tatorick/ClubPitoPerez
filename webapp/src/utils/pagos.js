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

export function derivarEstadoMeses(transacciones) {
  const { anioMes: mesActualIdx, anio: anioActual } = DEMO_HOY;

  const mesCubierto = {};
  (transacciones || []).forEach(txn => {
    (txn.meses_cubiertos || []).forEach(cod => {
      mesCubierto[cod] = txn;
    });
  });

  return MESES_LECTIVOS.map(mes => {
    const txn = mesCubierto[mes.codigo];
    const esPasado  = mes.anio < anioActual || (mes.anio === anioActual && mes.mesIdx < mesActualIdx);
    const esActual  = mes.anio === anioActual && mes.mesIdx === mesActualIdx;
    const esFuturo  = mes.anio > anioActual || (mes.anio === anioActual && mes.mesIdx > mesActualIdx);

    if (txn) {
      const estado = esFuturo ? 'adelanto' : 'pagado';
      return { ...mes, estado, transaccion: txn };
    }
    if (esPasado)  return { ...mes, estado: 'vencido',   transaccion: null };
    if (esActual)  return { ...mes, estado: 'pendiente',  transaccion: null };
    return           { ...mes, estado: 'futuro',    transaccion: null };
  });
}
