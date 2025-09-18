// app.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Effets existants ---
  if (window.Rellax) new Rellax('.js-rellax', { center: true });

  if (window.TweenMax) {
    const grid = document.querySelector('.p-character__lists');
    if (grid) TweenMax.fromTo(grid, 0.6, { opacity: 0 }, { opacity: 1 });
  }

  if (window.jQuery) {
    const $ = window.jQuery;
    $('.p-character__item a').on('click', function(e){
      // e.preventDefault(); // décommente si tu veux bloquer la nav
      // console.log('Clicked:', $(this).text().trim());
    });
  }

  // --- Auth Discord (nouveau) ---
  initAuthUI();

  // (Optionnel) protéger des pages : si <body data-require-auth="true">
  protectIfRequired();
});

async function initAuthUI() {
  const elLogin  = document.getElementById('auth-login');
  const elUser   = document.getElementById('auth-user');
  const elName   = document.getElementById('auth-name');
  const elAvatar = document.getElementById('auth-avatar');

  if (!elLogin || !elUser) return; // pas de bloc auth sur cette page

  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (!r.ok) {
      // Pas connecté
      elLogin.hidden = false;
      elUser.hidden  = true;
      return;
    }
    const u = await r.json();

    // Connecté : remplis l'UI
    elName.textContent = u.username || 'Utilisateur';
    elAvatar.src = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    elLogin.hidden = true;
    elUser.hidden  = false;
  } catch (e) {
    // En cas d'erreur réseau, on affiche quand même le bouton login
    elLogin.hidden = false;
    elUser.hidden  = true;
  }
}

// (Optionnel) redirige automatiquement vers Discord si la page requiert la connexion
async function protectIfRequired() {
  const body = document.body;
  if (!body || body.getAttribute('data-require-auth') !== 'true') return;

  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (!r.ok) {
      // lance directement le flow OAuth
      window.location.href = '/api/auth/discord';
    }
  } catch {
    // si erreur, on tente aussi la connexion
    window.location.href = '/api/auth/discord';
  }
}
