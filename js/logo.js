/* =====================================================================
   SCENE 0 — anime.js logo intro / loader
   Draws a stitched ring around the logo, pops the logo in with a
   bounce, sparkles, then lifts away to reveal the 3D world.
   Runs on its own — never waits on the 3D world to load.
   ===================================================================== */
(function () {
  var started = false;

  function runIntro(onDone) {
    var intro    = document.getElementById('intro');
    var ring     = document.querySelector('#logo-ring .ring-stitch');
    var img      = document.getElementById('logo-img');
    var fallback = document.getElementById('logo-fallback');
    var spark    = document.getElementById('logo-spark');
    var hint     = document.getElementById('intro-hint');
    var reduced  = document.body.classList.contains('reduced') ||
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var len = 950;
    if (ring) {
      try { len = ring.getTotalLength(); } catch (e) {}
      ring.style.strokeDasharray = len;
      ring.style.strokeDashoffset = len;
    }

    var visible = (img && img.style.display !== 'none') ? img : fallback;

    // reduced-motion or libraries missing → quick, accessible reveal
    if (reduced || typeof anime === 'undefined') {
      if (ring) ring.style.strokeDashoffset = 0;
      if (visible) { visible.style.opacity = 1; visible.style.transform = 'none'; }
      if (spark) spark.style.opacity = 1;
      setTimeout(function () { finish(intro, onDone); }, 800);
      return;
    }

    var tl = anime.timeline({ easing: 'easeOutCubic' });

    tl.add({ targets: ring, strokeDashoffset: [len, 0], duration: 1100, easing: 'easeInOutSine' });
    tl.add({ targets: visible, opacity: [0, 1], scale: [0.6, 1], duration: 900, easing: 'spring(1, 80, 10, 0)' }, '-=500');
    tl.add({ targets: spark, opacity: [0, 1], scale: [0, 1.2, 1], rotate: [0, 25], duration: 500 }, '-=300');
    tl.add({ targets: '#logo-stage', rotate: [0, 2, -2, 0], duration: 700 });
    tl.add({
      targets: '#logo-stage', scale: 1.25, opacity: 0, duration: 700, easing: 'easeInBack',
      complete: function () { finish(intro, onDone); }
    });

    if (hint) anime({ targets: hint, opacity: [0.4, 0.9], loop: true, direction: 'alternate', duration: 700, easing: 'easeInOutSine' });
  }

  function finish(intro, onDone) {
    if (intro) {
      intro.classList.add('done');
      setTimeout(function () { intro.style.display = 'none'; }, 900);
    }
    if (typeof onDone === 'function') onDone();
  }

  function runOnce() {
    if (started) return;
    started = true;
    runIntro(function () { document.body.dataset.introDone = '1'; });
  }

  window.CRO_runIntro = runOnce;

  if (document.readyState === 'complete') runOnce();
  else window.addEventListener('load', function () { setTimeout(runOnce, 250); });

  // hard safety net: never let the loader hang
  setTimeout(function () {
    var i = document.getElementById('intro');
    if (i && !i.classList.contains('done')) {
      i.classList.add('done');
      setTimeout(function () { i.style.display = 'none'; }, 900);
    }
  }, 6000);
})();
