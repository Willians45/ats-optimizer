import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  ALLOWED_MODELS,
  CV_JSON_SCHEMA,
  DEFAULT_MODEL,
  MODEL_LABELS,
} from '../shared/cvSchema.js';
import { buildCvPrompt } from './prompts/cvOptimizer.js';
import { normalizeServerCv } from './cvNormalize.js';

const MAX_CV_CHARS = 40_000;
const MAX_JOB_CHARS = 25_000;
const MAX_IMAGE_CHARS = 4_300_000; // ~3.2 MB binarios; Vercel limita el body a 4.5 MB
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

const buckets = new Map();

const ContextSchema = z
  .object({
    targetRole: z.string().max(200).optional().default(''),
    company: z.string().max(200).optional().default(''),
    seniority: z.string().max(100).optional().default(''),
    industry: z.string().max(200).optional().default(''),
    tone: z.enum(['professional', 'direct', 'warm', 'executive']).optional().default('professional'),
    language: z.enum(['es', 'en']).optional().default('es'),
    mustInclude: z.string().max(1000).optional().default(''),
    mustAvoid: z.string().max(1000).optional().default(''),
    maxPages: z.coerce.number().min(1).max(3).optional().default(2),
    focus: z.string().max(100).optional().default('ATS'),
    customInstructions: z.string().max(4000).optional().default(''),
  })
  .partial()
  .default({});

const GenerateSchema = z.object({
  action: z.literal('generate').optional(),
  cvText: z.string().min(30, 'El CV está vacío o es demasiado corto.').max(MAX_CV_CHARS),
  jobDescription: z.string().max(MAX_JOB_CHARS).optional().default(''),
  jobImage: z
    .object({
      data: z.string().max(MAX_IMAGE_CHARS),
      mimeType: z.string().max(120),
    })
    .optional()
    .nullable(),
  context: ContextSchema,
  model: z.string().max(80).optional(),
  userKey: z.string().max(300).optional().nullable(),
});

const TestSchema = z.object({
  action: z.literal('test'),
  userKey: z.string().max(300).optional().nullable(),
  model: z.string().max(80).optional(),
});

function json(status, body) {
  return { status, body };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'));
    } catch {
      return {};
    }
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function getClientIp(headers = {}, fallback = 'unknown') {
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  const real = headers['x-real-ip'] || headers['X-Real-IP'];
  return typeof real === 'string' && real.length ? real : fallback;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_LIMIT_WINDOW_MS;
  }
  bucket.count += 1;
  buckets.set(ip, bucket);

  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (now > value.reset) buckets.delete(key);
    }
  }

  return bucket.count <= RATE_LIMIT_MAX;
}

function resolveModel(requested) {
  if (requested && ALLOWED_MODELS.includes(requested)) return requested;
  const envModel = process.env.GEMINI_MODEL;
  if (envModel && ALLOWED_MODELS.includes(envModel)) return envModel;
  return DEFAULT_MODEL;
}

function resolveKey(userKey) {
  const clean = typeof userKey === 'string' ? userKey.trim() : '';
  if (clean) return { key: clean, source: 'user' };
  const serverKey = (process.env.GEMINI_API_KEY || '').trim();
  if (serverKey) return { key: serverKey, source: 'server' };
  return { key: '', source: 'none' };
}

function sanitizeMessage(message) {
  const text = String(message || '').replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]');
  return text.length > 400 ? `${text.slice(0, 400)}…` : text;
}

function shortModelLabel(id) {
  return (MODEL_LABELS[id] || id || '').replace(/\s*\([^)]*\)\s*$/, '');
}

function modelAlternatives(model) {
  return ALLOWED_MODELS.filter((id) => id !== model).map((id) => shortModelLabel(id));
}

function saturatedMessage(model) {
  const current = shortModelLabel(model) || 'El modelo seleccionado';
  const alternatives = modelAlternatives(model);
  const recommendation = alternatives.length
    ? ` Cambia a otro modelo (${alternatives.join(' o ')}) en Ajustes o en el Asistente IA e inténtalo de nuevo.`
    : ' Inténtalo de nuevo en unos segundos.';
  return `${current} está saturado en este momento.${recommendation}`;
}

function mapError(error, { model = '' } = {}) {
  const status = Number(error?.status || error?.code || 0);
  const raw = sanitizeMessage(error?.message || error);

  if (/API key not valid|API_KEY_INVALID|invalid api key|api key expired|API key expired/i.test(raw)) {
    return {
      status: 401,
      body: {
        error: {
          code: 'INVALID_API_KEY',
          message: 'La API key de Gemini no es válida o caducó. Revísala en Ajustes.',
          detail: raw,
        },
      },
    };
  }
  if (status === 400) {
    return {
      status: 400,
      body: {
        error: {
          code: 'BAD_REQUEST',
          message: 'Gemini rechazó la petición. Revisa el CV, la oferta o las instrucciones e inténtalo de nuevo.',
          detail: raw,
        },
      },
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: 401,
      body: {
        error: {
          code: 'INVALID_API_KEY',
          message: 'La API key de Gemini no es válida o no tiene permisos. Revísala en Ajustes.',
          detail: raw,
        },
      },
    };
  }
  if (status === 404) {
    return {
      status: 404,
      body: {
        error: {
          code: 'MODEL_NOT_FOUND',
          message: 'El modelo seleccionado no está disponible. Prueba con Gemini 3.8 Flash.',
          detail: raw,
        },
      },
    };
  }
  if (
    status === 503 ||
    /overloaded|over capacity|high demand|temporarily unavailable|service unavailable|UNAVAILABLE/i.test(
      raw,
    )
  ) {
    return {
      status: 503,
      body: {
        error: {
          code: 'MODEL_OVERLOADED',
          message: saturatedMessage(model),
          model,
          alternatives: modelAlternatives(model),
          detail: raw,
        },
      },
    };
  }
  if (status === 429) {
    return {
      status: 429,
      body: {
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Se agotó la cuota o el límite de peticiones. Espera un minuto o revisa tu plan de Gemini.',
          detail: raw,
        },
      },
    };
  }
  if (/timeout|timed out|aborted|ETIMEDOUT/i.test(raw)) {
    return {
      status: 504,
      body: {
        error: {
          code: 'TIMEOUT',
          message: 'Gemini tardó demasiado en responder. Inténtalo de nuevo.',
          detail: raw,
        },
      },
    };
  }
  return {
    status: 502,
    body: {
      error: {
        code: 'GEMINI_ERROR',
        message: 'No se pudo completar la optimización. Inténtalo de nuevo en unos segundos.',
        detail: raw,
      },
    },
  };
}

function parseJsonResponse(text) {
  if (!text || !text.trim()) throw new Error('La respuesta del modelo llegó vacía.');
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('El modelo no devolvió un JSON válido.');
  }
}

async function testApiKey(apiKey) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
    {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      detail = '';
    }
    const error = new Error(detail || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return true;
}

export async function handleGeminiRequest({
  method = 'GET',
  body,
  headers = {},
  ip = 'unknown',
} = {}) {
  if (method === 'GET') {
    return json(200, {
      configured: Boolean((process.env.GEMINI_API_KEY || '').trim()),
      defaultModel: resolveModel(),
      allowedModels: ALLOWED_MODELS,
    });
  }

  if (method !== 'POST') {
    return json(405, {
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Método no permitido.' },
    });
  }

  const clientIp = getClientIp(headers, ip);
  if (!checkRateLimit(clientIp)) {
    return json(429, {
      error: {
        code: 'RATE_LIMITED',
        message: 'Demasiadas peticiones desde tu conexión. Espera un minuto e inténtalo de nuevo.',
      },
    });
  }

  const payload = parseBody(body);
  const action = payload?.action === 'test' ? 'test' : 'generate';

  if (action === 'test') {
    const parsed = TestSchema.safeParse(payload);
    if (!parsed.success) {
      return json(400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'La petición de prueba no es válida.',
          detail: parsed.error.issues.map((issue) => issue.message).join(' '),
        },
      });
    }

    const { key } = resolveKey(parsed.data.userKey);
    if (!key) {
      return json(400, {
        error: {
          code: 'NO_API_KEY',
          message: 'Sin API KEY configurada.',
        },
      });
    }

    const testedModel = resolveModel(parsed.data.model);
    try {
      await testApiKey(key);
      return json(200, { ok: true, model: testedModel });
    } catch (error) {
      return mapError(error, { model: testedModel });
    }
  }

  const parsed = GenerateSchema.safeParse(payload);
  if (!parsed.success) {
    return json(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Faltan datos para generar el CV. Revisa el CV y el cargo objetivo.',
        detail: parsed.error.issues.map((issue) => issue.message).join(' '),
      },
    });
  }

  const { key } = resolveKey(parsed.data.userKey);
  if (!key) {
    return json(400, {
      error: {
        code: 'NO_API_KEY',
        message: 'Sin API KEY configurada.',
      },
    });
  }

  const model = resolveModel(parsed.data.model);
  const context = parsed.data.context || {};
  const promptText = buildCvPrompt({
    cvText: parsed.data.cvText,
    jobDescription: parsed.data.jobDescription || '',
    targetRole: context.targetRole || '',
    company: context.company || '',
    seniority: context.seniority || '',
    industry: context.industry || '',
    tone: context.tone || 'professional',
    language: context.language || 'es',
    mustInclude: context.mustInclude || '',
    mustAvoid: context.mustAvoid || '',
    maxPages: context.maxPages || 2,
    focus: context.focus || 'ATS',
    customInstructions: context.customInstructions || '',
    hasJobImage: Boolean(parsed.data.jobImage?.data),
  });

  const parts = [{ text: promptText }];
  if (parsed.data.jobImage?.data && parsed.data.jobImage?.mimeType) {
    parts.push({
      inlineData: {
        data: parsed.data.jobImage.data,
        mimeType: parsed.data.jobImage.mimeType,
      },
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction:
          'Eres un experto en ATS y redacción de CVs. Devuelve exclusivamente JSON válido según el esquema. Nunca inventes datos personales, empresas, cargos, fechas ni métricas.',
        responseMimeType: 'application/json',
        responseJsonSchema: CV_JSON_SCHEMA,
        temperature: 0.35,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;
    const rawData = parseJsonResponse(text);
    const data = normalizeServerCv(rawData, {
      targetRole: context.targetRole || '',
      language: context.language || 'es',
    });

    return json(200, {
      data,
      model,
      usage: response.usageMetadata || null,
    });
  } catch (error) {
    return mapError(error, { model });
  }
}
