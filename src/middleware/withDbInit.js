// src/middleware/withDbInit.js
import { ensureSchema, isInitError } from '../controllers/database.controller.js';

let initPromise = null; // lock p/ evitar corrida

export function withDbInit(handler, { retryOnSafeMethods = true } = {}) {
  return async (req, res, next) => {
    const run = () => Promise.resolve(handler(req, res, next));

    try {
      return await run();
    } catch (err) {
      if (!isInitError(err)) return next(err);

      try {
        initPromise = initPromise || ensureSchema();
        await initPromise;

        if (retryOnSafeMethods && (req.method === 'GET' || req.method === 'HEAD')) {
          return await run();
        }
        return res.status(503).json({ error: 'Banco inicializado; tente novamente.' });
      } catch (e2) {
        return next(e2);
      } finally {
        initPromise = null;
      }
    }
  };
}
