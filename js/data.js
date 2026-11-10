/* Serie — biblioteca de ejercicios, plantillas, calentamiento y estiramientos */
(function (G) {
  'use strict';

  G.MUSCLES = {
    pecho: 'Pecho', dorsales: 'Dorsales', trapecio: 'Trapecio', lumbar: 'Zona lumbar', hombros: 'Hombros',
    biceps: 'Bíceps', triceps: 'Tríceps', antebrazos: 'Antebrazos', abdomen: 'Abdomen', gluteos: 'Glúteos',
    cuadriceps: 'Cuádriceps', isquios: 'Isquiotibiales', pantorrillas: 'Pantorrillas', cardio: 'Cardio'
  };
  G.GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Core', 'Cardio'];
  G.EQUIP = ['Peso corporal', 'Barra', 'Mancuernas', 'Polea', 'Máquina'];
  G.LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];

  // k: 'reps' (peso × repeticiones) o 'time' (segundos)
  const E = (id, n, g, m, s, eq, lv, d, t, k) => ({ id, n, g, m, s, eq, lv, d, t, k: k || 'reps' });

  G.EX = [
    E('press-banca', 'Press de banca con barra', 'Pecho', ['pecho'], ['hombros', 'triceps'], 'Barra', 'Intermedio',
      'Acostado en el banco, baja la barra con control hasta rozar el pecho y empújala hacia arriba sin despegar la espalda baja ni los glúteos. Trabaja sobre todo el pecho; el hombro y el tríceps ayudan en el empuje.',
      ['Pies firmes en el suelo y omóplatos juntos.', 'Con cargas altas usa topes de seguridad o un compañero.']),
    E('press-inclinado-mancuernas', 'Press inclinado con mancuernas', 'Pecho', ['pecho'], ['hombros', 'triceps'], 'Mancuernas', 'Intermedio',
      'En un banco inclinado (unos 30°), empuja las mancuernas hacia arriba y baja hasta que los codos queden a la altura del pecho. Enfatiza la parte alta del pecho, con apoyo del hombro y el tríceps.',
      ['No subas el banco más de 45° o trabajará más el hombro.', 'Baja en 2–3 segundos.']),
    E('flexiones', 'Flexiones', 'Pecho', ['pecho'], ['hombros', 'triceps', 'abdomen'], 'Peso corporal', 'Principiante',
      'Con el cuerpo recto como una tabla, baja el pecho hasta casi tocar el suelo y empuja para subir. Activa el pecho, el tríceps y el hombro; el abdomen mantiene el cuerpo alineado.',
      ['Si es difícil, apoya las rodillas o las manos en un banco.', 'Codos a unos 45° del cuerpo, no abiertos.']),
    E('fondos-paralelas', 'Fondos en paralelas', 'Pecho', ['pecho', 'triceps'], ['hombros'], 'Peso corporal', 'Avanzado',
      'Sostenido en las barras, baja flexionando los codos hasta unos 90° y sube extendiéndolos. Con el torso inclinado hacia delante carga más el pecho; más erguido, más el tríceps.',
      ['No bajes más de lo que tu hombro tolere cómodamente.', 'Evita balancearte.']),
    E('dominadas', 'Dominadas', 'Espalda', ['dorsales'], ['biceps', 'trapecio', 'antebrazos'], 'Peso corporal', 'Avanzado',
      'Cuelga de la barra y sube hasta pasar la barbilla de la barra, sin balancearte, y baja controlando. Trabaja los dorsales y el bíceps, con ayuda del trapecio y del agarre del antebrazo.',
      ['Empieza la subida bajando los hombros, no solo doblando los brazos.', 'Usa banda elástica o máquina asistida si aún no te salen.']),
    E('jalon-pecho', 'Jalón al pecho', 'Espalda', ['dorsales'], ['biceps', 'trapecio'], 'Polea', 'Principiante',
      'Sentado y con los muslos bloqueados bajo la almohadilla, baja la barra hasta la parte alta del pecho llevando los codos hacia abajo. Es una alternativa a las dominadas que trabaja dorsales y bíceps.',
      ['Inclínate muy poco hacia atrás.', 'No tires con los brazos: piensa en llevar los codos al bolsillo.']),
    E('remo-barra', 'Remo con barra', 'Espalda', ['dorsales', 'trapecio'], ['biceps', 'lumbar'], 'Barra', 'Intermedio',
      'Con el torso inclinado y la espalda recta, lleva la barra hacia la parte baja del abdomen juntando los omóplatos. Trabaja dorsales y trapecio; el bíceps ayuda y la zona lumbar sostiene la postura.',
      ['Mantén la espalda neutra, sin redondearla.', 'Flexiona ligeramente las rodillas.']),
    E('remo-polea', 'Remo sentado en polea', 'Espalda', ['dorsales', 'trapecio'], ['biceps', 'lumbar'], 'Polea', 'Principiante',
      'Sentado con las piernas ligeramente flexionadas, tira del agarre hacia el abdomen juntando los omóplatos y vuelve despacio. Trabaja la espalda media con menos riesgo para la zona lumbar que el remo con barra.',
      ['No te balancees con el torso.', 'Pausa de un segundo con los omóplatos juntos.']),
    E('peso-muerto', 'Peso muerto', 'Espalda', ['lumbar', 'gluteos', 'isquios'], ['trapecio', 'antebrazos', 'cuadriceps', 'dorsales'], 'Barra', 'Avanzado',
      'Con la barra pegada a las piernas y la espalda recta, empuja el suelo con los pies y extiende cadera y rodillas hasta quedar de pie. Trabaja toda la cadena posterior: lumbar, glúteos e isquiotibiales.',
      ['La barra debe subir rozando las piernas.', 'Aprende la técnica con poco peso y pide que te revisen.']),
    E('press-militar', 'Press militar con barra', 'Hombros', ['hombros'], ['triceps', 'trapecio', 'abdomen'], 'Barra', 'Intermedio',
      'De pie, empuja la barra desde los hombros hasta estirar los brazos por encima de la cabeza y baja con control. Trabaja los hombros; el tríceps ayuda y el abdomen estabiliza el cuerpo.',
      ['Aprieta glúteos y abdomen para no arquear la espalda.', 'Mete la cabeza "bajo" la barra al pasar la frente.']),
    E('press-hombro-mancuernas', 'Press de hombros con mancuernas', 'Hombros', ['hombros'], ['triceps', 'trapecio'], 'Mancuernas', 'Principiante',
      'Sentado con la espalda apoyada, empuja las mancuernas desde la altura de los hombros hasta arriba y baja despacio. Trabaja el hombro con ayuda del tríceps y permite un recorrido más natural que la barra.',
      ['No choques las mancuernas arriba.', 'Baja hasta que los codos queden a 90°.']),
    E('elevaciones-laterales', 'Elevaciones laterales', 'Hombros', ['hombros'], ['trapecio'], 'Mancuernas', 'Principiante',
      'De pie, con una ligera flexión de codos, sube las mancuernas hacia los lados hasta la altura de los hombros y baja despacio. Aísla la parte lateral del hombro.',
      ['Usa poco peso y sin impulso.', 'Lidera con los codos, no con las manos.']),
    E('face-pull', 'Face pull', 'Hombros', ['hombros', 'trapecio'], ['dorsales'], 'Polea', 'Principiante',
      'Con la polea a la altura de la cara, tira de la cuerda hacia la frente separando las manos y abriendo los codos. Trabaja la parte posterior del hombro y el trapecio, y ayuda a mejorar la postura.',
      ['Codos altos, a la altura de las manos.', 'Peso ligero y repeticiones controladas.']),
    E('curl-barra', 'Curl de bíceps con barra', 'Brazos', ['biceps'], ['antebrazos'], 'Barra', 'Principiante',
      'De pie, con los codos pegados al cuerpo, sube la barra hasta los hombros sin balancear y baja despacio. Trabaja el bíceps, con ayuda del antebrazo.',
      ['No muevas los codos hacia delante.', 'Baja hasta estirar casi del todo el brazo.']),
    E('curl-alterno', 'Curl alterno con mancuernas', 'Brazos', ['biceps'], ['antebrazos'], 'Mancuernas', 'Principiante',
      'De pie, sube una mancuerna girando la muñeca hacia arriba mientras la otra baja. Trabaja el bíceps; con agarre neutro (palmas enfrentadas) es el curl martillo y carga más el antebrazo.',
      ['Sin balanceo del torso.', 'Alterna con calma, una repetición por brazo.']),
    E('pushdown-triceps', 'Extensión de tríceps en polea', 'Brazos', ['triceps'], ['antebrazos'], 'Polea', 'Principiante',
      'De pie frente a la polea alta, con los codos pegados al cuerpo, estira los brazos hacia abajo y vuelve hasta que el antebrazo quede a 90°. Aísla el tríceps.',
      ['Los codos no se mueven.', 'Aprieta el tríceps un segundo abajo.']),
    E('press-frances', 'Press francés', 'Brazos', ['triceps'], ['hombros'], 'Barra', 'Intermedio',
      'Acostado, con los brazos verticales, flexiona solo los codos para bajar la barra hacia la frente y estira de nuevo. Trabaja el tríceps con un buen estiramiento.',
      ['Codos apuntando al techo, quietos.', 'Usa una barra Z si te molestan las muñecas.']),
    E('sentadilla', 'Sentadilla con barra', 'Piernas', ['cuadriceps', 'gluteos'], ['isquios', 'lumbar', 'abdomen', 'pantorrillas'], 'Barra', 'Intermedio',
      'Con la barra sobre la espalda alta, baja sentándote hacia atrás hasta que los muslos queden paralelos al suelo y sube empujando con todo el pie. Trabaja cuádriceps y glúteos; el core y la espalda sostienen el tronco.',
      ['Rodillas en línea con la punta de los pies.', 'Talones pegados al suelo.']),
    E('prensa', 'Prensa de piernas', 'Piernas', ['cuadriceps', 'gluteos'], ['isquios', 'pantorrillas'], 'Máquina', 'Principiante',
      'Sentado en la máquina, baja la plataforma flexionando las rodillas hasta unos 90° y empuja sin bloquear las rodillas arriba. Trabaja cuádriceps y glúteos con la espalda apoyada.',
      ['No despegues la cadera del asiento.', 'No estires las rodillas por completo arriba.']),
    E('zancadas', 'Zancadas', 'Piernas', ['cuadriceps', 'gluteos'], ['isquios', 'pantorrillas', 'abdomen'], 'Mancuernas', 'Principiante',
      'Da un paso largo al frente y baja hasta que ambas rodillas formen unos 90°; empuja con la pierna delantera para volver. Trabaja cuádriceps y glúteos y mejora el equilibrio. Puedes hacerlas sin peso.',
      ['Torso erguido.', 'La rodilla de delante no pasa mucho de la punta del pie.']),
    E('peso-muerto-rumano', 'Peso muerto rumano', 'Piernas', ['isquios', 'gluteos'], ['lumbar', 'antebrazos', 'trapecio'], 'Barra', 'Intermedio',
      'De pie con las rodillas casi estiradas, lleva la cadera hacia atrás y baja la barra pegada a las piernas hasta notar el estiramiento; sube empujando la cadera al frente. Trabaja isquiotibiales y glúteos.',
      ['Espalda recta todo el tiempo.', 'Baja hasta donde mantengas la espalda neutra.']),
    E('curl-femoral', 'Curl femoral tumbado', 'Piernas', ['isquios'], ['pantorrillas', 'gluteos'], 'Máquina', 'Principiante',
      'Tumbado boca abajo en la máquina, flexiona las rodillas llevando los talones hacia los glúteos y baja despacio. Aísla los isquiotibiales.',
      ['No levantes la cadera del banco.', 'Baja en 2–3 segundos.']),
    E('extension-cuadriceps', 'Extensión de cuádriceps', 'Piernas', ['cuadriceps'], [], 'Máquina', 'Principiante',
      'Sentado en la máquina, estira las rodillas hasta extender las piernas y baja con control. Aísla el cuádriceps.',
      ['Pausa de un segundo arriba.', 'Si te molestan las rodillas, usa menos peso.']),
    E('elevacion-talones', 'Elevación de talones de pie', 'Piernas', ['pantorrillas'], [], 'Peso corporal', 'Principiante',
      'De pie, sube sobre las puntas de los pies lo más alto posible, haz una pausa y baja despacio hasta estirar. Trabaja las pantorrillas. Puedes añadir mancuernas o hacerlo en un escalón.',
      ['Recorrido completo, arriba y abajo.', 'Repeticiones lentas.']),
    E('puente-gluteos', 'Puente de glúteos', 'Piernas', ['gluteos'], ['isquios', 'abdomen', 'lumbar'], 'Peso corporal', 'Principiante',
      'Tumbado con las rodillas dobladas y los pies en el suelo, sube la cadera hasta formar una línea recta de hombros a rodillas y baja sin apoyar del todo. Trabaja los glúteos; apoyar la espalda en un banco lo convierte en hip thrust.',
      ['Aprieta los glúteos arriba un segundo.', 'No arquees la zona lumbar al subir.']),
    E('plancha', 'Plancha', 'Core', ['abdomen'], ['hombros', 'gluteos', 'lumbar'], 'Peso corporal', 'Principiante',
      'Apoyado en antebrazos y puntas de los pies, mantén el cuerpo recto sin dejar caer la cadera. Es un ejercicio isométrico que trabaja todo el abdomen, con apoyo de hombros y glúteos.',
      ['Aprieta abdomen y glúteos.', 'Respira con calma; para si pierdes la postura.'], 'time'),
    E('crunch', 'Crunch abdominal', 'Core', ['abdomen'], [], 'Peso corporal', 'Principiante',
      'Tumbado con las rodillas dobladas, sube los hombros del suelo enrollando el tronco y baja con control. Trabaja el recto abdominal.',
      ['No tires del cuello con las manos.', 'El recorrido es corto; la lumbar queda apoyada.']),
    E('elevacion-piernas', 'Elevación de piernas tumbado', 'Core', ['abdomen'], ['cuadriceps'], 'Peso corporal', 'Intermedio',
      'Tumbado, sube las piernas estiradas hasta la vertical y bájalas sin tocar el suelo. Trabaja la parte baja del abdomen y los flexores de cadera.',
      ['Pega la zona lumbar al suelo.', 'Dobla las rodillas si te cuesta.']),
    E('superman', 'Superman', 'Core', ['lumbar'], ['gluteos', 'hombros', 'trapecio'], 'Peso corporal', 'Principiante',
      'Tumbado boca abajo, levanta a la vez brazos y piernas del suelo, mantén un par de segundos y baja. Fortalece la zona lumbar y los glúteos.',
      ['Mira al suelo, cuello neutro.', 'Sube poco: no hace falta arquear de más.']),
    E('trote-cinta', 'Trote en cinta', 'Cardio', ['cardio'], ['cuadriceps', 'isquios', 'pantorrillas', 'gluteos'], 'Máquina', 'Principiante',
      'Corre a un ritmo en el que puedas hablar entrecortado. Mejora la resistencia cardiovascular y trabaja las piernas. Registra el tiempo en segundos.',
      ['Empieza con 5 minutos de caminata rápida.', 'Apoya la planta del pie bajo tu cuerpo, sin dar zancadas largas.'], 'time'),
    E('jumping-jacks', 'Jumping jacks', 'Cardio', ['cardio'], ['hombros', 'pantorrillas', 'cuadriceps'], 'Peso corporal', 'Principiante',
      'Salta abriendo piernas y brazos a la vez, y vuelve a juntarlos. Eleva el pulso rápido: sirve de calentamiento o de cardio corto. Registra el tiempo en segundos.',
      ['Aterriza suave, con las rodillas flexionadas.', 'Mantén un ritmo constante.'], 'time')
  ];
  G.exMap = {};
  G.EX.forEach((e) => (G.exMap[e.id] = e));

  // Plantillas: [ejercicio, series, repeticiones, descanso(s)]
  const R = (id, s, r, rest) => ({ ex: id, sets: s, reps: r, rest: rest, note: '', ss: false });
  G.TEMPLATES = [
    { id: 'ppl-push', name: 'Push (empuje)', info: 'Pecho, hombros y tríceps', items: [
      R('press-banca', 4, '6-8', 120), R('press-inclinado-mancuernas', 3, '8-10', 90), R('press-hombro-mancuernas', 3, '8-10', 90),
      R('elevaciones-laterales', 3, '12-15', 60), R('pushdown-triceps', 3, '10-12', 60), R('press-frances', 3, '10-12', 60)] },
    { id: 'ppl-pull', name: 'Pull (tirón)', info: 'Espalda, bíceps y hombro posterior', items: [
      R('dominadas', 4, '6-8', 120), R('remo-barra', 4, '8-10', 90), R('jalon-pecho', 3, '10-12', 90),
      R('face-pull', 3, '12-15', 60), R('curl-barra', 3, '8-10', 60), R('curl-alterno', 3, '10-12', 60)] },
    { id: 'ppl-legs', name: 'Legs (piernas)', info: 'Cuádriceps, isquiotibiales, glúteos y pantorrillas', items: [
      R('sentadilla', 4, '6-8', 150), R('peso-muerto-rumano', 3, '8-10', 120), R('prensa', 3, '10-12', 90),
      R('curl-femoral', 3, '10-12', 60), R('extension-cuadriceps', 3, '12-15', 60), R('elevacion-talones', 4, '12-15', 45)] },
    { id: 'full-a', name: 'Cuerpo completo', info: 'Un entrenamiento para todo el cuerpo, 3 días por semana', items: [
      R('sentadilla', 3, '8', 120), R('press-banca', 3, '8', 120), R('remo-barra', 3, '8', 90),
      R('press-militar', 3, '10', 90), R('peso-muerto-rumano', 3, '10', 90), R('plancha', 3, '45', 45)] },
    { id: 'torso', name: 'Torso', info: 'Parte superior (torso/pierna)', items: [
      R('press-banca', 4, '6-8', 120), R('remo-barra', 4, '8', 90), R('press-hombro-mancuernas', 3, '10', 90),
      R('jalon-pecho', 3, '10', 90), R('curl-barra', 3, '10', 60), R('pushdown-triceps', 3, '10', 60)] },
    { id: 'pierna', name: 'Pierna', info: 'Parte inferior (torso/pierna)', items: [
      R('sentadilla', 4, '8', 150), R('prensa', 3, '10', 90), R('peso-muerto-rumano', 3, '10', 90),
      R('curl-femoral', 3, '12', 60), R('elevacion-talones', 4, '15', 45), R('crunch', 3, '15', 45)] },
    { id: 'casa', name: 'En casa, sin equipo', info: 'Solo peso corporal', items: [
      R('flexiones', 3, '10', 60), R('zancadas', 3, '10', 60), R('puente-gluteos', 3, '15', 45),
      R('plancha', 3, '30', 45), R('crunch', 3, '15', 45), R('superman', 3, '12', 45), R('jumping-jacks', 3, '30', 30)] }
  ];

  // Calentamiento general y específico por músculo
  G.WARMUP_GENERAL = [
    { t: '5 minutos de cardio suave', d: 'Trote ligero, bicicleta o remo, hasta entrar en calor.', s: 300 },
    { t: 'Movilidad de articulaciones', d: 'Círculos de hombros, cadera y tobillos, 10 por lado.', s: 60 }
  ];
  G.WARMUP = {
    pecho: 'Rotaciones de hombro y aperturas de brazos, 2×10',
    dorsales: 'Gato-vaca en cuatro apoyos, 2×10',
    trapecio: 'Encogimientos de hombros y círculos, 2×10',
    hombros: 'Círculos de brazos hacia delante y atrás, 2×15',
    biceps: 'Giros de muñeca y flexiones de codo sin peso, 2×12',
    triceps: 'Extensiones de codo sin peso, 2×12',
    antebrazos: 'Círculos de muñeca, 2×15',
    abdomen: 'Plancha suave de 20 segundos',
    lumbar: 'Gato-vaca y puente suave, 2×10',
    gluteos: 'Puente de glúteos, 2×12',
    cuadriceps: 'Sentadillas con peso corporal, 2×12',
    isquios: 'Buenos días con peso corporal, 2×10',
    pantorrillas: 'Elevaciones de talones sin peso, 2×15',
    cardio: 'Caminata rápida 3–5 minutos'
  };
  G.WARMUP_SET = 'Serie de aproximación: 1–2 series ligeras (50 % y 70 % del peso) del primer ejercicio.';
  G.STRETCH = {
    pecho: ['Estiramiento en marco de puerta', 30],
    dorsales: ['Brazos al frente agarrados a un poste, cadera atrás', 30],
    trapecio: ['Inclina la cabeza hacia el hombro', 20],
    hombros: ['Brazo cruzado sobre el pecho', 30],
    biceps: ['Brazo extendido con la palma contra la pared', 30],
    triceps: ['Codo por encima de la cabeza', 30],
    antebrazos: ['Palma hacia arriba y dedos hacia abajo', 20],
    abdomen: ['Postura de cobra', 30],
    lumbar: ['Postura del niño', 30],
    gluteos: ['Figura 4 tumbado', 30],
    cuadriceps: ['Talón al glúteo, de pie', 30],
    isquios: ['Sentado, alcanza la punta del pie', 30],
    pantorrillas: ['Talón abajo contra una pared', 30],
    cardio: ['Camina despacio 2 minutos', 120]
  };

  G.PLATES = {
    kg: { colors: [['25', 'red'], ['20', 'blue'], ['15', 'yellow'], ['10', 'green'], ['5', 'white'], ['2.5', 'black'], ['1.25', 'gray']], bar: 20 },
    lb: { colors: [['45', 'blue'], ['35', 'yellow'], ['25', 'green'], ['10', 'white'], ['5', 'black'], ['2.5', 'gray']], bar: 45 }
  };
})((window.G = window.G || {}));
