/* =====================================================================
   cro_slayy_holic — motion layer
   Buttery smooth-scroll (Lenis), staggered hero intro (anime.js),
   scroll parallax on the big "slay", smooth anchor jumps.
   Degrades gracefully: no libs / reduced-motion => plain, still usable.
   ===================================================================== */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-anim');

  /* ---- smooth scrolling ---- */
  var lenis = null;
  if (!reduced && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }

  /* ---- smooth anchor links ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -8, duration: 1.1 });
    else el.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---- hero intro (staggered) — can never leave the hero hidden ---- */
  function showAll(els) { els.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; }); }
  function heroIntro() {
    var els = ['.hero .eyebrow', '.hero h1', '.hero .lede', '.hero .hero-cta', '.hero .cue']
      .map(function (s) { return document.querySelector(s); }).filter(Boolean);
    // SAFETY: guarantee everything is visible shortly no matter what
    setTimeout(function () { showAll(els); }, 1600);
    if (reduced || typeof anime === 'undefined') { showAll(els); return; }
    try {
      anime.set(els, { opacity: 0, translateY: 40 });
      anime({
        targets: els, opacity: [0, 1], translateY: [40, 0],
        duration: 1100, delay: anime.stagger(120, { start: 180 }), easing: 'easeOutExpo'
      });
      var mark = document.querySelector('.hero .mark');
      if (mark) anime({ targets: mark, opacity: [0, 1], scale: [1.14, 1], duration: 1700, easing: 'easeOutExpo' });
    } catch (e) { showAll(els); }
  }

  /* ---- scroll parallax ---- */
  var mark = document.querySelector('.hero .mark');
  var heroInner = document.querySelector('.hero-inner');
  function parallax(y) {
    y = (typeof y === 'number') ? y : (window.scrollY || window.pageYOffset || 0);
    if (y > window.innerHeight * 1.2) return; // only near hero
    if (mark) mark.style.transform = 'translateY(calc(-50% + ' + (y * 0.20) + 'px))';
    if (heroInner) heroInner.style.transform = 'translateY(' + (y * 0.06) + 'px)';
  }
  if (!reduced) {
    if (lenis) lenis.on('scroll', function (e) { parallax(e.scroll); });
    else window.addEventListener('scroll', function () { parallax(); }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', heroIntro);
  else heroIntro();
})();
