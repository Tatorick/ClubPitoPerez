// src/data/horariosData.js

// Definición de los grupos con sus respectivos profesores y colores elegantes (Tailwind classes)
export const GRUPOS = {
  'U15 DAMAS': {
    nombre: 'U15 Damas',
    profesor: 'Prof. Pito Perez',
    anios: '2010 2011 2012 2013',
    estilo: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  'MINI DAMAS': {
    nombre: 'Mini Damas',
    profesor: 'Prof. Pito Perez',
    anios: '2015 2016 2017 2018',
    estilo: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  'SUB 14 DAMAS': {
    nombre: 'Sub 14 Damas',
    profesor: 'Prof. Collen Cuninhan',
    anios: '2012 2011 2013',
    estilo: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  'SUB 16 DAMAS': {
    nombre: 'Sub 16 Damas',
    profesor: 'Prof. Kevin Culcay',
    anios: '2010 2011 2012',
    estilo: 'bg-gray-50 text-gray-700 border-gray-200'
  },
  'LIBRE DAMAS': {
    nombre: 'Libre Damas',
    profesor: 'Prof. Kevin Culcay',
    anios: '',
    estilo: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  },
  'LIBRE VARONES': {
    nombre: 'Libre Varones',
    profesor: 'Prof. Kevin Culcay',
    anios: '',
    estilo: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  'SUB 14 VARONES': {
    nombre: 'Sub 14 Varones',
    profesor: 'Prof. Pito Perez',
    anios: '',
    estilo: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  'SUB 12 DAMAS': {
    nombre: 'Sub 12 Damas',
    profesor: 'Por confirmar',
    anios: '2014 2016',
    estilo: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  'EX ALUMNOS': {
    nombre: 'Ex Alumnos',
    profesor: '',
    anios: '',
    estilo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
};

// Horarios de Lunes a Viernes
export const HORARIOS_SEMANA = [
  {
    hora: '14:00 A 15:30',
    Lunes: 'U15 DAMAS',
    Martes: null,
    Miércoles: 'U15 DAMAS',
    Jueves: null,
    Viernes: 'U15 DAMAS'
  },
  {
    hora: '15:30 A 16:30',
    Lunes: 'MINI DAMAS',
    Martes: 'MINI DAMAS',
    Miércoles: 'MINI DAMAS',
    Jueves: 'MINI DAMAS',
    Viernes: 'MINI DAMAS'
  },
  {
    hora: '16:30 A 18:00',
    Lunes: 'SUB 14 DAMAS',
    Martes: 'SUB 14 VARONES',
    Miércoles: 'SUB 14 DAMAS',
    Jueves: 'SUB 14 VARONES',
    Viernes: 'SUB 14 DAMAS'
  },
  {
    hora: '18:00 A 19:30',
    Lunes: 'SUB 16 DAMAS',
    Martes: 'SUB 12 DAMAS',
    Miércoles: 'SUB 16 DAMAS',
    Jueves: 'SUB 16 DAMAS',
    Viernes: 'SUB 12 DAMAS'
  },
  {
    hora: '19:00 A 20:30',
    Lunes: 'LIBRE DAMAS',
    Martes: 'LIBRE DAMAS',
    Miércoles: 'LIBRE DAMAS',
    Jueves: 'LIBRE DAMAS',
    Viernes: 'LIBRE DAMAS'
  },
  {
    hora: '20:30 A 22:00',
    Lunes: 'LIBRE VARONES',
    Martes: 'EX ALUMNOS',
    Miércoles: 'LIBRE VARONES',
    Jueves: 'LIBRE VARONES',
    Viernes: 'LIBRE VARONES'
  }
];

// Horarios de Sábado
export const HORARIOS_SABADO = [
  { hora: '08:00 A 09:30', grupo: 'SUB 14 DAMAS' },
  { hora: '09:30 A 11:00', grupo: 'SUB 14 VARONES' },
  { hora: '11:00 A 12:30', grupo: 'SUB 12 DAMAS' },
  { hora: '12:30 A 14:00', grupo: 'SUB 16 DAMAS' }
];

// Array plano de todos los grupos para los selects
export const LISTA_GRUPOS = Object.keys(GRUPOS);

/**
 * Función auxiliar para obtener el horario de un deportista según su grupo
 * @param {string} grupo 
 * @returns {Array} Array de objetos { dia, hora }
 */
export function obtenerHorarioPorGrupo(grupo) {
  if (!grupo || !GRUPOS[grupo]) return [];

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const horario = [];

  // Buscar en semana
  HORARIOS_SEMANA.forEach(slot => {
    dias.forEach(dia => {
      if (slot[dia] === grupo) {
        horario.push({ dia, hora: slot.hora });
      }
    });
  });

  // Buscar en sábado
  HORARIOS_SABADO.forEach(slot => {
    if (slot.grupo === grupo) {
      horario.push({ dia: 'Sábado', hora: slot.hora });
    }
  });

  // Ordenar días
  const ordenDias = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };
  horario.sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

  return horario;
}
