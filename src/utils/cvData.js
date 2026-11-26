let fallbackCounter = 0;

export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  fallbackCounter += 1;
  return `${prefix}_${Date.now()}_${fallbackCounter}`;
}

export const SECTION_ORDER = [
  'perfilProfesional',
  'experiencia',
  'educacion',
  'habilidades',
  'proyectos',
  'certificaciones',
  'idiomas',
  'premios',
];

export const SECTION_LABELS = {
  es: {
    perfilProfesional: 'Perfil Profesional',
    experiencia: 'Experiencia Profesional',
    educacion: 'Educación',
    habilidades: 'Habilidades',
    proyectos: 'Proyectos',
    certificaciones: 'Certificaciones',
    idiomas: 'Idiomas',
    premios: 'Premios y reconocimientos',
  },
  en: {
    perfilProfesional: 'Professional Summary',
    experiencia: 'Professional Experience',
    educacion: 'Education',
    habilidades: 'Skills',
    proyectos: 'Projects',
    certificaciones: 'Certifications',
    idiomas: 'Languages',
    premios: 'Awards & Honors',
  },
};

export const SECTION_SINGULAR = {
  es: {
    experiencia: 'experiencia',
    educacion: 'educación',
    proyectos: 'proyecto',
    certificaciones: 'certificación',
    idiomas: 'idioma',
    premios: 'premio',
  },
  en: {
    experiencia: 'experience',
    educacion: 'education',
    proyectos: 'project',
    certificaciones: 'certification',
    idiomas: 'language',
    premios: 'award',
  },
};

export function createEmptyCv() {
  return {
    datosPersonales: {
      nombre: '',
      headline: '',
      email: '',
      telefono: '',
      ubicacion: '',
      linkedin: '',
      portafolio: '',
    },
    perfilProfesional: '',
    experiencia: [],
    educacion: [],
    habilidades: { tecnicas: [], blandas: [] },
    proyectos: [],
    certificaciones: [],
    idiomas: [],
    premios: [],
    meta: {
      cargoObjetivo: '',
      keywords: [],
      sugerencias: [],
      idioma: 'es',
      generadoEn: '',
      secciones: {
        perfilProfesional: true,
        experiencia: true,
        educacion: true,
        habilidades: true,
        proyectos: true,
        certificaciones: true,
        idiomas: true,
        premios: true,
      },
      ordenSecciones: [...SECTION_ORDER],
    },
  };
}

export const createExperience = () => ({
  id: createId('exp'),
  cargo: '',
  empresa: '',
  ubicacion: '',
  fechas: '',
  logros: [],
});

export const createEducation = () => ({
  id: createId('edu'),
  titulo: '',
  institucion: '',
  ubicacion: '',
  fecha: '',
  detalles: '',
});

export const createProject = () => ({
  id: createId('pro'),
  nombre: '',
  rol: '',
  fechas: '',
  descripcion: '',
  enlace: '',
});

export const createCertification = () => ({
  id: createId('cert'),
  nombre: '',
  emisor: '',
  fecha: '',
  enlace: '',
});

export const createLanguage = () => ({
  id: createId('lang'),
  idioma: '',
  nivel: '',
});

export const createAward = () => ({
  id: createId('award'),
  titulo: '',
  emisor: '',
  fecha: '',
});

function str(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\r\n/g, '\n').trim();
}

function cleanLine(value) {
  return str(value).replace(/^[-*•·]\s*/, '').trim();
}

export function splitBullets(value) {
  const text = str(value);
  if (!text) return [];
  return text
    .split(/\n+|(?:^|\s)[•·]\s+/g)
    .map(cleanLine)
    .filter(Boolean);
}

function list(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanLine(item)).filter(Boolean);
}

function objectList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === 'object');
}

function withId(item, prefix) {
  return { ...item, id: item.id || createId(prefix) };
}

function parseContact(contact) {
  const text = str(contact);
  if (!text) return { email: '', telefono: '', linkedin: '', portafolio: '' };
  const email = (text.match(/[^\s|,;]+@[^\s|,;]+\.[^\s|,;]+/) || [''])[0];
  const linkedin = (text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,;]+/i) || [''])[0];
  const url = (text.match(/https?:\/\/[^\s|,;]+/i) || [''])[0];
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{6,}\d)/);
  const telefono = phoneMatch ? phoneMatch[0].trim() : '';
  return {
    email,
    telefono,
    linkedin,
    portafolio: url && url !== linkedin ? url : '',
  };
}

/**
 * Acepta datos v1 (profesion/contacto/descripcionSTAR/habilidades[])
 * y datos v2. Devuelve siempre la estructura v2 con IDs estables.
 */
export function normalizeCvData(raw, { targetRole = '', language = 'es' } = {}) {
  const base = createEmptyCv();
  const data = raw && typeof raw === 'object' ? raw : {};
  const personal = data.datosPersonales && typeof data.datosPersonales === 'object'
    ? data.datosPersonales
    : {};
  const contact = parseContact(personal.contacto || '');
  const skills = data.habilidades;
  const skillObject = skills && !Array.isArray(skills) && typeof skills === 'object' ? skills : {};
  const meta = data.meta && typeof data.meta === 'object' ? data.meta : {};
  const secciones = meta.secciones && typeof meta.secciones === 'object' ? meta.secciones : {};
  const orden = Array.isArray(meta.ordenSecciones) && meta.ordenSecciones.length
    ? meta.ordenSecciones.filter((key) => SECTION_ORDER.includes(key))
    : [...SECTION_ORDER];
  for (const key of SECTION_ORDER) if (!orden.includes(key)) orden.push(key);

  return {
    ...base,
    datosPersonales: {
      nombre: str(personal.nombre),
      headline: str(personal.headline || personal.profesion),
      email: str(personal.email || contact.email),
      telefono: str(personal.telefono || contact.telefono),
      ubicacion: str(personal.ubicacion),
      linkedin: str(personal.linkedin || contact.linkedin),
      portafolio: str(personal.portafolio || contact.portafolio),
    },
    perfilProfesional: str(data.perfilProfesional),
    experiencia: objectList(data.experiencia).map((item) =>
      withId(
        {
          cargo: str(item.cargo),
          empresa: str(item.empresa),
          ubicacion: str(item.ubicacion),
          fechas: str(item.fechas),
          logros: list(item.logros).length ? list(item.logros) : splitBullets(item.descripcionSTAR),
        },
        'exp',
      ),
    ),
    educacion: objectList(data.educacion).map((item) =>
      withId(
        {
          titulo: str(item.titulo),
          institucion: str(item.institucion),
          ubicacion: str(item.ubicacion),
          fecha: str(item.fecha),
          detalles: str(item.detalles),
        },
        'edu',
      ),
    ),
    habilidades: {
      tecnicas: list(skillObject.tecnicas).length
        ? list(skillObject.tecnicas)
        : Array.isArray(skills)
          ? list(skills)
          : [],
      blandas: list(skillObject.blandas),
    },
    proyectos: objectList(data.proyectos).map((item) =>
      withId(
        {
          nombre: str(item.nombre),
          rol: str(item.rol),
          fechas: str(item.fechas),
          descripcion: str(item.descripcion),
          enlace: str(item.enlace),
        },
        'pro',
      ),
    ),
    certificaciones: objectList(data.certificaciones).map((item) =>
      withId(
        {
          nombre: str(item.nombre),
          emisor: str(item.emisor),
          fecha: str(item.fecha),
          enlace: str(item.enlace),
        },
        'cert',
      ),
    ),
    idiomas: objectList(data.idiomas).map((item) =>
      withId(
        {
          idioma: str(item.idioma),
          nivel: str(item.nivel),
        },
        'lang',
      ),
    ),
    premios: objectList(data.premios).map((item) =>
      withId(
        {
          titulo: str(item.titulo),
          emisor: str(item.emisor),
          fecha: str(item.fecha),
        },
        'award',
      ),
    ),
    meta: {
      ...base.meta,
      ...meta,
      cargoObjetivo: str(meta.cargoObjetivo || targetRole),
      keywords: list(meta.keywords),
      sugerencias: list(meta.sugerencias),
      idioma: meta.idioma || language,
      generadoEn: meta.generadoEn || '',
      secciones: { ...base.meta.secciones, ...secciones },
      ordenSecciones: orden,
    },
  };
}

export function flattenCv(data) {
  if (!data) return '';
  const personal = data.datosPersonales || {};
  const visible = data?.meta?.secciones || {};
  const isVisible = (key) => visible[key] !== false;
  const parts = [
    personal.nombre,
    personal.headline,
    personal.email,
    personal.telefono,
    personal.ubicacion,
    personal.linkedin,
    personal.portafolio,
  ];

  if (isVisible('perfilProfesional')) parts.push(data.perfilProfesional);

  if (isVisible('experiencia')) {
    for (const item of data.experiencia || []) {
      parts.push(item.cargo, item.empresa, item.ubicacion, item.fechas, ...(item.logros || []));
    }
  }
  if (isVisible('educacion')) {
    for (const item of data.educacion || []) {
      parts.push(item.titulo, item.institucion, item.ubicacion, item.fecha, item.detalles);
    }
  }
  if (isVisible('habilidades')) {
    parts.push(...(data.habilidades?.tecnicas || []), ...(data.habilidades?.blandas || []));
  }
  if (isVisible('proyectos')) {
    for (const item of data.proyectos || []) {
      parts.push(item.nombre, item.rol, item.fechas, item.descripcion, item.enlace);
    }
  }
  if (isVisible('certificaciones')) {
    for (const item of data.certificaciones || []) {
      parts.push(item.nombre, item.emisor, item.fecha, item.enlace);
    }
  }
  if (isVisible('idiomas')) {
    for (const item of data.idiomas || []) parts.push(item.idioma, item.nivel);
  }
  if (isVisible('premios')) {
    for (const item of data.premios || []) parts.push(item.titulo, item.emisor, item.fecha);
  }

  return parts.filter(Boolean).join('\n');
}

export function countWords(data) {
  return flattenCv(data).split(/\s+/).filter(Boolean).length;
}

export function getSectionLabel(section, language = 'es') {
  return SECTION_LABELS[language]?.[section] || SECTION_LABELS.es[section] || section;
}
