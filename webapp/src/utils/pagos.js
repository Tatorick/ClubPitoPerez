export const DEMO_HOY = { mes: 'MAY', anioMes: 4, anio: 2025 }; // mes 0-indexed

export const PENSION_ESTANDAR = 55.00;
export const MATRICULA_ESTANDAR = 50.00;

export const MESES_BASE = [
  { codigo: 'AGO', nombre: 'Agosto',      anio: 2024, mesIdx: 7,  tipo: 'matricula' },
  { codigo: 'SEP', nombre: 'Septiembre',  anio: 2024, mesIdx: 8,  tipo: 'pension'   },
  { codigo: 'OCT', nombre: 'Octubre',     anio: 2024, mesIdx: 9,  tipo: 'pension'   },
  { codigo: 'NOV', nombre: 'Noviembre',   anio: 2024, mesIdx: 10, tipo: 'pension'   },
  { codigo: 'DIC', nombre: 'Diciembre',   anio: 2024, mesIdx: 11, tipo: 'pension'   },
  { codigo: 'ENE', nombre: 'Enero',       anio: 2025, mesIdx: 0,  tipo: 'pension'   },
  { codigo: 'FEB', nombre: 'Febrero',     anio: 2025, mesIdx: 1,  tipo: 'pension'   },
  { codigo: 'MAR', nombre: 'Marzo',       anio: 2025, mesIdx: 2,  tipo: 'pension'   },
  { codigo: 'ABR', nombre: 'Abril',       anio: 2025, mesIdx: 3,  tipo: 'pension'   },
  { codigo: 'MAY', nombre: 'Mayo',        anio: 2025, mesIdx: 4,  tipo: 'pension'   },
  { codigo: 'JUN', nombre: 'Junio',       anio: 2025, mesIdx: 5,  tipo: 'pension'   },
  { codigo: 'JUL', nombre: 'Julio',       anio: 2025, mesIdx: 6,  tipo: 'pension'   },
];

/**
 * Deriva el estado de los meses (pagado, pendiente, vencido, futuro)
 * tomando en cuenta el monto de pensión configurado para el deportista (ej: $55 estándar, $25 con beca)
 */
export function derivarEstadoMeses(transacciones, montoPensionCustom, montoMatriculaCustom) {
  const { anioMes: mesActualIdx, anio: anioActual } = DEMO_HOY;

  const montoPension = montoPensionCustom !== undefined && montoPensionCustom !== null && !isNaN(Number(montoPensionCustom))
    ? Number(montoPensionCustom)
    : PENSION_ESTANDAR;

  const montoMatricula = montoMatriculaCustom !== undefined && montoMatriculaCustom !== null && !isNaN(Number(montoMatriculaCustom))
    ? Number(montoMatriculaCustom)
    : MATRICULA_ESTANDAR;

  const mesCubierto = {};
  (transacciones || []).forEach(txn => {
    (txn.meses_cubiertos || []).forEach(cod => {
      mesCubierto[cod] = txn;
    });
  });

  return MESES_BASE.map(mes => {
    const txn = mesCubierto[mes.codigo];
    const esPasado  = mes.anio < anioActual || (mes.anio === anioActual && mes.mesIdx < mesActualIdx);
    const esActual  = mes.anio === anioActual && mes.mesIdx === mesActualIdx;
    const esFuturo  = mes.anio > anioActual || (mes.anio === anioActual && mes.mesIdx > mesActualIdx);

    const valorCuota = mes.tipo === 'matricula' ? montoMatricula : montoPension;

    if (txn) {
      const estado = esFuturo ? 'adelanto' : 'pagado';
      return { ...mes, montoPension: valorCuota, estado, transaccion: txn };
    }
    if (esPasado)  return { ...mes, montoPension: valorCuota, estado: 'vencido',   transaccion: null };
    if (esActual)  return { ...mes, montoPension: valorCuota, estado: 'pendiente',  transaccion: null };
    return           { ...mes, montoPension: valorCuota, estado: 'futuro',    transaccion: null };
  });
}
