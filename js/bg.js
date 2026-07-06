/* =====================================================================
   cro_slayy_holic — animated background
   Slowly drifting soft color glows + gently rising twinkling particles,
   on a canvas behind everything. Subtle, dark, cinematic. Plain canvas
   2D — no dependencies, can't break the page.
   ===================================================================== */
(function () {
  var canvas = document.getElementById('bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  // large soft color glows that slowly drift
  var blobs = [
    { x: 0.20, y: 0.28, r: 0.55, c: [255, 94, 160], a: 0.16, vx: 0.00003, vy: 0.00002 },
    { x: 0.80, y: 0.62, r: 0.60, c: [150, 90, 220], a: 0.15, vx: -0.000022, vy: 0.000032 },
    { x: 0.62, y: 0.12, r: 0.45, c: [120, 160, 255], a: 0.10, vx: 0.000026, vy: -0.00002 },
    { x: 0.35, y: 0.85, r: 0.50, c: [255, 150, 200], a: 0.09, vx: 0.000018, vy: -0.000024 }
  ];

  // fine drifting particles (dust)
  var N = reduced ? 0 : Math.min(70, Math.round(window.innerWidth / 22));
  var ps = [];
  for (var i = 0; i < N; i++) {
    ps.push({
      x: Math.random(), y: Math.random(),
      r: (Math.random() * 1.6 + 0.4) * dpr,
      s: Math.random() * 0.00035 + 0.00008,
      o: Math.random() * 0.5 + 0.2,
      ph: Math.random() * 6.28
    });
  }

  function paintBlobs() {
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var g = ctx.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, b.r * Math.max(W, H));
      g.addColorStop(0, 'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',' + b.a + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  var t = 0;
  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    // drift + bounce the glows
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
      if (b.y < 0.05 || b.y > 0.95) b.vy *= -1;
    }
    paintBlobs();

    // twinkling rising particles
    for (var j = 0; j < ps.length; j++) {
      var p = ps[j];
      p.y -= p.s;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      var tw = 0.55 + 0.45 * Math.sin(t * 2 + p.ph);
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, 6.283);
      ctx.fillStyle = 'rgba(255,220,235,' + (p.o * tw * 0.5).toFixed(3) + ')';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  if (reduced) { paintBlobs(); }         // one calm static frame
  else { requestAnimationFrame(frame); }
})();
