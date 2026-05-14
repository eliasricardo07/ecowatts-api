// ============================================================
// Módulo de Regras de Negócio — EcoWatts
// ============================================================

// Constantes do projeto (confirmadas pelo usuário)
export const TARIFA_KWH = 0.835;      // R$/kWh
export const FATOR_CO2 = 0.03;        // kgCO₂/kWh
export const INTERVALO_ENVIO_SEG = 5; // Intervalo de envio do ESP32 (segundos)

/**
 * Converte potência instantânea (W) em energia consumida (kWh)
 * Fórmula: P(kW) * t(h) = E(kWh)
 */
export function calcularKwh(watts, intervaloSeg = INTERVALO_ENVIO_SEG) {
  return (watts / 1000) * (intervaloSeg / 3600);
}

/**
 * Calcula custo estimado em R$ com base no kWh consumido
 */
export function calcularCusto(kwh, tarifa = TARIFA_KWH) {
  return kwh * tarifa;
}

/**
 * Calcula emissão de CO₂ em kg com base no kWh consumido
 */
export function calcularCO2(kwh, fator = FATOR_CO2) {
  return kwh * fator;
}

/**
 * Processa uma leitura bruta do ESP32 e retorna todos os campos derivados
 * @param {number} consumoWatts - Potência lida pelo sensor (W)
 * @returns {{ consumo_kwh, custo_estimado, co2_emitido }}
 */
export function processarLeitura(consumoWatts) {
  const consumo_kwh = calcularKwh(consumoWatts);
  const custo_estimado = calcularCusto(consumo_kwh);
  const co2_emitido = calcularCO2(consumo_kwh);

  return {
    consumo_kwh: parseFloat(consumo_kwh.toFixed(8)),
    custo_estimado: parseFloat(custo_estimado.toFixed(8)),
    co2_emitido: parseFloat(co2_emitido.toFixed(8)),
  };
}
