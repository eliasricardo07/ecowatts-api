import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./src/utils/logger.js";
import { apiLimiter } from "./src/middlewares/rateLimiter.js";
import leiturasRouter from "./src/routes/leituras.js";
import dispositivosRouter from "./src/routes/dispositivos.js";
import dashboardRouter from "./src/routes/dashboard.js";

dotenv.config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Log de cada requisição
app.use((req, res, next) => {
  logger.request(req);
  next();
});

// ============================================================
// Health check
// ============================================================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    api: "EcoWatts",
    versao: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      leituras: "/api/leituras",
      dispositivos: "/api/dispositivos",
      dashboard: "/api/dashboard/resumo",
    },
  });
});

// ============================================================
// Rotas da API
// ============================================================
app.use("/api/leituras", leiturasRouter);
app.use("/api/dispositivos", dispositivosRouter);
app.use("/api/dashboard", dashboardRouter);

// ============================================================
// 404 — Rota não encontrada
// ============================================================
app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
});

// ============================================================
// Error handler global
// ============================================================
app.use((err, req, res, next) => {
  logger.error("Erro não tratado:", err.message);
  res.status(500).json({ error: "Erro interno no servidor" });
});

// ============================================================
// Iniciar servidor
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🔋 API EcoWatts rodando na porta ${PORT}`);
  logger.info(`📡 Aguardando dados do ESP32...`);
});