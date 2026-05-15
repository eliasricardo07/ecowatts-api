/*
 * ============================================================
 *  EcoWatts — Código do ESP32
 *  Lê o sensor de corrente SCT-013 e envia dados via Wi-Fi
 *  para a API EcoWatts hospedada no Render.
 * ============================================================
 *
 *  Hardware necessário:
 *    - ESP32 DevKit
 *    - Sensor de corrente SCT-013 (30A)
 *    - Resistor de carga 33Ω (burden resistor)
 *    - 2x Resistores 10kΩ (divisor de tensão p/ offset)
 *    - Capacitor 10µF (filtro)
 *
 *  Bibliotecas necessárias (instalar via Arduino IDE):
 *    - WiFiManager (by tzapu)
 *    - HTTPClient (já vem com ESP32)
 *    - ArduinoJson (by Benoît Blanchon)
 * ============================================================
 */

#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ============================================================
// CONFIGURAÇÕES — Altere conforme seu setup
// ============================================================

// URL da API no Render (ou localhost para testes)
const char* API_URL = "https://ecowatts-api.onrender.com/api/leituras";

// ID do aparelho cadastrado no Supabase
// (verifique no banco qual é o id_aparelho do seu equipamento)
const int ID_APARELHO = 1;

// Pino analógico onde o SCT-013 está conectado
const int PINO_SENSOR = 34;

// Intervalo de envio em milissegundos (5 segundos)
const unsigned long INTERVALO_ENVIO_MS = 5000;

// Calibração do sensor SCT-013-030 (30A/1V)
// Ajuste este valor conforme seu sensor e resistor de carga
const float FATOR_CALIBRACAO = 30.0;

// Tensão da rede elétrica (V)
const float TENSAO_REDE = 127.0;

// Número de amostras para calcular a corrente RMS
const int NUM_AMOSTRAS = 1000;

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
unsigned long ultimoEnvio = 0;

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n🔋 EcoWatts — Iniciando...");

  // Configurar pino do sensor como entrada
  analogReadResolution(12); // ESP32: 12 bits (0-4095)
  pinMode(PINO_SENSOR, INPUT);

  // Conectar ao Wi-Fi usando WiFiManager
  // Na primeira vez, o ESP32 cria uma rede "EcoWatts-Setup"
  // Conecte nessa rede pelo celular e configure o Wi-Fi
  WiFiManager wm;
  wm.setConfigPortalTimeout(180); // 3 minutos para configurar

  bool conectado = wm.autoConnect("EcoWatts-Setup", "ecowatts123");

  if (!conectado) {
    Serial.println("❌ Falha na conexão Wi-Fi. Reiniciando...");
    ESP.restart();
  }

  Serial.println("✅ Wi-Fi conectado!");
  Serial.print("   IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("   API: ");
  Serial.println(API_URL);
  Serial.println("📡 Iniciando leituras a cada 5 segundos...\n");
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================
void loop() {
  unsigned long agora = millis();

  // Envia a cada 5 segundos
  if (agora - ultimoEnvio >= INTERVALO_ENVIO_MS) {
    ultimoEnvio = agora;

    // 1. Ler a corrente RMS do sensor
    float correnteRMS = lerCorrenteRMS();

    // 2. Calcular potência (W) = Tensão × Corrente
    float potenciaWatts = TENSAO_REDE * correnteRMS;

    // Ignorar leituras muito baixas (ruído do sensor)
    if (potenciaWatts < 5.0) {
      potenciaWatts = 0.0;
    }

    Serial.printf("⚡ Leitura: %.1f W (%.2f A)\n", potenciaWatts, correnteRMS);

    // 3. Enviar para a API
    if (WiFi.status() == WL_CONNECTED) {
      enviarLeitura(potenciaWatts);
    } else {
      Serial.println("⚠️  Wi-Fi desconectado. Tentando reconectar...");
      WiFi.reconnect();
    }
  }
}

// ============================================================
// LER CORRENTE RMS DO SENSOR SCT-013
// ============================================================
float lerCorrenteRMS() {
  long somaQuadrados = 0;
  int offsetADC = 2048; // Ponto médio do ADC 12-bit (3.3V / 2)

  for (int i = 0; i < NUM_AMOSTRAS; i++) {
    int leituraADC = analogRead(PINO_SENSOR);
    int valorCentralizado = leituraADC - offsetADC;
    somaQuadrados += (long)valorCentralizado * valorCentralizado;
    delayMicroseconds(100); // ~10kHz de amostragem
  }

  float mediaQuadrados = (float)somaQuadrados / NUM_AMOSTRAS;
  float rmsADC = sqrt(mediaQuadrados);

  // Converter ADC para corrente real
  // ADC 12-bit: 0-4095 = 0-3.3V
  // SCT-013-030: 30A produz 1V no burden resistor
  float tensaoRMS = (rmsADC / 4095.0) * 3.3;
  float correnteRMS = tensaoRMS * FATOR_CALIBRACAO;

  return correnteRMS;
}

// ============================================================
// ENVIAR LEITURA PARA A API ECOWATTS
// ============================================================
void enviarLeitura(float consumoWatts) {
  HTTPClient http;

  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10s timeout (Render pode ter cold start)

  // Montar o JSON
  JsonDocument doc;
  doc["consumo_watts"] = round(consumoWatts * 100.0) / 100.0; // 2 casas decimais
  doc["id_aparelho"] = ID_APARELHO;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.printf("📤 Enviando: %s\n", jsonPayload.c_str());

  // Fazer o POST
  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    String resposta = http.getString();

    if (httpCode == 201) {
      Serial.println("✅ Leitura salva com sucesso!");
    } else {
      Serial.printf("⚠️  Resposta inesperada (%d): %s\n", httpCode, resposta.c_str());
    }
  } else {
    Serial.printf("❌ Erro na requisição: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
