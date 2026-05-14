/**
 * Logger minimalista com timestamp e níveis coloridos.
 * Usado para registrar eventos da API no console.
 */

function timestamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

const logger = {
  info: (msg, ...args) => {
    console.log(`[${timestamp()}] ℹ️  INFO  | ${msg}`, ...args);
  },

  success: (msg, ...args) => {
    console.log(`[${timestamp()}] ✅ OK    | ${msg}`, ...args);
  },

  warn: (msg, ...args) => {
    console.warn(`[${timestamp()}] ⚠️  WARN  | ${msg}`, ...args);
  },

  error: (msg, ...args) => {
    console.error(`[${timestamp()}] ❌ ERROR | ${msg}`, ...args);
  },

  request: (req) => {
    console.log(`[${timestamp()}] 🔵 REQ   | ${req.method} ${req.originalUrl}`);
  },
};

export default logger;
