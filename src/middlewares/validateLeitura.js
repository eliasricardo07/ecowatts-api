/**
 * Middleware de validação do payload para POST /api/leituras
 * Garante que os dados enviados pelo ESP32 são válidos antes de processar.
 */
export function validateLeitura(req, res, next) {
  const { consumo_watts, id_aparelho, sensor1, sensor2, sensor3, sensor4 } = req.body;

  // Verifica se é o novo formato (contém algum dos sensores)
  if (sensor1 || sensor2 || sensor3 || sensor4) {
    // Validação básica do novo formato
    // Apenas passamos para frente, a lógica detalhada de extrair campos fica na rota
    return next();
  }

  // Verificar se os campos obrigatórios do formato antigo estão presentes
  if (consumo_watts === undefined || consumo_watts === null) {
    return res.status(400).json({
      error: "Campo 'consumo_watts' é obrigatório.",
      exemplo: { consumo_watts: 1500.5, id_aparelho: 1 },
    });
  }

  if (!id_aparelho) {
    return res.status(400).json({
      error: "Campo 'id_aparelho' é obrigatório.",
      exemplo: { consumo_watts: 1500.5, id_aparelho: 1 },
    });
  }

  // Verificar tipos
  if (typeof consumo_watts !== "number" || isNaN(consumo_watts)) {
    return res.status(400).json({
      error: "'consumo_watts' deve ser um número válido.",
    });
  }

  if (typeof id_aparelho !== "number" || !Number.isInteger(id_aparelho)) {
    return res.status(400).json({
      error: "'id_aparelho' deve ser um número inteiro.",
    });
  }

  // Verificar valores negativos
  if (consumo_watts < 0) {
    return res.status(400).json({
      error: "'consumo_watts' não pode ser negativo.",
    });
  }

  if (id_aparelho <= 0) {
    return res.status(400).json({
      error: "'id_aparelho' deve ser maior que zero.",
    });
  }

  next();
}
