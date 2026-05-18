// ============================================================
// Configuração Global do Frontend EcoWatts
// ============================================================

// Detecta automaticamente se está em localhost ou produção
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

window.ENV = {
  SUPABASE_URL: "https://jehlbdvzjtwvtsmbbkyy.supabase.co",
  SUPABASE_KEY: "sb_publishable_c4ExV7PEQ7V0J-wpWS2RJw_vhvMreGa",
  // Se for local usa localhost, senão aponta para a URL dedicada da API no Render
  API_URL: isLocal ? "http://localhost:3000/api" : "https://ecowatts-api.onrender.com/api",
  // Intervalo de polling em milissegundos (5 segundos)
  POLL_INTERVAL: 5000
};
