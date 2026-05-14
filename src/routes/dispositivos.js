import { Router } from "express";
import supabase from "../config/supabase.js";
import logger from "../utils/logger.js";

const router = Router();

// ============================================================
// GET /api/dispositivos — Lista todos os dispositivos ESP32
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { id_unidade } = req.query;

    let query = supabase
      .from("dispositivos")
      .select(`
        id_dispositivo,
        nome,
        localizacao,
        id_unidade,
        criado_em,
        aparelhos (
          id_aparelho,
          nome,
          potencia_media
        )
      `)
      .order("criado_em", { ascending: false });

    if (id_unidade) {
      query = query.eq("id_unidade", Number(id_unidade));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ total: data.length, data });
  } catch (err) {
    logger.error("Falha ao listar dispositivos:", err.message);
    res.status(500).json({ error: "Erro ao buscar dispositivos", detalhes: err.message });
  }
});

// ============================================================
// GET /api/dispositivos/:id — Detalhes de um dispositivo + aparelhos
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("dispositivos")
      .select(`
        id_dispositivo,
        nome,
        localizacao,
        id_unidade,
        criado_em,
        aparelhos (
          id_aparelho,
          nome,
          potencia_media,
          criado_em
        )
      `)
      .eq("id_dispositivo", Number(id))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: `Dispositivo ${id} não encontrado.` });
      }
      throw error;
    }

    res.json({ data });
  } catch (err) {
    logger.error("Falha ao buscar dispositivo:", err.message);
    res.status(500).json({ error: "Erro ao buscar dispositivo", detalhes: err.message });
  }
});

// ============================================================
// GET /api/aparelhos — Lista todos os aparelhos cadastrados
// ============================================================
router.get("/aparelhos/todos", async (req, res) => {
  try {
    const { id_dispositivo } = req.query;

    let query = supabase
      .from("aparelhos")
      .select(`
        id_aparelho,
        nome,
        potencia_media,
        id_dispositivo,
        criado_em
      `)
      .order("nome", { ascending: true });

    if (id_dispositivo) {
      query = query.eq("id_dispositivo", Number(id_dispositivo));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ total: data.length, data });
  } catch (err) {
    logger.error("Falha ao listar aparelhos:", err.message);
    res.status(500).json({ error: "Erro ao buscar aparelhos", detalhes: err.message });
  }
});

export default router;
