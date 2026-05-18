import { Router } from "express";
import supabase from "../config/supabase.js";
import logger from "../utils/logger.js";

const router = Router();

// ============================================================
// GET /api/dashboard/resumo — Totais acumulados (kWh, R$, CO₂)
// Filtros: ?periodo=hoje|semana|mes  |  ?id_aparelho=1
// ============================================================
router.get("/resumo", async (req, res) => {
  try {
    const { periodo, id_aparelho } = req.query;
    const id_usuario = req.headers["x-user-id"] || req.query.id_usuario || "1";

    // 1. Buscar todos os aparelhos pertencentes ao usuário ativo
    let aparelhosIds = [];
    try {
      const { data: aparelhosDoUsuario } = await supabase
        .from("aparelhos")
        .select(`
          id_aparelho,
          dispositivos!inner (
            id_unidade,
            unidades!inner (
              id_usuario
            )
          )
        `)
        .eq("dispositivos.unidades.id_usuario", id_usuario);

      if (aparelhosDoUsuario && aparelhosDoUsuario.length > 0) {
        aparelhosIds = aparelhosDoUsuario.map(a => a.id_aparelho);
      }
    } catch (apErr) {
      logger.error("Erro ao buscar aparelhos do usuário:", apErr.message);
    }

    let query = supabase
      .from("leituras")
      .select("consumo_kwh, custo_estimado, co2_emitido, id_aparelho");

    // Filtrar leituras pelos aparelhos do usuário
    if (aparelhosIds.length > 0) {
      // Se um aparelho específico for solicitado via query param, filtramos ainda mais
      if (id_aparelho) {
        const idApNum = Number(id_aparelho);
        if (aparelhosIds.includes(idApNum)) {
          query = query.eq("id_aparelho", idApNum);
        } else {
          // O usuário tentou acessar um aparelho que não pertence a ele
          query = query.eq("id_aparelho", -1);
        }
      } else {
        query = query.in("id_aparelho", aparelhosIds);
      }
    } else {
      // Se não tiver nenhum aparelho e for um usuário novo (diferente da maquete '1'), retornamos vazio
      if (id_usuario !== "1") {
        query = query.eq("id_aparelho", -1);
      } else if (id_aparelho) {
        query = query.eq("id_aparelho", Number(id_aparelho));
      }
    }

    // Filtro por período
    if (periodo) {
      const agora = new Date();
      let inicio;

      switch (periodo) {
        case "hoje":
          inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
          break;
        case "semana":
          inicio = new Date(agora);
          inicio.setDate(agora.getDate() - 7);
          break;
        case "mes":
          inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
          break;
        default:
          return res.status(400).json({
            error: "Período inválido. Use: hoje, semana ou mes.",
          });
      }

      query = query.gte("data_hora", inicio.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Somar tudo no backend
    const resumo = data.reduce(
      (acc, leitura) => {
        acc.total_kwh += Number(leitura.consumo_kwh) || 0;
        acc.total_custo += Number(leitura.custo_estimado) || 0;
        acc.total_co2 += Number(leitura.co2_emitido) || 0;
        acc.total_leituras += 1;
        return acc;
      },
      { total_kwh: 0, total_custo: 0, total_co2: 0, total_leituras: 0 }
    );

    // Arredondar valores para exibição
    resumo.total_kwh = parseFloat(resumo.total_kwh.toFixed(6));
    resumo.total_custo = parseFloat(resumo.total_custo.toFixed(4));
    resumo.total_co2 = parseFloat(resumo.total_co2.toFixed(6));

    // 2. Buscar a pontuação acumulada real persistida na tabela "pontuacoes"
    let totalPontos = 0;
    try {
      const { data: pontosData, error: pontosErr } = await supabase
        .from("pontuacoes")
        .select("pontos")
        .eq("id_usuario", id_usuario);

      if (!pontosErr && pontosData) {
        totalPontos = pontosData.reduce((sum, p) => sum + (p.pontos || 0), 0);
      }
    } catch (pontosErr) {
      logger.error("Erro ao buscar pontuação do usuário:", pontosErr.message);
    }

    resumo.pontos_gamificacao = totalPontos;

    res.json({
      periodo: periodo || "total",
      ...resumo,
    });
  } catch (err) {
    logger.error("Falha ao gerar resumo:", err.message);
    res.status(500).json({ error: "Erro ao gerar resumo", detalhes: err.message });
  }
});

// ============================================================
// GET /api/dashboard/historico — Série temporal para gráficos
// Filtros: ?id_aparelho=1  |  ?limit=100
// ============================================================
router.get("/historico", async (req, res) => {
  try {
    const { id_aparelho, limit = 100 } = req.query;

    if (!id_aparelho) {
      return res.status(400).json({
        error: "Parâmetro 'id_aparelho' é obrigatório para o histórico.",
      });
    }

    const { data, error } = await supabase
      .from("leituras")
      .select("id_leitura, consumo_watts, consumo_kwh, custo_estimado, co2_emitido, data_hora")
      .eq("id_aparelho", Number(id_aparelho))
      .order("data_hora", { ascending: true })
      .limit(Number(limit));

    if (error) throw error;

    res.json({
      id_aparelho: Number(id_aparelho),
      total_pontos: data.length,
      data,
    });
  } catch (err) {
    logger.error("Falha ao buscar histórico:", err.message);
    res.status(500).json({ error: "Erro ao buscar histórico", detalhes: err.message });
  }
});

export default router;
