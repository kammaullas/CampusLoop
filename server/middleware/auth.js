const crypto = require('crypto');

/**
 * Admin authentication middleware.
 * Validates Bearer token from Authorization header against ADMIN_TOKEN env var.
 * Uses crypto.timingSafeEqual for constant-time comparison.
 * Requires strong, non-default secret in production.
 */
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Provide a valid admin token in the Authorization header.',
    });
  }

  const token = authHeader.slice(7).trim();
  const serverToken = (process.env.ADMIN_TOKEN || '').trim();

  if (!serverToken) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'ADMIN_TOKEN is not configured on the server.',
    });
  }

  // Enforce strong secret in production environment
  if (process.env.NODE_ENV === 'production') {
    if (serverToken === 'campusloop-admin-2024' || serverToken.length < 16) {
      console.error('CRITICAL: Insecure default or short ADMIN_TOKEN used in production.');
      return res.status(500).json({
        error: 'Insecure server configuration',
        message: 'Production requires a strong custom ADMIN_TOKEN (minimum 16 characters).',
      });
    }
  }

  const tokenBuf = Buffer.from(token);
  const serverTokenBuf = Buffer.from(serverToken);

  if (tokenBuf.length !== serverTokenBuf.length || !crypto.timingSafeEqual(tokenBuf, serverTokenBuf)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid admin token.',
    });
  }

  next();
}

module.exports = { requireAdmin };
