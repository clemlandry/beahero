// app.js
document.addEventListener('DOMContentLoaded', () => {
  // Parallaxe si Rellax dispo
  if (window.Rellax) new Rellax('.js-rellax', { center: true });

  // Petite anim d’arrivée si GSAP dispo
  if (window.TweenMax) {
    const grid = document.querySelector('.p-character__lists');
    if (grid) TweenMax.fromTo(grid, 0.6, { opacity: 0 }, { opacity: 1 });
  }

  // Interactions jQuery si besoin
  if (window.jQuery) {
    const $ = window.jQuery;
    $('.p-character__item a').on('click', function(e){
      // e.preventDefault(); // décommente si tu veux bloquer la nav
      // console.log('Clicked:', $(this).text().trim());
    });
  }
});
