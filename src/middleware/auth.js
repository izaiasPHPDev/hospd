const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospd_secret_key_2026';
const SYSTEM_API_KEY = process.env.SYSTEM_API_KEY || 'hospd-api-key-producao';

module.exports = (req, res, next) => {
  // 1. Permite acesso via API Key (para integrações externas/n8n)
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader && apiKeyHeader === SYSTEM_API_KEY) {
    return next();
  }

  // 2. Permite acesso via JWT (utilizadores logados no Frontend)
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Formato do token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};
