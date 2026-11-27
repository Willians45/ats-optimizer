const LANGUAGE_LABEL = {
  es: 'español',
  en: 'inglés',
};

function str(value, max = 300) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function buildJobSearchPrompt({
  targetRole = '',
  headline = '',
  keywords = [],
  location = '',
  summary = '',
  language = 'es',
}) {
  const outputLanguage = LANGUAGE_LABEL[language] || LANGUAGE_LABEL.es;
  const keywordList = keywords.length ? keywords.join(', ') : 'no especificadas';
  return `
Eres un buscador de empleo especializado. Usa la herramienta de búsqueda de Google para encontrar ofertas de empleo reales, activas y recientes que encajen con este perfil:

- Cargo objetivo: ${targetRole || headline || 'no especificado'}
- Titular del CV: ${headline || 'no especificado'}
- Ubicación: ${location || 'sin ubicación concreta'}
- Keywords principales: ${keywordList}
- Resumen del perfil: ${summary || 'no disponible'}

Busca en portales de empleo, LinkedIn, InfoJobs, Indeed, empresas y bolsas de trabajo. Prioriza ofertas publicadas en los últimos 30 días y que sean accesibles desde España o en remoto.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta forma, sin markdown ni texto adicional:
{
  "jobs": [
    {
      "titulo": "Título real de la oferta",
      "empresa": "Nombre real de la empresa",
      "ubicacion": "Ciudad / remoto",
      "url": "https://url-real-de-la-oferta",
      "fuente": "Portal o web de origen",
      "motivo": "Por qué encaja con este CV, en una frase"
    }
  ]
}

Reglas:
- Entre 6 y 10 ofertas si existen; si no hay suficientes, devuelve las que encuentres.
- No inventes ofertas, empresas, ubicaciones ni URLs. Usa solo resultados reales de la búsqueda.
- No inventes una URL si no la has visto en los resultados.
- Escribe los textos en ${outputLanguage}.
- No incluyas datos personales del candidato en la respuesta.
`.trim();
}

export function normalizeJobResults(raw) {
  const items = Array.isArray(raw?.jobs) ? raw.jobs : [];
  const seen = new Set();
  const jobs = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const titulo = str(item.titulo || item.title, 180);
    if (!titulo) continue;
    const empresa = str(item.empresa || item.company, 140);
    const ubicacion = str(item.ubicacion || item.location, 140);
    const url = safeUrl(item.url || item.enlace);
    const fuente = str(item.fuente || item.source, 100);
    const motivo = str(item.motivo || item.reason, 240);
    const key = `${titulo}|${empresa}|${url}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push({ titulo, empresa, ubicacion, url, fuente, motivo });
    if (jobs.length >= 10) break;
  }

  return jobs;
}

export function extractGroundingSources(groundingMetadata) {
  const chunks = Array.isArray(groundingMetadata?.groundingChunks)
    ? groundingMetadata.groundingChunks
    : [];
  const seen = new Set();
  const sources = [];

  for (const chunk of chunks) {
    const web = chunk?.web;
    const url = safeUrl(web?.uri);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    sources.push({ title: str(web?.title, 160), url });
    if (sources.length >= 10) break;
  }

  return sources;
}

export function buildJobSearchSystemInstruction() {
  return 'Eres un buscador de empleo. Usa Google Search para encontrar ofertas reales. No inventes ofertas ni URLs. Devuelve únicamente JSON válido, sin markdown.';
}
