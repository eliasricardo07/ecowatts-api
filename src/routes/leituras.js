import { Router } from "express";
import supabase from "../config/supabase.js";
import { processarLeitura, calcularCO2 } from "../services/calculosEnergia.js";
import { validateLeitura } from "../middlewares/validateLeitura.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";
import logger from "../utils/logger.js";

const router = Router();

// ============================================================
// POST /api/leituras — Recebe dados do ESP32 e insere no banco
// ============================================================
router.post("/", writeLimiter, validateLeitura, async (req, res) => {
  try {
    const { consumo_watts, id_aparelho, sensor1, sensor2, sensor3, sensor4 } = req.body;
    let leiturasInseridas = [];
    let aparelhosProcessados = [];

    // ============================================================
    // AUTO-PROVISIONAMENTO DINÂMICO
    // Garante que toda a árvore de chaves estrangeiras exista no banco
    // ============================================================
    const id_disp = req.body.id_dispositivo || 1;

    // 1. Garante que o Usuário 1 exista
    const { data: userExists } = await supabase.from("usuarios").select("id_usuario").eq("id_usuario", 1).maybeSingle();
    if (!userExists) {
      await supabase.from("usuarios").insert([{ id_usuario: 1, nome: "Elias Ricardo", email: "elias@ecowatts.com", senha: "senha123", tipo: "residencial" }]);
    }

    // 2. Garante que a Unidade 1 exista
    const { data: unitExists } = await supabase.from("unidades").select("id_unidade").eq("id_unidade", 1).maybeSingle();
    if (!unitExists) {
      await supabase.from("unidades").insert([{ id_unidade: 1, nome: "Maquete EcoWatts", tipo: "residencial", id_usuario: 1 }]);
    }

    // 3. Garante que o Dispositivo exista
    const { data: dispExists } = await supabase.from("dispositivos").select("id_dispositivo").eq("id_dispositivo", id_disp).maybeSingle();
    if (!dispExists) {
      await supabase.from("dispositivos").insert([{ id_dispositivo: id_disp, nome: `Dispositivo ${id_disp}`, localizacao: "Geral", id_unidade: 1 }]);
    }

    // Formato Multi-Sensor Novo
    if (sensor1 || sensor2 || sensor3 || sensor4) {
      const sensores = [
        { id_aparelho: sensor1?.id_aparelho || 1, dados: sensor1, porta: 1 },
        { id_aparelho: sensor2?.id_aparelho || 2, dados: sensor2, porta: 2 },
        { id_aparelho: sensor3?.id_aparelho || 3, dados: sensor3, porta: 3 },
        { id_aparelho: sensor4?.id_aparelho || 4, dados: sensor4, porta: 4 },
      ];

      const registros = [];

      for (const sensor of sensores) {
        if (sensor.dados && (sensor.dados.potencia > 0 || sensor.dados.energia > 0 || sensor.dados.custo > 0)) {
          // 4. Garante que o aparelho do sensor exista na tabela "aparelhos"
          const { data: apExists } = await supabase.from("aparelhos").select("id_aparelho").eq("id_aparelho", sensor.id_aparelho).maybeSingle();
          if (!apExists) {
            await supabase.from("aparelhos").insert([{
              id_aparelho: sensor.id_aparelho,
              nome: `Sensor ${sensor.porta}`,
              potencia_media: 0,
              id_dispositivo: id_disp
            }]);
            logger.info(`Aparelho auto-criado: Sensor ${sensor.porta} (ID: ${sensor.id_aparelho})`);
          }

          const consumo_watts_sensor = sensor.dados.potencia;
          const consumo_kwh_sensor = sensor.dados.energia;
          const custo_estimado_sensor = sensor.dados.custo;
          // CO2 ainda é calculado no backend usando a energia informada
          const co2_emitido_sensor = calcularCO2(consumo_kwh_sensor);

          registros.push({
            consumo_watts: consumo_watts_sensor,
            consumo_kwh: parseFloat(consumo_kwh_sensor.toFixed(8)),
            custo_estimado: parseFloat(custo_estimado_sensor.toFixed(8)),
            co2_emitido: parseFloat(co2_emitido_sensor.toFixed(8)),
            id_aparelho: sensor.id_aparelho,
          });
          aparelhosProcessados.push(sensor.id_aparelho);
        }
      }

      if (registros.length > 0) {
        const { data, error } = await supabase.from("leituras").insert(registros).select();
        if (error) throw error;
        leiturasInseridas = data;
        
        registros.forEach(r => {
          logger.success(`Leitura salva | Aparelho: ${r.id_aparelho} | ${r.consumo_watts}W → ${r.consumo_kwh} kWh (Multi-Sensor)`);
        });
      }
    } else {
      // Formato Antigo Single-Sensor
      // 4. Garante que o aparelho exista na tabela "aparelhos"
      const { data: apExists } = await supabase.from("aparelhos").select("id_aparelho").eq("id_aparelho", id_aparelho).maybeSingle();
      if (!apExists) {
        await supabase.from("aparelhos").insert([{
          id_aparelho: id_aparelho,
          nome: `Aparelho ${id_aparelho}`,
          potencia_media: 0,
          id_dispositivo: id_disp
        }]);
      }

      const { consumo_kwh, custo_estimado, co2_emitido } = processarLeitura(consumo_watts);

      const { data, error } = await supabase
        .from("leituras")
        .insert([{ consumo_watts, consumo_kwh, custo_estimado, co2_emitido, id_aparelho }])
        .select();

      if (error) throw error;
      leiturasInseridas = data;
      aparelhosProcessados.push(id_aparelho);
      
      logger.success(`Leitura salva | Aparelho: ${id_aparelho} | ${consumo_watts}W → ${consumo_kwh} kWh (Single-Sensor)`);
    }

    // ============================================================
    // GAMIFICAÇÃO — Salvar pontos na tabela "pontuacoes"
    // (Apenas consideramos o primeiro aparelho para simplificar a gamificação diária por envio)
    // ============================================================
    let pontuacao_info = null;
    try {
      if (aparelhosProcessados.length > 0) {
        const id_aparelho_gamificacao = aparelhosProcessados[0];
        // 1. Descobrir o id_usuario dono deste aparelho
        const { data: aparelhoData } = await supabase
          .from("aparelhos")
          .select(`
            id_aparelho,
            dispositivos (
              unidades (
                id_usuario
              )
            )
          `)
          .eq("id_aparelho", id_aparelho_gamificacao)
          .single();

        const id_usuario = aparelhoData?.dispositivos?.unidades?.id_usuario;

        if (id_usuario) {
          const pontos_ganhos = 5; // Exemplo: 5 pontos a cada leitura válida registrada
          const hoje = new Date().toISOString().split("T")[0]; // Retorna no formato YYYY-MM-DD

          // 2. Verificar se o usuário já possui pontuação registrada hoje
          const { data: pontuacaoData } = await supabase
            .from("pontuacoes")
            .select("id_pontuacao, pontos")
            .eq("id_usuario", id_usuario)
            .eq("data", hoje)
            .single();

          if (pontuacaoData) {
            // 3a. Se já existe, atualiza somando os pontos novos
            await supabase
              .from("pontuacoes")
              .update({ pontos: pontuacaoData.pontos + pontos_ganhos })
              .eq("id_pontuacao", pontuacaoData.id_pontuacao);
          } else {
            // 3b. Se não existe, cria o primeiro registro do dia
            await supabase
              .from("pontuacoes")
              .insert([{ id_usuario, data: hoje, pontos: pontos_ganhos }]);
          }
        }
      }
    } catch (gamificacaoErr) {
      logger.error("Aviso: Falha ao registrar pontuação de gamificação:", gamificacaoErr.message);
    }
    // ============================================================

    res.status(201).json({
      message: "Leitura registrada e pontuação atualizada com sucesso",
      data: leiturasInseridas,
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
