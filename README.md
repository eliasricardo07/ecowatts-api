# 🔋 EcoWatts API

> API de monitoramento inteligente de energia elétrica baseada em IoT, que recebe dados de sensores ESP32 em tempo real e transforma potência bruta em insights de consumo, custo financeiro e impacto ambiental.

---

## 📋 Sobre o Projeto

O **EcoWatts** é uma solução de monitoramento de energia elétrica que utiliza hardware IoT (ESP32 + sensor de corrente SCT-013) para medir o consumo elétrico de aparelhos em tempo real. 

O sensor lê a potência instantânea (em Watts) a cada 5 segundos e envia os dados via Wi-Fi para esta API, que processa as informações aplicando as regras de negócio e persiste tudo no banco de dados Supabase.

### O problema que resolve

- 💡 O usuário não sabe **quanto gasta** de energia por aparelho
- 💰 A conta de luz chega no final do mês **sem detalhamento**
- 🌍 Não existe visibilidade do **impacto ambiental** do consumo individual

### A solução

O EcoWatts transforma uma leitura simples de potência (ex: `1500W`) em:
- **Energia consumida** (kWh) — quanto foi gasto de fato
- **Custo estimado** (R$) — quanto isso custou no bolso
- **Emissão de CO₂** (kg) — quanto isso impactou o meio ambiente

---

## 🧮 Regras de Negócio

### Constantes do Sistema

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `TARIFA_KWH` | R$ 0,835 | Tarifa por kWh da concessionária |
| `FATOR_CO2` | 0,03 kgCO₂/kWh | Fator de emissão da matriz energética brasileira |
| `INTERVALO_ENVIO` | 5 segundos | Frequência de envio do ESP32 |

### Fórmulas de Cálculo

#### 1. Conversão Watts → kWh (Energia)
```
kWh = (potência_watts / 1000) × (intervalo_segundos / 3600)
```
- Divide por 1000 para converter W → kW
- Divide o intervalo por 3600 para converter segundos → horas
- **Exemplo:** 1500W por 5s = `(1500/1000) × (5/3600) = 0,00208 kWh`

#### 2. Cálculo de Custo (R$)
```
custo = kWh × tarifa_por_kwh
```
- Multiplica a energia consumida pela tarifa vigente
- **Exemplo:** 0,00208 kWh × R$ 0,835 = `R$ 0,00174`

#### 3. Cálculo de Emissão de CO₂ (kg)
```
co2 = kWh × fator_emissão
```
- Cada kWh gerado no Brasil emite aproximadamente 0,03 kg de CO₂
- **Exemplo:** 0,00208 kWh × 0,03 = `0,0000625 kgCO₂`

### Fluxo Completo

```
ESP32 (sensor SCT-013)
    │
    │  Wi-Fi - POST a cada 5s
    │  { consumo_watts: 1500, id_aparelho: 1 }
    ▼
API EcoWatts (Node.js/Express)
    │
    ├─ Validação (campos obrigatórios, tipos, valores)
    ├─ Cálculo kWh  = 0.00208333
    ├─ Cálculo R$   = 0.00173958
    ├─ Cálculo CO₂  = 0.00006250
    │
    ▼
Supabase (PostgreSQL)
    │
    └─ Tabela "leituras" ← dados persistidos com timestamp
```

---

## 🗄️ Estrutura do Banco de Dados

O banco no Supabase possui 7 tabelas com a seguinte hierarquia:

```
Usuário → Unidade → Dispositivo (ESP32) → Aparelho → Leitura
                                                   → Pontuação
                                                   → Relatório
```

### Tabelas Principais

| Tabela | Descrição | Campos-chave |
|--------|-----------|--------------|
| `usuarios` | Cadastro de usuários | id_usuario, nome, email, senha, tipo |
| `unidades` | Locais monitorados (casa, empresa) | id_unidade, nome, tipo, id_usuario (FK) |
| `dispositivos` | Hardware ESP32 instalado | id_dispositivo, nome, localizacao, id_unidade (FK) |
| `aparelhos` | Equipamentos monitorados | id_aparelho, nome, potencia_media, id_dispositivo (FK) |
| `leituras` | Medições do sensor | consumo_watts, consumo_kwh, custo_estimado, co2_emitido, data_hora, id_aparelho (FK) |
| `pontuacoes` | Gamificação | id_pontuacao, pontos, tipo, id_usuario (FK) |
| `relatorios` | Relatórios gerados | id_relatorio, tipo, periodo_inicio, periodo_fim, id_unidade (FK) |

---

## 🛠️ Stack Utilizada

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Node.js** | 18+ | Runtime JavaScript no servidor |
| **Express** | 5.x | Framework web para rotas e middlewares |
| **Supabase** | SDK 2.x | BaaS com PostgreSQL gerenciado |
| **dotenv** | 17.x | Gerenciamento de variáveis de ambiente |
| **cors** | 2.x | Permitir requisições cross-origin |
| **express-rate-limit** | 8.x | Proteção contra flood de requisições |
| **ESP32** | — | Microcontrolador IoT com Wi-Fi |
| **SCT-013** | — | Sensor de corrente não-invasivo |

---

## 📂 Estrutura do Projeto

```
Projeto inovatech/
├── server.js                          # Ponto de entrada — monta middlewares e rotas
├── src/
│   ├── config/
│   │   └── supabase.js                # Cliente Supabase isolado
│   ├── services/
│   │   └── calculosEnergia.js         # Regras de negócio (kWh, R$, CO₂)
│   ├── middlewares/
│   │   ├── validateLeitura.js         # Validação de payload do ESP32
│   │   └── rateLimiter.js             # Rate limiting (200/min geral, 60/min escrita)
│   ├── routes/
│   │   ├── leituras.js                # POST + GET leituras
│   │   ├── dispositivos.js            # GET dispositivos e aparelhos
│   │   └── dashboard.js               # Resumos e histórico para gráficos
│   └── utils/
│       └── logger.js                  # Logger com timestamp e níveis
├── .env                               # Variáveis de ambiente (não commitado)
├── .env.example                       # Template de variáveis
├── render.yaml                        # Configuração de deploy no Render
├── package.json                       # Dependências e scripts
└── README.md                          # Esta documentação
```

---

## 🔌 Endpoints da API

### Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Status da API + lista de endpoints disponíveis |

### Leituras (ESP32 → Banco)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/leituras` | Recebe dados do ESP32 e insere no banco |
| `GET` | `/api/leituras` | Lista leituras com filtros e paginação |
| `GET` | `/api/leituras/ultimas` | Última leitura de cada aparelho |

**Payload do POST (o que o ESP32 envia):**
```json
{
  "consumo_watts": 1500.5,
  "id_aparelho": 1
}
```

**Resposta:**
```json
{
  "message": "Leitura registrada com sucesso",
  "data": {
    "id_leitura": 8,
    "consumo_watts": 1500.5,
    "consumo_kwh": 0.00208333,
    "custo_estimado": 0.00173958,
    "co2_emitido": 0.0000625,
    "data_hora": "2026-05-14T22:41:47",
    "id_aparelho": 1
  }
}
```

### Dispositivos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dispositivos` | Lista dispositivos ESP32 com aparelhos vinculados |
| `GET` | `/api/dispositivos/:id` | Detalhes de um dispositivo específico |
| `GET` | `/api/dispositivos/aparelhos/todos` | Lista todos os aparelhos cadastrados |

### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dashboard/resumo` | Totais acumulados: kWh, R$, CO₂ |
| `GET` | `/api/dashboard/resumo?periodo=hoje` | Filtro por período (hoje, semana, mes) |
| `GET` | `/api/dashboard/historico?id_aparelho=1` | Série temporal para gráficos |

---

## 🔒 Validações e Segurança

### Validação de Payload
- `consumo_watts`: obrigatório, numérico, ≥ 0
- `id_aparelho`: obrigatório, inteiro, > 0
- Retorna HTTP 400 com mensagem descritiva se inválido

### Rate Limiting
- **Geral:** 200 requisições/minuto por IP
- **Escrita (POST):** 60 requisições/minuto por IP
- Proteção contra flood acidental do ESP32

---

## 🔧 Processo de Desenvolvimento

### Fase 1 — Levantamento de Requisitos
- Consulta ao caderno do projeto no **NotebookLM** via MCP Server para extrair regras de negócio, estrutura do banco e especificações do hardware
- Definição dos parâmetros: intervalo de 5s, tarifa R$ 0,835, fator CO₂ 0,03

### Fase 2 — Descoberta do Banco
- Conexão direta ao Supabase via API REST para mapear as 7 tabelas existentes
- Identificação da hierarquia: Usuário → Unidade → Dispositivo → Aparelho → Leitura

### Fase 3 — Arquitetura
- Design modular com separação de responsabilidades (config, services, middlewares, routes, utils)
- Plano de implementação documentado e aprovado

### Fase 4 — Implementação
- Criação do serviço de cálculos com as fórmulas corretas
- Middlewares de validação e rate limiting
- 3 módulos de rotas (leituras, dispositivos, dashboard)
- Refatoração do server.js para usar rotas modulares

### Fase 5 — Testes
- Todos os 7 endpoints testados localmente com sucesso
- Leitura real inserida no banco Supabase (id_leitura: 8)
- Validação dos cálculos kWh/R$/CO₂

### Fase 6 — Preparação para Deploy
- Configuração do `render.yaml` para deploy automático no Render
- Documentação completa no README

---

## 🚀 Como Rodar Localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/ecowatts-api.git
cd ecowatts-api

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# 4. Iniciar o servidor
npm start
```

O servidor inicia na porta 3000: `http://localhost:3000`

---

## ☁️ Deploy no Render

1. Suba o código para o GitHub
2. Acesse [render.com](https://render.com) → **New +** → **Web Service**
3. Conecte o repositório GitHub
4. O Render detecta o `render.yaml` automaticamente
5. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
6. Clique em **Create Web Service**

> **Nota:** No plano grátis, o servidor dorme após 15min sem uso. O ESP32 enviando a cada 5s mantém ele acordado.

---

## 👤 Autor

**Elias Ricardo** — Projeto InovaTech

---

## 📄 Licença

ISC
