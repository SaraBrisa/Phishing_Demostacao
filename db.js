// ============================================================
//  db.js — Banco de dados em memória
//  Funciona tanto em file:// quanto em servidor HTTP.
// ============================================================

const DB = {
 ///
  // ── Usuários cadastrados ──────────────────────────────────
  _usuarios_padrao: [
    { id: 1, nome: "Sara B. Mariano",  email: "sarabgmariano24@gmail.com", senha: "senha123"  },
    { id: 2, nome: "João Silva",        email: "joao.silva@gmail.com",       senha: "joao2024"  },
    { id: 3, nome: "Maria Souza",       email: "maria.souza@gmail.com",      senha: "maria@pass"},
  ],
  _usuarios_mem: null,

  get usuarios() {
    if (!this._usuarios_mem)
      this._usuarios_mem = JSON.parse(JSON.stringify(this._usuarios_padrao));
    return this._usuarios_mem;
  },

  _salvarUsuarios(lista) {
    this._usuarios_mem = lista;
  },

  buscarPorEmail(email) {
    return this.usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    ) || null;
  },

  autenticar(email, senha) {
    const u = this.buscarPorEmail(email);
    return (u && u.senha === senha) ? u : null;
  },

  cadastrar(nome, email, senha) {
    if (this.buscarPorEmail(email))
      return { sucesso: false, mensagem: "E-mail já cadastrado." };
    const lista = this.usuarios;
    const novo  = { id: lista.length + 1, nome, email, senha };
    lista.push(novo);
    this._salvarUsuarios(lista);
    return { sucesso: true, usuario: novo };
  },

  // ── Registro de tentativas (dados inseridos) ──────────────
  //  Salva TUDO que o usuário digitar, cadastrado ou não.

  _tentativas_mem: [],

  get tentativas() {
    return this._tentativas_mem;
  },

  registrarTentativa(dados) {
    // dados = { email, senha, sucesso, timestamp }
    this._tentativas_mem.push({
      id:        this._tentativas_mem.length + 1,
      email:     dados.email     || "",
      senha:     dados.senha     || "",   // armazena como texto puro (banco improvisado)
      sucesso:   dados.sucesso   ?? false,
      timestamp: dados.timestamp || new Date().toISOString(),
    });
  },

  // ── Utilitários ───────────────────────────────────────────

  // Retorna todos os dados salvos (para debug / painel)
  verTudo() {
    return {
      usuarios:   this.usuarios,
      tentativas: this.tentativas,
    };
  },

  // Limpa tentativas e reinicia usuários
  resetar() {
    this._usuarios_mem   = null;
    this._tentativas_mem = [];
    console.log("Banco resetado.");
  },
};
