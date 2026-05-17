// ============================================================
// Configuração Global do Frontend EcoWatts
// ============================================================

// Detecta automaticamente se está em localhost ou produção
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

window.ENV = {
  SUPABASE_URL: "https://jehlbdvzjtwvtsmbbkyy.supabase.co",
  SUPABASE_KEY: "sb_publishable_c4ExV7PEQ7V0J-wpWS2RJw_vhvMreGa",
  // API_URL aponta para a mesma origem (o Express serve tudo)
  API_URL: window.location.origin + "/api",
  // Intervalo de polling em milissegundos (5 segundos)
  POLL_INTERVAL: 5000
};
