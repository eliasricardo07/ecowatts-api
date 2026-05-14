import { Router } from "express";
import supabase from "../config/supabase.js";
import { processarLeitura } from "../services/calculosEnergia.js";
import { validateLeitura } from "../middlewares/validateLeitura.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";
import logger from "../utils/logger.js";

const router = Router();

// ============================================================
// POST /api/leituras — Recebe dados do ESP32 e insere no banco
// ============================================================
router.post("/", writeLimiter, validateLeitura, async (req, res) => {
  try {
    const { consumo_watts, id_aparelho } = req.body;

    // Calcula kWh, custo (R$) e CO₂ a partir da potência bruta
    const { consumo_kwh, custo_estimado, co2_emitido } = processarLeitura(consumo_watts);

    const { data, error } = await supabase
      .from("leituras")
      .insert([
        {
          consumo_watts,
          consumo_kwh,
          custo_estimado,
          co2_emitido,
          id_aparelho,
        },
      ])
      .select();

    if (error) throw error;

    logger.success(`Leitura salva | Aparelho: ${id_aparelho} | ${consumo_watts}W → ${consumo_kwh} kWh`);

    res.status(201).json({
      message: "Leitura registrada com sucesso",
      data: data[0],
    });
  } catch (err) {
    logger.error("Falha ao salvar leitura:", err.message);
    res.status(500).json({ error: "Erro interno no servidor", detalhes: err.message });
  }
});

// ============================================================
// GET /api/leituras — Lista leituras com filtros e paginação
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { id_aparelho, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("leituras")
      .select("*", { count: "exact" })
      .order("data_hora", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filtro opcional por aparelho
    if (id_aparelho) {
      query = query.eq("id_aparelho", Number(id_aparelho));
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      total: count,
      limit: Number(limit),
      offset: Number(offset),
      data,
    });
  } catch (err) {
    logger.error("Falha ao listar leituras:", err.message);
    res.status(500).json({ error: "Erro ao buscar leituras", detalhes: err.message });
  }
});

// ============================================================
// GET /api/leituras/ultimas — Última leitura de cada aparelho
// ============================================================
router.get("/ultimas", async (req, res) => {
  try {
    // Busca os IDs de aparelhos distintos
    const { data: aparelhos, error: errAparelhos } = await supabase
      .from("aparelhos")
      .select("id_aparelho, nome");

    if (errAparelhos) throw errAparelhos;

    // Para cada aparelho, busca a última leitura
    const ultimas = await Promise.all(
      aparelhos.map(async (ap) => {
        const { data, error } = await supabase
          .from("leituras")
          .select("*")
          .eq("id_aparelho", ap.id_aparelho)
          .order("data_hora", { ascending: false })
          .limit(1);

        if (error) throw error;

        return {
          aparelho: ap.nome,
          id_aparelho: ap.id_aparelho,
          ultima_leitura: data[0] || null,
        };
      })
    );

    res.json({ data: ultimas });
  } catch (err) {
    logger.error("Falha ao buscar últimas leituras:", err.message);
    res.status(500).json({ error: "Erro ao buscar últimas leituras", detalhes: err.message });
  }
});

export default router;
