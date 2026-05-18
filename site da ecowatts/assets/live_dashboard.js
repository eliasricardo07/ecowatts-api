// ============================================================
// EcoWatts Live Dashboard — Integração com API em Tempo Real
// Requer: config.js, auth.js, Chart.js, script.js carregados antes
// ============================================================

(function() {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Estado interno
  let pollTimer = null;
  let isAuthenticated = false;
  let currentUser = null;
  let chartInstancia = null; // referência ao gráfico de consumo em tempo real

  // ============================================================
  // Inicialização principal
  // ============================================================
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar autenticação
    if (window.Auth) {
      try {
        const session = await window.Auth.getSession();
        if (!session) {
          // Não autenticado — redireciona para login
          window.location.href = 'login.html';
          return;
        }
        isAuthenticated = true;
        currentUser = session.user;
        updateUserInfo(currentUser);
      } catch (e) {
        console.warn('[LiveDashboard] Falha na verificação de auth:', e.message);
        window.location.href = 'login.html';
        return;
      }
    }

    // 2. Configurar botão de logout
    setupLogoutButton();

    // 3. Carregar dados iniciais
    await Promise.allSettled([
      loadSensorNames(),
      loadDashboardResumo(),
      loadRealtimeWatts()
    ]);

    // 4. Iniciar polling a cada 5 segundos
    startPolling();

    console.log('[LiveDashboard] ✅ Dashboard ao vivo inicializado.');
  });

  // ============================================================
  // Atualiza informações do usuário logado no topbar/sidebar
  // ============================================================
  function updateUserInfo(user) {
    if (!user) return;

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    // Atualiza avatar nas configurações
    const profileAvatar = $('.profile-avatar');
    if (profileAvatar) profileAvatar.textContent = initials;

    // Atualiza nome nas configurações
    const profileName = $$('.settings-card .font-bold');
    profileName.forEach(el => {
      if (el.textContent === 'Administrador') el.textContent = displayName;
      if (el.textContent === 'admin@ecowatts.com.br') el.textContent = user.email;
    });

    // Atualiza badge no topbar (se existir um elemento de user info)
    const statusBadge = $('.status-badge');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="dot"></span> ${displayName}`;
    }
  }

  // ============================================================
  // Configura botão de Logout
  // ============================================================
  function setupLogoutButton() {
    // O link "Sair do Sistema" na sidebar aponta para index.html
    const exitLink = $('a.nav-link[href="index.html"]');
    if (exitLink) {
      exitLink.addEventListener('click', async (e) => {
        e.preventDefault();
        if (window.Auth) {
          await window.Auth.logout();
        } else {
          window.location.href = 'index.html';
        }
      });
    }
  }

  // ============================================================
  // Helper para chamadas à API
  // ============================================================
  async function fetchAPI(endpoint, options = {}) {
    try {
      const url = window.ENV.API_URL + endpoint;
      const headers = { 'Content-Type': 'application/json' };

      // Se o usuário estiver autenticado, adiciona o cabeçalho x-user-id
      if (isAuthenticated && currentUser && currentUser.id) {
        headers['x-user-id'] = currentUser.id;
      }

      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
      });

      if (!response.ok) {
        console.warn(`[API] ${endpoint} → ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn(`[API] Falha em ${endpoint}:`, error.message);
      return null;
    }
  }

  // ============================================================
  // 1. Carrega nomes dos sensores/aparelhos do banco
  // ============================================================
  async function loadSensorNames() {
    const res = await fetchAPI('/dispositivos/aparelhos/todos');
    if (!res || !res.data || res.data.length === 0) return;

    // Mapeamento: sensor 1→cozinha, 2→sala, 3→quarto, 4→escritorio
    const sensorToRoom = { 1: 'cozinha', 2: 'sala', 3: 'quarto', 4: 'escritorio' };

    res.data.forEach(aparelho => {
      const roomId = sensorToRoom[aparelho.id_aparelho];
      if (!roomId) return;

      const card = $(`.room-bento-card[data-room="${roomId}"]`);
      if (card) {
        const nameEl = card.querySelector('.room-bento-name');
        if (nameEl && aparelho.nome) {
          nameEl.textContent = aparelho.nome;
        }
      }
    });

    console.log('[LiveDashboard] Nomes dos sensores carregados do banco.');
  }

  // ============================================================
  // 2. Carrega resumo total do dashboard (kWh, R$, CO₂, Pontos)
  // ============================================================
  async function loadDashboardResumo() {
    const res = await fetchAPI('/dashboard/resumo');
    if (!res) return;

    // --- Central de Comando: KPIs principais ---
    const kpiCards = $$('.kpi-card');

    kpiCards.forEach(card => {
      const label = card.querySelector('.kpi-label');
      const value = card.querySelector('.kpi-value');
      if (!label || !value) return;

      const labelText = label.textContent.toLowerCase();

      if (labelText.includes('consumo') && labelText.includes('total')) {
        value.textContent = formatNumber(res.total_kwh, 3) + ' kWh';
      } else if (labelText.includes('fatura') || labelText.includes('previsto') || labelText.includes('gasto atual')) {
        value.textContent = 'R$ ' + formatCurrency(res.total_custo);
      } else if (labelText.includes('carbono') || labelText.includes('co₂') || labelText.includes('co2')) {
        value.textContent = formatNumber(res.total_co2, 2) + ' kg';
      }
    });

    // --- Eco Pontos ---
    const pontosEls = $$('#view-ecopoints h2');
    pontosEls.forEach(el => {
      if (el.textContent.includes('2.450') || el.textContent.includes('pts')) {
        el.textContent = (res.pontos_gamificacao || 0).toLocaleString('pt-BR');
      }
    });

    // Atualiza barra de progresso de gamificação
    const progressFills = $$('.progress-fill');
    progressFills.forEach(fill => {
      const container = fill.closest('.glass-card, .journey-step, div');
      if (container && container.textContent.includes('Próximo marco')) {
        const percent = Math.min(100, ((res.pontos_gamificacao || 0) / 4000) * 100);
        fill.style.width = percent + '%';
      }
    });

    console.log('[LiveDashboard] Resumo do dashboard atualizado:', res);
  }

  // ============================================================
  // 3. Carrega consumo em tempo real de cada sensor
  // ============================================================
  async function loadRealtimeWatts() {
    const res = await fetchAPI('/leituras/ultimas');
    if (!res || !res.data) return;

    const sensorToRoom = { 1: 'cozinha', 2: 'sala', 3: 'quarto', 4: 'escritorio' };
    let totalWatts = 0;
    let sumIndividualWatts = 0;
    let hasGeralSensor = false;
    const realtimePoints = [];

    res.data.forEach(item => {
      const leitura = item.ultima_leitura;
      if (!leitura) return;

      const watts = Number(leitura.consumo_watts) || 0;
      
      // Diferenciação inteligente: Sensor 1 é o geral (total da maquete), Sensores 2 a 4 são as saídas individuais
      if (item.id_aparelho === 1) {
        hasGeralSensor = true;
        totalWatts = watts;
      } else {
        sumIndividualWatts += watts;
      }

      realtimePoints.push(watts);

      const roomId = sensorToRoom[item.id_aparelho];
      if (!roomId) return;

      // Atualiza o card do cômodo com o consumo real
      const card = $(`.room-bento-card[data-room="${roomId}"]`);
      if (card) {
        const valEl = card.querySelector('.room-bento-value');
        if (valEl) {
          const oldValue = valEl.textContent;
          const newValue = formatWatts(watts);
          valEl.textContent = newValue;

          // Micro-animação de pulsação quando o valor muda
          if (oldValue !== newValue) {
            valEl.classList.remove('pulse-update');
            void valEl.offsetWidth; // force reflow
            valEl.classList.add('pulse-update');
          }
        }
      }

      // Se este cômodo está selecionado no painel de detalhes, atualiza-o
      updatePanelDetails(roomId, leitura);
    });

    // Se não temos leitura do Sensor 1 (Geral), usamos a soma das saídas individuais
    if (!hasGeralSensor) {
      totalWatts = sumIndividualWatts;
    }

    // Atualiza indicador de consumo total em tempo real (Central de Comando)
    updateTotalWattsDisplay(totalWatts);

    console.log(`[LiveDashboard] Polling: ${res.data.length} sensores, Total: ${totalWatts}W`);
  }

  // ============================================================
  // Atualiza o display principal de Watts em tempo real
  // ============================================================
  function updateTotalWattsDisplay(totalWatts) {
    // Procura pelo card de "Consumo Agora" ou "Tempo Real" na Central de Comando
    const kpiCards = $$('.kpi-card');
    kpiCards.forEach(card => {
      const label = card.querySelector('.kpi-label');
      const value = card.querySelector('.kpi-value');
      if (!label || !value) return;

      const labelText = label.textContent.toLowerCase();
      if (labelText.includes('agora') || labelText.includes('tempo real') || labelText.includes('instantâneo')) {
        value.textContent = totalWatts.toLocaleString('pt-BR') + ' W';
      }
    });
  }

  // ============================================================
  // Atualiza painel de detalhes quando o cômodo selecionado recebe dados
  // ============================================================
  function updatePanelDetails(roomId, leitura) {
    const panelName = $('#panelRoomName');
    if (!panelName) return;

    // Verifica se o painel está mostrando este cômodo
    const panelText = panelName.textContent.toLowerCase();
    const roomNames = {
      'cozinha': 'cozinha',
      'sala': 'sala',
      'quarto': 'quarto',
      'escritorio': 'escritório'
    };

    const roomLabel = roomNames[roomId];
    if (!roomLabel || !panelText.includes(roomLabel)) return;

    // Atualiza métricas do painel lateral
    const rows = $$('.panel-content .d-flex.justify-between.text-xs span:last-child');
    if (rows.length >= 4) {
      if (leitura.custo_estimado !== undefined) {
        rows[0].textContent = 'R$ ' + formatCurrency(leitura.custo_estimado);
      }
      if (leitura.co2_emitido !== undefined) {
        rows[1].textContent = formatNumber(leitura.co2_emitido, 4) + ' kg CO₂';
      }
    }
  }

  // ============================================================
  // Polling — Atualiza dados a cada N segundos
  // ============================================================
  function startPolling() {
    const interval = window.ENV?.POLL_INTERVAL || 5000;

    pollTimer = setInterval(async () => {
      await Promise.allSettled([
        loadRealtimeWatts(),
        loadDashboardResumo()
      ]);
    }, interval);

    console.log(`[LiveDashboard] Polling iniciado a cada ${interval / 1000}s.`);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
      console.log('[LiveDashboard] Polling parado.');
    }
  }

  // Pausa o polling quando a aba não está visível (economia de recursos)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopPolling();
    } else {
      // Atualiza imediatamente ao voltar e reinicia o polling
      loadRealtimeWatts();
      loadDashboardResumo();
      startPolling();
    }
  });

  // ============================================================
  // Utilitários de formatação
  // ============================================================
  function formatWatts(w) {
    return (Number(w) || 0).toLocaleString('pt-BR') + ' W';
  }

  function formatNumber(n, decimals = 2) {
    return (Number(n) || 0).toFixed(decimals).replace('.', ',');
  }

  function formatCurrency(value) {
    return (Number(value) || 0).toFixed(2).replace('.', ',');
  }

})();
