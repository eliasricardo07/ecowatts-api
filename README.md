# 🔋 EcoWatts API

API REST de monitoramento inteligente de energia elétrica baseada em IoT. Recebe dados brutos de sensores ESP32 via Wi-Fi, aplica regras de negócio (cálculos de energia, custo e impacto ambiental) e armazena tudo no Supabase (PostgreSQL) para alimentar dashboards e gamificação.

---

## Arquitetura do Sistema

```
┌─────────────┐     Wi-Fi / HTTP POST      ┌──────────────────┐      Supabase SDK       ┌──────────────┐
│   ESP32      │ ─────────────────────────► │   API EcoWatts   │ ─────────────────────► │   Supabase    │
│  + SCT-013   │   { consumo_watts,         │  (Node.js)       │   INSERT/SELECT         │  (PostgreSQL) │
│  (Sensor)    │     id_aparelho }          │  Render.com      │                         │  7 tabelas    │
└─────────────┘                             └──────────────────┘                         └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────────┐
                                            │  Frontend / App  │
                                            │  (consome a API) │
                                            └──────────────────┘
```

---

## Tecnologias

- **Node.js** + **Express 5**
- **Supabase** (PostgreSQL gerenciado)
- **ESP32** (SCT-013) enviando dados a cada 5 segundos
- **Render.com** (deploy gratuito com CI/CD automático)

---

## Estrutura do Projeto

```
📂 ecowatts-api/
├── server.js                          # Ponto de entrada — monta Express, middlewares e rotas
├── package.json                       # Dependências do projeto
├── render.yaml                        # Configuração de deploy automático no Render
├── .env                               # Variáveis secretas (NÃO vai pro Git)
├── .env.example                       # Template do .env para outros devs
├── .gitignore                         # Ignora node_modules e .env
└── 📂 src/
    ├── 📂 config/
    │   └── supabase.js                # Cliente Supabase isolado como módulo reutilizável
    ├── 📂 services/
    │   └── calculosEnergia.js         # Regras de negócio: Watts → kWh → R$ → CO₂
    ├── 📂 middlewares/
    │   ├── validateLeitura.js         # Validação do payload do ESP32
    │   └── rateLimiter.js             # Proteção contra flood (200 req/min global, 60/min escrita)
    ├── 📂 routes/
    │   ├── leituras.js                # CRUD de leituras + gamificação automática
    │   ├── dispositivos.js            # Listagem de dispositivos e aparelhos
    │   └── dashboard.js               # Resumos acumulados e histórico para gráficos
    └── 📂 utils/
        └── logger.js                  # Logger com timestamp e ícones coloridos
```

---

## Banco de Dados Supabase (7 tabelas)

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Cadastro de usuários (residencial/empresarial) |
| `unidades` | Locais monitorados, vinculados a um usuário |
| `dispositivos` | Placas ESP32 físicas, vinculadas a uma unidade |
| `aparelhos` | Aparelhos elétricos específicos (ex: "Ar-condicionado"), vinculados a um dispositivo |
| `leituras` | **Tabela principal** — cada leitura do sensor fica aqui (watts, kWh, R$, CO₂) |
| `relatorios` | Relatórios consolidados por período/unidade |
| `pontuacoes` | **Gamificação** — pontos diários por usuário |

### Hierarquia de Relacionamentos

```
usuario → unidade → dispositivo → aparelho → leitura
    └──────────────────────────────────────► pontuacao
```

---

## Endpoints da API

### 🟢 Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Retorna status "online", versão e lista de endpoints disponíveis |

### 📡 Leituras (dados do ESP32)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/leituras` | **Rota principal** — recebe `consumo_watts` e `id_aparelho` do ESP32, calcula kWh/R$/CO₂, salva na tabela `leituras` e atualiza pontos na tabela `pontuacoes` |
| `GET` | `/api/leituras` | Lista leituras com filtros (`?id_aparelho=1&limit=50&offset=0`) e paginação |
| `GET` | `/api/leituras/ultimas` | Última leitura de cada aparelho cadastrado |

### 🔌 Dispositivos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dispositivos` | Lista todos os dispositivos ESP32 com seus aparelhos vinculados |
| `GET` | `/api/dispositivos/:id` | Detalhes de um dispositivo específico |

### 📊 Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dashboard/resumo` | Totais acumulados (kWh, R$, CO₂, pontos). Filtros: `?periodo=hoje\|semana\|mes` e `?id_aparelho=1` |
| `GET` | `/api/dashboard/historico` | Série temporal de leituras para gráficos. Obrigatório: `?id_aparelho=1` |

---

## Payload do ESP32

O ESP32 deve enviar uma requisição **POST** para `/api/leituras` com o seguinte corpo JSON:

```json
{
  "consumo_watts": 1500.5,
  "id_aparelho": 1
}
```

### Resposta de Sucesso (201)

```json
{
  "message": "Leitura registrada e pontuação atualizada com sucesso",
  "data": {
    "id_leitura": 1,
    "consumo_watts": 1500.5,
    "consumo_kwh": 0.00208403,
    "custo_estimado": 0.00174016,
    "co2_emitido": 0.00006252,
    "id_aparelho": 1,
    "data_hora": "2026-05-14T22:41:43.123Z"
  }
}
```

---

## Regras de Negócio (Cálculos)

Quando o ESP32 envia uma leitura, a API aplica as seguintes fórmulas:

| Passo | Fórmula | Exemplo (1500W, 5s) |
|-------|---------|---------------------|
| **Watts → kWh** | `(watts / 1000) × (5 / 3600)` | `1.5 × 0.00139 = 0.00208 kWh` |
| **kWh → R$** | `kWh × R$ 0,835` | `0.00208 × 0.835 = R$ 0,00174` |
| **kWh → CO₂** | `kWh × 0,03 kgCO₂/kWh` | `0.00208 × 0.03 = 0,0000625 kg` |

**Constantes configuráveis** (em `src/services/calculosEnergia.js`):
- `TARIFA_KWH = 0.835` — Tarifa em R$/kWh
- `FATOR_CO2 = 0.03` — Fator de emissão em kgCO₂/kWh
- `INTERVALO_ENVIO_SEG = 5` — Intervalo de envio do ESP32 em segundos

---

## Gamificação

A cada leitura recebida, a API automaticamente:

1. **Descobre o usuário:** Sobe a hierarquia `aparelho → dispositivo → unidade → usuário` via consultas no Supabase.
2. **Verifica a data:** Checa se já existe um registro de pontuação para aquele usuário no dia de hoje.
3. **Atualiza ou cria:**
   - Se já existe → **soma** 5 pontos ao registro existente.
   - Se não existe → **cria** um novo registro com 5 pontos.
4. **Isolamento:** A gamificação roda em um `try-catch` separado — se falhar, a leitura já foi salva normalmente.

---

## Instalação Local

```bash
# 1. Clonar o repositório
git clone https://github.com/eliasricardo07/ecowatts-api.git
cd ecowatts-api

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# 4. Iniciar o servidor
node server.js
# 🔋 API EcoWatts rodando na porta 3000
```

---

## Deploy (Render.com)

| Item | Valor |
|------|-------|
| Plataforma | **Render.com** (plano gratuito) |
| URL Pública | `https://ecowatts-api.onrender.com` |
| Deploy Automático | Sim — conectado ao GitHub via `render.yaml` |
| Variáveis de Ambiente | `SUPABASE_URL` e `SUPABASE_KEY` configuradas no painel do Render |

O deploy é feito automaticamente a cada `git push` na branch `main`.

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxxx.supabase.co`) |
| `SUPABASE_KEY` | Chave anon/pública do Supabase |
| `PORT` | Porta do servidor (padrão: 3000) |

---

## Licença

ISC
