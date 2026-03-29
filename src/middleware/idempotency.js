/**
 * Idempotency middleware
 *
 * Applies to POST requests that include an `Idempotency-Key` header.
 * If the same key is received again within the TTL window the cached
 * successful response is returned without re-executing the handler.
 *
 * Keys are stored in-process (Map).  This is fine for a single-instance
 * deployment; swap for Redis if you ever run multiple instances.
 */

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** @type {Map<string, { processing: boolean, status?: number, body?: any, expiresAt: number }>} */
const cache = new Map();

// Prune expired entries once per hour so the Map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}, 60 * 60 * 1000).unref();

module.exports = function idempotency(req, res, next) {
  // Only meaningful for state-changing POST requests
  if (req.method !== 'POST') return next();

  const key = req.headers['idempotency-key'];
  if (!key) return next();

  if (typeof key !== 'string' || key.length > 255) {
    return res.status(400).json({ status: 'error', message: 'Invalid Idempotency-Key header' });
  }

  const cached = cache.get(key);

  if (cached) {
    // A concurrent request is still being processed for this key
    if (cached.processing) {
      return res.status(409).json({
        status: 'error',
        message: 'A request with this Idempotency-Key is already being processed',
      });
    }
    // Return the previously cached successful response
    return res.status(cached.status).json(cached.body);
  }

  // Mark as in-flight so concurrent duplicates get a 409
  cache.set(key, { processing: true, expiresAt: Date.now() + TTL_MS });

  // Intercept res.json to capture and cache the response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, {
        processing: false,
        status: res.statusCode,
        body,
        expiresAt: Date.now() + TTL_MS,
      });
    } else {
      // Do not cache error responses — remove the in-flight marker so the
      // client can retry with the same key after fixing the request
      cache.delete(key);
    }
    return originalJson(body);
  };

  next();
};
