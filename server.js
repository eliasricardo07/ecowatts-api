import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// conexão com Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// rota teste
app.get("/", (req, res) => {
  res.send("API EcoWatts rodando 🚀");
});

// rota para salvar leitura
app.post("/leituras", async (req, res) => {
  try {
    const { consumo_watts, id_aparelho } = req.body;

    const consumo_kwh = consumo_watts / 1000;
    const custo_estimado = consumo_kwh * 0.8;
    const co2_emitido = consumo_kwh * 0.084;

    const { data, error } = await supabase
      .from("leituras")
      .insert([
        {
          consumo_watts,
          consumo_kwh,
          custo_estimado,
          co2_emitido,
          id_aparelho
        }
      ]);

    if (error) throw error;

    res.json({ message: "Leitura salva com sucesso", data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});