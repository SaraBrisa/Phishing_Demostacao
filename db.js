const SUPABASE_URL = "https://nmlokardsmqtxuezcnjw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbG9rYXJkc21xdHh1ZXpjbmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDI1OTQsImV4cCI6MjA5NTk3ODU5NH0.KFPvLWNcYuCV9WBdag87l1ecf0TTMXqzSTxHupZOlug";  

const { createClient } = supabase;
let _client;

try {
  _client = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error("Supabase não iniciou:", e);
}

const DB = {
  // Cache local usado pelo painel de resultados
  tentativas: [],

  async buscarPorEmail(email) {
    const { data } = await _client
      .from("usuarios")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    return data || null;
  },

  async autenticar(email, senha) {
    const u = await this.buscarPorEmail(email);
    return u && u.senha === senha ? u : null;
  },

async registrarTentativa({ email, senha, sucesso }) {
  const registro = { email, senha, sucesso, timestamp: new Date().toISOString() };
  this.tentativas.push(registro);
  if (_client) await _client.from("tentativas").insert(registro);
},

  // Busca tentativas diretamente do banco (usado em abrirPainel)
  async buscarTentativas() {
    const { data } = await _client
      .from("tentativas")
      .select("*")
      .order("timestamp", { ascending: false });
    return data || [];
  },
};