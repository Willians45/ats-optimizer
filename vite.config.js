import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGeminiRequest } from './server/geminiHandler.js';

/**
 * Monta el mismo handler que usa Vercel en el dev server de Vite.
 * Así `npm run dev` funciona sin `vercel dev` ni configuración extra.
 */
function geminiApiPlugin() {
  return {
    name: 'ats-gemini-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req, res) => {
        try {
          if (req.method === 'GET') {
            const result = await handleGeminiRequest({
              method: 'GET',
              headers: req.headers,
              ip: req.socket?.remoteAddress || 'unknown',
            });
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(result.body));
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Método no permitido.' } }));
            return;
          }

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          let body = {};
          try {
            body = raw ? JSON.parse(raw) : {};
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido.' } }));
            return;
          }

          const result = await handleGeminiRequest({
            method: 'POST',
            body,
            headers: req.headers,
            ip: req.socket?.remoteAddress || 'unknown',
          });

          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(result.body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              error: {
                code: 'DEV_SERVER_ERROR',
                message: 'Error interno del proxy de desarrollo.',
                detail: String(error?.message || error).slice(0, 300),
              },
            }),
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Variables server-only: no deben llevar el prefijo VITE_.
  for (const key of ['GEMINI_API_KEY', 'GEMINI_MODEL']) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), geminiApiPlugin()],
  };
});
