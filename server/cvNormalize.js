function str(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function list(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => str(item))
    .filter(Boolean);
}

function entries(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === 'object');
}

/**
 * Normaliza y sanea la respuesta del modelo. No inventa datos: solo
 * garantiza tipos, arrays y campos requeridos para que el cliente no
 * se rompa con respuestas parciales.
 */
export function normalizeServerCv(raw, { targetRole = '', language = 'es' } = {}) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const personal = data.datosPersonales && typeof data.datosPersonales === 'object'
    ? data.datosPersonales
    : {};
  const skills = data.habilidades && typeof data.habilidades === 'object'
    ? data.habilidades
    : {};
  const meta = data.meta && typeof data.meta === 'object' ? data.meta : {};

  return {
    datosPersonales: {
      nombre: str(personal.nombre),
      headline: str(personal.headline || personal.profesion),
      email: str(personal.email),
      telefono: str(personal.telefono),
      ubicacion: str(personal.ubicacion),
      linkedin: str(personal.linkedin),
      portafolio: str(personal.portafolio),
    },
    perfilProfesional: str(data.perfilProfesional),
    experiencia: entries(data.experiencia).map((item) => ({
      cargo: str(item.cargo),
      empresa: str(item.empresa),
      ubicacion: str(item.ubicacion),
      fechas: str(item.fechas),
      logros: list(item.logros).length
        ? list(item.logros)
        : str(item.descripcionSTAR)
          ? str(item.descripcionSTAR).split(/\n+/).map(str).filter(Boolean)
          : [],
    })),
    educacion: entries(data.educacion).map((item) => ({
      titulo: str(item.titulo),
      institucion: str(item.institucion),
      ubicacion: str(item.ubicacion),
      fecha: str(item.fecha),
      detalles: str(item.detalles),
    })),
    habilidades: {
      tecnicas: list(skills.tecnicas).length ? list(skills.tecnicas) : list(data.habilidades),
      blandas: list(skills.blandas),
    },
    proyectos: entries(data.proyectos).map((item) => ({
      nombre: str(item.nombre),
      rol: str(item.rol),
      fechas: str(item.fechas),
      descripcion: str(item.descripcion),
      enlace: str(item.enlace),
    })),
    certificaciones: entries(data.certificaciones).map((item) => ({
      nombre: str(item.nombre),
      emisor: str(item.emisor),
      fecha: str(item.fecha),
      enlace: str(item.enlace),
    })),
    idiomas: entries(data.idiomas).map((item) => ({
      idioma: str(item.idioma),
      nivel: str(item.nivel),
    })),
    premios: entries(data.premios).map((item) => ({
      titulo: str(item.titulo),
      emisor: str(item.emisor),
      fecha: str(item.fecha),
    })),
    meta: {
      cargoObjetivo: str(meta.cargoObjetivo || targetRole),
      keywords: list(meta.keywords),
      sugerencias: list(meta.sugerencias),
      idioma: language,
      generadoEn: new Date().toISOString(),
    },
  };
}
