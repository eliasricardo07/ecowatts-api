import rateLimit from "express-rate-limit";

/**
 * Rate limiter global — protege a API contra flood de requisições.
 * Configurado para suportar múltiplos ESP32 enviando dados a cada 5 segundos.
 * 
 * Limite: 200 requisições por minuto por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // Janela de 1 minuto
  max: 200,              // Máximo de 200 req por minuto por IP
  standardHeaders: true,  // Retorna headers `RateLimit-*`
  legacyHeaders: false,   // Desabilita headers `X-RateLimit-*`
  message: {
    error: "Muitas requisições. Tente novamente em 1 minuto.",
    limite: "200 requisições por minuto",
  },
});

/**
 * Rate limiter mais restritivo para rotas de escrita (POST)
 * Limite: 60 requisições por minuto por IP (1 por segundo)
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de escrita atingido. Tente novamente em breve.",
    limite: "60 escritas por minuto",
  },
});
