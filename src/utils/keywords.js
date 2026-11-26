const STOPWORDS = new Set(
  `a al algo algunas algunos ante antes aquel aquella aquellas aquellos aqui asi aun cada como con contra cual cuales cualquier cuando de del desde donde dos el ella ellas ellos en entre era eran es esa esas ese eso esos esta estaba estaban este esto estos fue fueron ha habia han hasta hay la las le les lo los mas me mi mis mucho muchos muy no nos o os otra otras otro otros para pero poco por porque que quien quienes se sea sean ser si sin sobre solo son su sus tambien tan tanto te tiene tienen todo todos tu tus un una unas uno unos y ya
  the a an and or but if then than that this these those to of in on at for from with without by as is are was were be been being have has had do does did will would can could should may might must not no yes you your we our they their he she it its i me my
  experiencia experiencias trabajo trabajos empleo empleos empresa empresas puesto puestos cargo cargos rol funciones responsabilidades requisitos requisito conocimientos conocimiento manejo manejar habilidades habilidad años ano anos mes meses dia dias
  experience job jobs work working company companies role roles responsibilities requirements skills skill years year month months day days
  description descripcion candidate candidato candidate candidata aplicante applicant team teams equipo equipos`
    .split(/\s+/)
    .filter(Boolean),
);

const ALIASES = {
  js: ['javascript'],
  ts: ['typescript'],
  reactjs: ['react'],
  react: ['react.js', 'reactjs'],
  node: ['node.js', 'nodejs'],
  nodejs: ['node.js', 'node'],
  postgres: ['postgresql'],
  postgresql: ['postgres'],
  'power bi': ['powerbi'],
  powerbi: ['power bi'],
  'customer service': ['atencion al cliente', 'servicio al cliente'],
  'atencion al cliente': ['customer service', 'servicio al cliente'],
  'servicio al cliente': ['atencion al cliente', 'customer service'],
  'office': ['microsoft office', 'ms office'],
  'excel': ['microsoft excel', 'ms excel'],
  'word': ['microsoft word', 'ms word'],
  'gestion de proyectos': ['project management'],
  'project management': ['gestion de proyectos'],
};

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

function addCount(map, key, weight) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + weight);
}

export function extractKeywords(text, limit = 20) {
  const tokens = tokenize(text);
  if (!tokens.length) return [];

  const counts = new Map();
  for (const token of tokens) addCount(counts, token, 1);

  for (let i = 0; i < tokens.length - 1; i += 1) {
    addCount(counts, `${tokens[i]} ${tokens[i + 1]}`, 1.6);
  }
  for (let i = 0; i < tokens.length - 2; i += 1) {
    addCount(counts, `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`, 1.2);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([keyword]) => keyword)
    .filter((keyword, index, all) => {
      // Evita keywords que sean subcadena exacta de otra más específica ya elegida.
      const moreSpecific = all.slice(0, index).some((other) => other.includes(keyword) && other !== keyword);
      return !moreSpecific;
    })
    .slice(0, limit);
}

function variants(keyword) {
  const normalized = normalizeText(keyword);
  return [normalized, ...(ALIASES[normalized] || []).map(normalizeText)];
}

export function keywordInText(normalizedCv, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;

  for (const variant of variants(normalizedKeyword)) {
    if (!variant) continue;
    if (variant.includes(' ')) {
      if (normalizedCv.includes(variant)) return true;
    } else {
      const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(normalizedCv)) {
        return true;
      }
    }
  }

  // Plural simple en español/inglés.
  if (normalizedKeyword.length > 4 && normalizedKeyword.endsWith('s')) {
    const singular = normalizedKeyword.slice(0, -1);
    return keywordInText(normalizedCv, singular);
  }

  return false;
}

export function mergeKeywords(...lists) {
  const seen = new Set();
  const result = [];
  for (const list of lists) {
    for (const keyword of list || []) {
      const normalized = normalizeText(keyword);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      result.push(keyword);
    }
  }
  return result;
}
