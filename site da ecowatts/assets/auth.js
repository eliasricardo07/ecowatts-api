// ============================================================
// EcoWatts Auth Module — Supabase Authentication
// Requer: supabase-js CDN + assets/config.js carregados antes
// ============================================================

(function() {
  'use strict';

  // Aguarda as dependências carregarem
  if (!window.ENV || !window.supabase) {
    console.error('[Auth] Dependências não carregadas. Verifique config.js e supabase CDN.');
    return;
  }

  const supabaseClient = window.supabase.createClient(
    window.ENV.SUPABASE_URL,
    window.ENV.SUPABASE_KEY
  );

  // Resolve caminhos relativos baseado na localização do arquivo atual
  function resolvePath(page) {
    const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
    return basePath + page;
  }

  window.Auth = {
    supabase: supabaseClient,

    /**
     * Login com email e senha
     */
    async login(email, password) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      return data;
    },

    /**
     * Cadastro de novo usuário
     */
    async register(email, password, name) {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name || 'Usuário EcoWatts' }
        }
      });
      if (error) throw error;
      return data;
    },

    /**
     * Recuperação de senha via email
     */
    async resetPassword(email) {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: window.location.origin + '/login.html?reset=true' }
      );
      if (error) throw error;
      return data;
    },

    /**
     * Logout e redireciona para a landing page
     */
    async logout() {
      await supabaseClient.auth.signOut();
      window.location.href = 'index.html';
    },

    /**
     * Retorna a sessão ativa ou null
     */
    async getSession() {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.error('[Auth] Erro ao obter sessão:', error.message);
        return null;
      }
      return data.session;
    },

    /**
     * Retorna os dados do usuário logado ou null
     */
    async getUser() {
      const session = await this.getSession();
      return session?.user || null;
    },

    /**
     * Guard: redireciona para login se não estiver autenticado.
     * Retorna a sessão se autenticado.
     */
    async requireAuth() {
      const session = await this.getSession();
      if (!session) {
        window.location.href = 'login.html';
        // Lança um erro para interromper a execução do chamador
        throw new Error('Não autenticado — redirecionando para login.');
      }
      return session;
    },

    /**
     * Escuta mudanças de estado de autenticação
     */
    onAuthStateChange(callback) {
      return supabaseClient.auth.onAuthStateChange(callback);
    }
  };

  console.log('[Auth] Módulo de autenticação carregado.');
})();
