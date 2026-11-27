import { getUserApiKey } from '../utils/storage';

const API_URL = '/api/gemini';
const TIMEOUT_MS = 120_000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', detail = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

async function request(options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(API_URL, {
      ...options,
      signal: controller.signal,
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok) {
      throw new ApiError(
        payload?.error?.message || 'No se pudo completar la petición a Gemini.',
        {
          status: response.status,
          code: payload?.error?.code || 'REQUEST_FAILED',
          detail: payload?.error?.detail || '',
        },
      );
    }
    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('La petición tardó demasiado. Inténtalo de nuevo.', {
        status: 0,
        code: 'TIMEOUT',
      });
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      { status: 0, code: 'NETWORK_ERROR', detail: String(error?.message || error) },
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getApiStatus() {
  return request({ method: 'GET' });
}

export async function testApiKey(userKey = '') {
  const key = (userKey || getUserApiKey() || '').trim();
  return request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'test', userKey: key || undefined }),
  });
}

export async function generateCv({
  cvText,
  jobDescription = '',
  jobImage = null,
  context = {},
  model = '',
}) {
  const userKey = getUserApiKey();
  return request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generate',
      cvText,
      jobDescription,
      jobImage: jobImage
        ? { data: jobImage.data, mimeType: jobImage.mimeType }
        : undefined,
      context,
      model: model || undefined,
      userKey: userKey || undefined,
    }),
  });
}

export async function searchJobs({
  targetRole = '',
  headline = '',
  keywords = [],
  location = '',
  summary = '',
  language = 'es',
  model = '',
}) {
  const userKey = getUserApiKey();
  return request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'jobs',
      targetRole,
      headline,
      keywords,
      location,
      summary,
      language,
      model: model || undefined,
      userKey: userKey || undefined,
    }),
  });
}
