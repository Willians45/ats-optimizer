import { flattenCv } from '../utils/cvData';
import { extractKeywords, keywordInText, mergeKeywords, normalizeText } from '../utils/keywords';

function check(id, label, status, detail) {
  return { id, label, status, detail };
}

function statusScore(status) {
  if (status === 'pass') return 1;
  if (status === 'warn') return 0.5;
  return 0;
}

export function analyzeAts(data, { jobDescription = '', targetRole = '', language = 'es' } = {}) {
  const cvText = flattenCv(data);
  const normalizedCv = normalizeText(cvText);
  const visible = data?.meta?.secciones || {};
  const isVisible = (key) => visible[key] !== false;
  const experiencia = isVisible('experiencia') ? data?.experiencia || [] : [];
  const bullets = experiencia.flatMap((item) => item.logros || []);
  const quantified = bullets.filter((bullet) => /\d/.test(bullet)).length;
  const words = cvText.split(/\s+/).filter(Boolean).length;

  const jdKeywords = jobDescription ? extractKeywords(jobDescription, 24) : [];
  const roleKeywords = targetRole ? extractKeywords(targetRole, 6) : [];
  const fallback = mergeKeywords(
    isVisible('habilidades') ? data?.habilidades?.tecnicas || [] : [],
    isVisible('habilidades') ? data?.habilidades?.blandas || [] : [],
    data?.meta?.keywords || [],
  ).slice(0, 16);

  const keywords = mergeKeywords(roleKeywords, jdKeywords, fallback).slice(0, 24);
  const found = keywords.filter((keyword) => keywordInText(normalizedCv, keyword));
  const missing = keywords.filter((keyword) => !keywordInText(normalizedCv, keyword));
  const coverage = keywords.length ? found.length / keywords.length : 0;

  const hasEmail = Boolean(data?.datosPersonales?.email);
  const hasPhone = Boolean(data?.datosPersonales?.telefono);
  const hasContact = hasEmail || hasPhone;
  const titleMatch = targetRole ? keywordInText(normalizedCv, targetRole) : Boolean(data?.datosPersonales?.headline);
  const withDates = experiencia.filter((item) => item.fechas).length;
  const totalExperience = experiencia.length;
  const datesOk = totalExperience === 0 ? false : withDates === totalExperience;
  const hasLinkedin = Boolean(data?.datosPersonales?.linkedin);
  const hasSummary = isVisible('perfilProfesional') && Boolean(data?.perfilProfesional);

  const checks = [
    check(
      'contacto',
      'Datos de contacto',
      hasContact ? 'pass' : 'fail',
      hasContact
        ? 'El CV incluye email o teléfono.'
        : 'Añade al menos un email o teléfono real para que el ATS pueda contactarte.',
    ),
    check(
      'titulo',
      'Cargo objetivo visible',
      titleMatch ? 'pass' : 'warn',
      titleMatch
        ? 'El cargo objetivo aparece en el headline o en el CV.'
        : 'Incluye el cargo objetivo en el headline para mejorar el match.',
    ),
    check(
      'formato',
      'Formato compatible con ATS',
      'pass',
      'Plantilla de una sola columna, sin tablas, imágenes ni gráficos.',
    ),
    check(
      'logros',
      'Logros suficientes',
      bullets.length >= 4 ? 'pass' : bullets.length >= 2 ? 'warn' : 'fail',
      bullets.length
        ? `${bullets.length} logro(s) detectado(s).`
        : 'Añade logros concretos en tus experiencias, no solo responsabilidades.',
    ),
    check(
      'metricas',
      'Logros con métricas',
      quantified >= 2 ? 'pass' : quantified === 1 ? 'warn' : 'fail',
      quantified
        ? `${quantified} logro(s) con cifras o métricas.`
        : 'Añade números reales (%, tiempo, volumen, presupuesto) solo si puedes respaldarlos.',
    ),
    check(
      'keywords',
      'Cobertura de keywords',
      coverage >= 0.6 ? 'pass' : coverage >= 0.35 ? 'warn' : 'fail',
      keywords.length
        ? `${found.length}/${keywords.length} keywords clave presentes.`
        : 'Añade una oferta o un cargo objetivo para calcular keywords.',
    ),
    check(
      'fechas',
      'Fechas en la experiencia',
      datesOk ? 'pass' : totalExperience ? 'warn' : 'warn',
      datesOk
        ? 'Todas las experiencias tienen fechas.'
        : 'Revisa que cada experiencia incluya fechas (mes/año).',
    ),
    check(
      'linkedin',
      'LinkedIn o portafolio',
      hasLinkedin || data?.datosPersonales?.portafolio ? 'pass' : 'warn',
      hasLinkedin || data?.datosPersonales?.portafolio
        ? 'Incluye un enlace profesional.'
        : 'Añade LinkedIn o portafolio si aporta valor para el cargo.',
    ),
    check(
      'resumen',
      'Perfil profesional',
      hasSummary ? 'pass' : 'warn',
      hasSummary ? 'El CV tiene un resumen profesional.' : 'Añade un resumen de 2-4 líneas orientado al cargo.',
    ),
    check(
      'longitud',
      'Longitud razonable',
      words <= 900 ? 'pass' : words <= 1300 ? 'warn' : 'fail',
      `${words} palabras.`,
    ),
  ];

  const keywordScore = coverage;
  const titleScore = titleMatch ? 1 : data?.datosPersonales?.headline ? 0.5 : 0;
  const formatIds = ['contacto', 'formato', 'fechas', 'longitud', 'resumen'];
  const formatScore =
    checks.filter((item) => formatIds.includes(item.id)).reduce((sum, item) => sum + statusScore(item.status), 0) /
    formatIds.length;
  const achievementScore =
    Math.min(1, bullets.length / 5) * 0.5 + Math.min(1, quantified / 3) * 0.5;

  const score = Math.round(
    keywordScore * 50 + titleScore * 15 + formatScore * 20 + achievementScore * 15,
  );

  const suggestions = [];
  if (missing.length) {
    suggestions.push(
      `Integra estas keywords en logros o habilidades: ${missing.slice(0, 6).join(', ')}.`,
    );
  }
  if (!titleMatch && targetRole) {
    suggestions.push(`Incluye "${targetRole}" en el headline y en el perfil profesional.`);
  }
  if (!quantified) {
    suggestions.push('Añade al menos una métrica real por puesto (porcentaje, volumen, tiempo o ahorro).');
  }
  if (!hasContact) {
    suggestions.push('Añade un email y un teléfono reales en la cabecera.');
  }
  if (!hasSummary) {
    suggestions.push('Añade un perfil profesional de 2-4 líneas alineado al cargo.');
  }
  if (words > 1300) {
    suggestions.push('Recorta el CV: los reclutadores dedican pocos segundos a la primera lectura.');
  }
  if (!hasLinkedin && !data?.datosPersonales?.portafolio) {
    suggestions.push('Añade LinkedIn o portafolio si es relevante para el puesto.');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    keywords,
    found,
    missing,
    coverage,
    checks,
    suggestions,
    stats: {
      bullets: bullets.length,
      quantified,
      words,
      experience: totalExperience,
      language,
    },
  };
}
