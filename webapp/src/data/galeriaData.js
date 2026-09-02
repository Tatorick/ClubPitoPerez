// ─── Datos de Galería — Club Pito Pérez ───────────────────────────────────────
// Las fotos reales del club están en /public/galeria/
// Se referencian con rutas absolutas desde la raíz del servidor.

// ── Álbum 1: Fotos del club (primeras 10) ─────────────────────────────────────
const FOTOS_CLUB = [
  { id: 'f01', url: '/galeria/IMG_2586.JPG', thumb: '/galeria/IMG_2586.JPG' },
  { id: 'f02', url: '/galeria/IMG_2598.JPG', thumb: '/galeria/IMG_2598.JPG' },
  { id: 'f03', url: '/galeria/IMG_2652.JPG', thumb: '/galeria/IMG_2652.JPG' },
  { id: 'f04', url: '/galeria/IMG_2667.JPG', thumb: '/galeria/IMG_2667.JPG' },
  { id: 'f05', url: '/galeria/IMG_2670.JPG', thumb: '/galeria/IMG_2670.JPG' },
  { id: 'f06', url: '/galeria/IMG_2691.JPG', thumb: '/galeria/IMG_2691.JPG' },
  { id: 'f07', url: '/galeria/IMG_2693.JPG', thumb: '/galeria/IMG_2693.JPG' },
  { id: 'f08', url: '/galeria/IMG_2714.JPG', thumb: '/galeria/IMG_2714.JPG' },
  { id: 'f09', url: '/galeria/IMG_2731.JPG', thumb: '/galeria/IMG_2731.JPG' },
  { id: 'f10', url: '/galeria/IMG_2952.JPG', thumb: '/galeria/IMG_2952.JPG' },
];

// ── Álbum 2: Más fotos del club (siguientes 10) ────────────────────────────────
const FOTOS_TEMPORADA = [
  { id: 't01', url: '/galeria/IMG_2962.JPG', thumb: '/galeria/IMG_2962.JPG' },
  { id: 't02', url: '/galeria/IMG_2974.JPG', thumb: '/galeria/IMG_2974.JPG' },
  { id: 't03', url: '/galeria/IMG_3000.JPG', thumb: '/galeria/IMG_3000.JPG' },
  { id: 't04', url: '/galeria/IMG_3004.JPG', thumb: '/galeria/IMG_3004.JPG' },
  { id: 't05', url: '/galeria/IMG_3017.JPG', thumb: '/galeria/IMG_3017.JPG' },
  { id: 't06', url: '/galeria/IMG_3026.JPG', thumb: '/galeria/IMG_3026.JPG' },
  { id: 't07', url: '/galeria/IMG_3043.JPG', thumb: '/galeria/IMG_3043.JPG' },
  { id: 't08', url: '/galeria/IMG_3131.JPG', thumb: '/galeria/IMG_3131.JPG' },
  { id: 't09', url: '/galeria/IMG_3135.JPG', thumb: '/galeria/IMG_3135.JPG' },
  { id: 't10', url: '/galeria/IMG_3178.JPG', thumb: '/galeria/IMG_3178.JPG' },
];

export const ALBUMES = [
  {
    id: 'alb1',
    titulo: 'Club Pito Pérez — Galería',
    fecha: '2025',
    lugar: 'Instalaciones del Club',
    descripcion: 'Momentos especiales del Club Pito Pérez: entrenamientos, torneos y la pasión por el voleibol que nos une.',
    portada: FOTOS_CLUB[0].url,
    portadaThumb: FOTOS_CLUB[0].thumb,
    categoria: 'Club',
    resultado: null,
    fotos: FOTOS_CLUB.map((p, i) => ({
      ...p,
      titulo: `Club Pito Pérez — Foto ${i + 1}`,
      descripcion: [
        'Un momento especial del club.',
        'El equipo en acción.',
        'Concentración y trabajo en equipo.',
        'La pasión por el voleibol.',
        'Entrenamiento de alto nivel.',
        'Las jugadoras dando lo mejor de sí.',
        'Técnica y dedicación en cada sesión.',
        'El espíritu del Club Pito Pérez.',
        'Preparación para la competencia.',
        'Unidos por el voleibol.',
      ][i] ?? `Foto ${i + 1} del Club Pito Pérez`,
    })),
  },
  {
    id: 'alb2',
    titulo: 'Temporada 2024-2025',
    fecha: 'Temporada 2024–2025',
    lugar: 'Cancha Principal, Pito Pérez V.C.',
    descripcion: 'El trabajo detrás de los resultados. Nuestra temporada en imágenes: esfuerzo, superación y compañerismo.',
    portada: FOTOS_TEMPORADA[0].url,
    portadaThumb: FOTOS_TEMPORADA[0].thumb,
    categoria: 'Entrenamiento',
    resultado: null,
    fotos: FOTOS_TEMPORADA.map((p, i) => ({
      ...p,
      titulo: `Temporada 2024-2025 — Foto ${i + 1}`,
      descripcion: [
        'El inicio de una gran temporada.',
        'Trabajo técnico con el cuerpo técnico.',
        'Practicando los fundamentos.',
        'El esfuerzo diario da sus frutos.',
        'Coordinación y velocidad de reacción.',
        'Entrenamiento de saque y recepción.',
        'La red, nuestro campo de batalla.',
        'Sparring entre compañeras.',
        'Momentos que forjan campeonas.',
        'El equipo listo para competir.',
      ][i] ?? `Foto ${i + 1} de la temporada`,
    })),
  },
];
