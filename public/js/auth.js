// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});

async function initAuthUI() {
  const elLogin  = document.getElementById('auth-login');
  const elUser   = document.getElementById('auth-user');
  const elName   = document.getElementById('auth-name');
  const elAvatar = document.getElementById('auth-avatar');

  if (!elLogin || !elUser) return;

  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (!r.ok) {
      elLogin.hidden = false;
      elUser.hidden  = true;
      return;
    }
    const u = await r.json();
    elName.textContent = u.username || 'Utilisateur';
    elAvatar.src = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';
    elAvatar.width = 28;
    elAvatar.height = 28;

    elLogin.hidden = true;
    elUser.hidden  = false;
  } catch {
    elLogin.hidden = false;
    elUser.hidden  = true;
  }
}
