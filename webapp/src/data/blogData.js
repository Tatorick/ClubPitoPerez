// ─── Datos del Blog — Club Pito Pérez ─────────────────────────────────────────

export const CATEGORIAS = {
  torneos: { label: 'Torneos',    bg: 'bg-orange-100 text-orange-700 border-orange-200' },
  noticias: { label: 'Noticias',  bg: 'bg-blue-100  text-blue-700  border-blue-200'  },
  tecnica:  { label: 'Técnica',   bg: 'bg-green-100 text-green-700 border-green-200' },
  club:     { label: 'Club',      bg: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export const BLOG_POSTS = [
  {
    id: 'b1',
    titulo: '¡Orgullo Pito Pérez! Zoe Montoya a la Preselección Ecuatoriana U19',
    categoria: 'noticias',
    fecha: '15 de Agosto, 2025',
    autor: 'Club Pito Pérez',
    imagen: '/blog/zoe_montoya.png',
    extracto: 'Hoy celebramos con enorme alegría y orgullo a nuestra deportista Zoe Montoya, quien ha sido convocada a la preselección ecuatoriana U19.',
    contenido: [
      'Hoy celebramos con enorme alegría y orgullo a nuestra deportista Zoe Montoya, quien ha sido convocada a la preselección ecuatoriana U19 🇪🇨.',
      'Zoe, este reconocimiento es fruto de tu esfuerzo, disciplina, constancia y pasión por el vóleibol.',
      'Desde Club Pito Pérez queremos felicitarte y decirte que estamos muy orgullosos de ti. ¡Sigue soñando, trabajando y dejando en alto los colores de nuestro club!',
      'Nuestra deportista Zoe Montoya ha sido convocada por la Federación Ecuatoriana de Voleibol al concentrado de preparación, donde demostrará todo su talento junto a las mejores jugadoras del país. ¡El mayor de los éxitos en esta nueva etapa!'
    ],
    tiempoLectura: '2 min',
  },
  {
    id: 'b2',
    titulo: 'Ejercicios para Mejorar tu Ataque en el Voleibol',
    categoria: 'tecnica',
    fecha: '10 de Agosto, 2025',
    autor: 'Kevin Culcay',
    imagen: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80',
    extracto: 'Descubre los mejores ejercicios pliométricos y de técnica para incrementar tu salto vertical y la potencia de tus remates.',
    contenido: [
      'El ataque es una de las habilidades más espectaculares y decisivas en el voleibol. Para ser un buen atacante, no solo necesitas fuerza, sino también una técnica depurada y un salto explosivo.',
      '1. Saltos Pliométricos (Box Jumps): Utiliza un cajón o superficie elevada. Salta con ambos pies buscando la máxima altura y aterriza suavemente. Realiza 4 series de 10 repeticiones.',
      '2. Trabajo de batida sin balón: Practica la aproximación (los 3 o 4 pasos previos al salto) enfocándote en la velocidad de los dos últimos pasos y el uso de los brazos para impulsarte hacia arriba.',
      '3. Remate contra la pared: Concéntrate en el contacto del balón. El golpe debe ser en el punto más alto, envolviendo el balón con la mano abierta para darle rotación (topspin).',
      '4. Ejercicios de Core: Un abdomen fuerte te permite mantener la postura en el aire y transferir la fuerza de tu cuerpo al brazo. Planchas y giros rusos son excelentes opciones.',
      'Recuerda: la técnica siempre debe primar sobre la fuerza bruta. ¡A entrenar duro en la cancha!'
    ],
    tiempoLectura: '4 min',
  },
  {
    id: 'b3',
    titulo: 'Aprende las Rotaciones: Sistema 5-1 Explicado',
    categoria: 'tecnica',
    fecha: '5 de Agosto, 2025',
    autor: 'Marcos Pérez',
    imagen: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    extracto: 'El sistema 5-1 es el más utilizado en el voleibol competitivo. Aprende cómo funciona y cuáles son los roles de cada jugadora en la cancha.',
    contenido: [
      'Entender los sistemas de juego es fundamental cuando pasas del voleibol formativo al competitivo. Hoy hablaremos del sistema 5-1, el más popular a nivel mundial.',
      '¿Qué significa 5-1? Significa que en la cancha hay 5 posibles atacantes y 1 armador (colocador) único que levanta los balones en todas las rotaciones.',
      'El Armador: Es el cerebro del equipo. Cuando está en posiciones delanteras (2, 3 o 4), el equipo tiene 2 atacantes en red. Cuando pasa a las posiciones zagueras (1, 6 o 5), penetra hacia la red, lo que permite al equipo atacar con 3 jugadoras.',
      'El Opuesto: Juega en la posición contraria al armador. Su rol principal es el ataque desde la zona zaguera (posición 1) o desde zona 2 cuando el armador está atrás.',
      'Puntas (Receptores): Son las jugadoras principales para recibir el saque y atacar por posición 4. Deben ser jugadoras muy completas.',
      'Centrales y Líbero: Los centrales atacan balones rápidos por el medio (posición 3) y son la primera línea de bloqueo. El líbero entra a reemplazar a los centrales en la zona zaguera para liderar la defensa y recepción.',
      'Dominar estas posiciones toma tiempo y práctica táctica. En nuestros entrenamientos le damos mucha importancia a la lectura de juego.'
    ],
    tiempoLectura: '5 min',
  },
  {
    id: 'b4',
    titulo: 'Temporada 2025-2026: Objetivos y Torneos Confirmados',
    categoria: 'club',
    fecha: '15 de Julio, 2025',
    autor: 'Kevin Culcay',
    imagen: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d254?w=800&q=80',
    extracto: 'Con la temporada 2025-2026 a la vuelta de la esquina, el cuerpo técnico comparte los objetivos y los torneos en los que participaremos.',
    contenido: [
      'La nueva temporada lectiva trae consigo grandes retos y oportunidades para el Club Pito Pérez. El cuerpo técnico ha trazado objetivos claros para continuar creciendo.',
      'Objetivos principales: Clasificar al campeonato nacional en categorías U14 y U16, incrementar el número de jugadoras, y certificar atletas para selecciones provinciales.',
      'Torneos programados: Torneo Apertura Intercolegial (Septiembre), Campeonato Provincial Sub-14 (Noviembre), Copa Pito Pérez (Diciembre), y Torneo Nacional de Clubes (Febrero 2026).',
      '¡Vamos con todo! 💪🏐',
    ],
    tiempoLectura: '5 min',
  },
  {
    id: 'b5',
    titulo: 'Cómo Elegir el Calzado Correcto para Voleibol',
    categoria: 'tecnica',
    fecha: '5 de Julio, 2025',
    autor: 'Marcos Pérez',
    imagen: 'https://images.unsplash.com/photo-1566826435297-2a8d0fb1e1c5?w=800&q=80',
    extracto: 'El calzado correcto puede marcar la diferencia en tu rendimiento y prevenir lesiones. Te explicamos qué características buscar.',
    contenido: [
      'El calzado es uno de los elementos más importantes para cualquier jugadora de voleibol. Un buen par de zapatillas puede mejorar el rendimiento y protegerte de lesiones graves.',
      'Amortiguación: Busca zapatillas con buena amortiguación en el talón y el antepié, especialmente si juegas de atacante donde los saltos son frecuentes.',
      'Agarre: La suela debe ofrecer buen grip en superficies de parquet o goma. Soporte lateral: El voleibol requiere movimientos explosivos, un buen soporte en el tobillo es esencial.',
      'Marcas recomendadas: Asics Gel-Rocket, Mizuno Wave Lightning, Nike Air Zoom son opciones probadas en competencia. Siempre prueba el calzado antes de comprarlo.',
    ],
    tiempoLectura: '4 min',
  },
];
