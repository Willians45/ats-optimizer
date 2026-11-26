/**
 * Contrato JSON que devuelve Gemini y que consume la app.
 * Se mantiene en `shared/` para que el proxy (server) y el cliente
 * trabajen con la misma estructura.
 */
export const CV_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    datosPersonales: {
      type: 'object',
      additionalProperties: false,
      properties: {
        nombre: { type: 'string', description: 'Nombre completo real del candidato. No inventar.' },
        headline: { type: 'string', description: 'Titular profesional alineado al cargo objetivo. Ej: "Recepcionista con 4 años de experiencia".' },
        email: { type: 'string', description: 'Email real del CV. No inventar.' },
        telefono: { type: 'string', description: 'Teléfono real del CV. No inventar.' },
        ubicacion: { type: 'string', description: 'Ciudad/país real del CV. Si no aparece, dejar vacío.' },
        linkedin: { type: 'string', description: 'URL o usuario de LinkedIn real. Si no aparece, dejar vacío.' },
        portafolio: { type: 'string', description: 'Portafolio o web real. Si no aparece, dejar vacío.' },
      },
      required: ['nombre', 'headline', 'email', 'telefono', 'ubicacion', 'linkedin', 'portafolio'],
    },
    perfilProfesional: {
      type: 'string',
      description: 'Resumen ejecutivo de 2-4 líneas orientado al cargo objetivo. Sin primera persona.',
    },
    experiencia: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          cargo: { type: 'string', description: 'Cargo real. No inventar.' },
          empresa: { type: 'string', description: 'Empresa real. No inventar.' },
          ubicacion: { type: 'string', description: 'Ubicación real. Si no aparece, dejar vacío.' },
          fechas: { type: 'string', description: 'Fechas reales. No inventar.' },
          logros: {
            type: 'array',
            items: { type: 'string' },
            description: 'Logros en formato STAR. Máximo 5 por puesto. Métricas solo si están en el CV original.',
          },
        },
        required: ['cargo', 'empresa', 'ubicacion', 'fechas', 'logros'],
      },
    },
    educacion: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          titulo: { type: 'string' },
          institucion: { type: 'string' },
          ubicacion: { type: 'string' },
          fecha: { type: 'string' },
          detalles: { type: 'string', description: 'Menciones, especialidad o promedio. Opcional.' },
        },
        required: ['titulo', 'institucion', 'ubicacion', 'fecha', 'detalles'],
      },
    },
    habilidades: {
      type: 'object',
      additionalProperties: false,
      properties: {
        tecnicas: { type: 'array', items: { type: 'string' } },
        blandas: { type: 'array', items: { type: 'string' } },
      },
      required: ['tecnicas', 'blandas'],
    },
    proyectos: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          nombre: { type: 'string' },
          rol: { type: 'string' },
          fechas: { type: 'string' },
          descripcion: { type: 'string' },
          enlace: { type: 'string' },
        },
        required: ['nombre', 'rol', 'fechas', 'descripcion', 'enlace'],
      },
    },
    certificaciones: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          nombre: { type: 'string' },
          emisor: { type: 'string' },
          fecha: { type: 'string' },
          enlace: { type: 'string' },
        },
        required: ['nombre', 'emisor', 'fecha', 'enlace'],
      },
    },
    idiomas: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          idioma: { type: 'string' },
          nivel: { type: 'string' },
        },
        required: ['idioma', 'nivel'],
      },
    },
    premios: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          titulo: { type: 'string' },
          emisor: { type: 'string' },
          fecha: { type: 'string' },
        },
        required: ['titulo', 'emisor', 'fecha'],
      },
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      properties: {
        cargoObjetivo: { type: 'string', description: 'Cargo objetivo usado para personalizar el CV.' },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: '10-15 keywords críticas extraídas de la oferta o del cargo objetivo.',
        },
        sugerencias: {
          type: 'array',
          items: { type: 'string' },
          description: '3-5 sugerencias accionables para mejorar el CV del candidato.',
        },
      },
      required: ['cargoObjetivo', 'keywords', 'sugerencias'],
    },
  },
  required: [
    'datosPersonales',
    'perfilProfesional',
    'experiencia',
    'educacion',
    'habilidades',
    'proyectos',
    'certificaciones',
    'idiomas',
    'premios',
    'meta',
  ],
};

export const DEFAULT_MODEL = 'gemini-3.8-flash';

export const ALLOWED_MODELS = [
  'gemini-3.8-flash',
  'gemini-4-hydrogen',
  'gemini-3.5-flash-lite',
];

export const MODEL_LABELS = {
  'gemini-3.8-flash': 'Gemini 3.8 Flash (recomendado)',
  'gemini-4-hydrogen': 'Gemini 4 Hydrogen (máxima calidad)',
  'gemini-3.5-flash-lite': 'Gemini 3.5 Flash-Lite (económico)',
};
