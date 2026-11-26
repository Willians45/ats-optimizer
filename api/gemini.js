import { handleGeminiRequest } from '../server/geminiHandler.js';

export default async function handler(req, res) {
  const result = await handleGeminiRequest({
    method: req.method,
    body: req.body,
    headers: req.headers,
    ip: req.socket?.remoteAddress || 'unknown',
  });

  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(result.body));
}
