/* =====================================================================
   cro_slayy_holic — storefront logic
   Renders products from data/products.js, opens a detail modal,
   wires Instagram/email contact, scroll reveals, mobile nav.
   Plain JS — no dependencies, always renders.
   ===================================================================== */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  function cfg() { return window.CRO_CONFIG || { instagram: 'cro_slayy_holic', email: '' }; }
  function igURL() { return 'https://ig.me/m/' + cfg().instagram.replace(/^@/, ''); }
  function mailURL(sub, body) {
    // Gmail web compose — works in any browser, no mail app required
    return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(cfg().email || '') +
      (sub ? '&su=' + encodeURIComponent(sub) : '') +
      (body ? '&body=' + encodeURIComponent(body) : '');
  }
  function status(t) { var s = $('custom-status'); if (s) { s.textContent = t; clearTimeout(status._t); status._t = setTimeout(function () { s.textContent = ''; }, 4000); } }

  /* ---------- render product grid ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function renderProducts() {
    var grid = $('product-list');
    var data = (window.CRO_PRODUCTS && window.CRO_PRODUCTS.products) || [];
    if (!grid) return;

    if (!data.length) {
      grid.innerHTML = '<div class="empty-note reveal"><div class="glow">New drops coming soon</div>' +
        '<p>The collection fills up with every new make — DM to be first in line.</p></div>';
      observeReveals();
      return;
    }

    grid.innerHTML = data.map(function (d, i) {
      var num = ('0' + (i + 1)).slice(-2);
      var badge = d.soldOut ? '<span class="badge">sold out</span>'
        : d.custom ? '<span class="badge custom">made to order</span>'
          : d.tag ? '<span class="badge">' + esc(d.tag) + '</span>' : '';
      var thumb = d.image
        ? '<img src="' + esc(d.image) + '" alt="' + esc(d.name) + '" loading="lazy" ' +
          'onerror="this.remove()" />'
        : '<span class="ph">your photo here</span>';
      return '<div class="row reveal" data-i="' + i + '">' +
        '<div class="num">' + num + '</div>' +
        '<div class="info">' +
        '<h3>' + esc(d.name || 'Handmade piece') + '</h3>' +
        '<p>' + esc(d.description || '') + '</p>' +
        '<div class="price">' + esc(d.price || 'DM for price') + '</div>' +
        '<span class="cta">DM to order</span>' +
        '</div>' +
        '<div class="thumb">' + badge + thumb + '</div>' +
        '</div>';
    }).join('');

    Array.prototype.forEach.call(grid.querySelectorAll('.row'), function (el) {
      el.addEventListener('click', function () { openDetail(data[+el.getAttribute('data-i')]); });
    });
    observeReveals();
  }

  /* ---------- detail modal ---------- */
  function openDetail(d) {
    if (!d) return;
    var img = $('detail-img');
    if (img) {
      img.src = d.image || '';
      img.onerror = function () { img.style.visibility = 'hidden'; };
      img.onload = function () { img.style.visibility = 'visible'; };
    }
    if ($('detail-name')) $('detail-name').textContent = d.name || 'Handmade piece';
    if ($('detail-price')) $('detail-price').textContent = d.price || 'DM for price';
    if ($('detail-desc')) $('detail-desc').textContent = d.description || '';
    if ($('detail-tag')) $('detail-tag').textContent = d.soldOut ? 'sold out 🥺' : (d.custom ? '✨ made to order' : (d.tag || ''));
    var sw = $('detail-colors');
    if (sw) { sw.innerHTML = ''; (d.colors || []).forEach(function (c) { var i = document.createElement('i'); i.style.background = c; sw.appendChild(i); }); }
    var msg = 'Hi! I’m interested in "' + (d.name || 'a piece') + '" from your shop 💕';
    if ($('detail-ig')) $('detail-ig').onclick = function (e) { e.preventDefault(); openIG(msg); };
    if ($('detail-mail')) $('detail-mail').onclick = function (e) { e.preventDefault(); window.open(mailURL('Order: ' + (d.name || ''), msg), '_blank'); };
    var m = $('detail'); if (m) { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); }
  }
  function closeDetail() { var m = $('detail'); if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); } }

  /* ---------- contact ---------- */
  function openIG(message) {
    if (message && navigator.clipboard) navigator.clipboard.writeText(message).catch(function () {});
    status('message copied 💬 — paste it in her DM');
    window.open(igURL(), '_blank');
  }
  function compose() {
    var n = ($('f-name') || {}).value || '', idea = ($('f-idea') || {}).value || '', vibe = ($('f-vibe') || {}).value || '';
    return 'Hi! I’m ' + (n || 'someone') + ' 💕\nCustom idea: ' + (idea || '(idea)') + '\nColors / vibe: ' + (vibe || '(open to ideas)');
  }

  /* ---------- scroll reveals ---------- */
  var io;
  function observeReveals() {
    var els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ---------- wire up ---------- */
  function init() {
    renderProducts();

    // contact buttons
    var H = igURL();
    ['nav-ig', 'foot-ig'].forEach(function (id) { var e = $(id); if (e) { e.href = H; e.target = '_blank'; } });
    if ($('foot-mail')) { $('foot-mail').target = '_blank'; $('foot-mail').rel = 'noopener'; }
    if ($('foot-mail')) $('foot-mail').href = mailURL('Hi from your website ✨',
      'Hi! I found you through your website and I’d love to order something 💕\n\nWhat I want: \nColors / vibe: ');
    if ($('send-ig')) $('send-ig').onclick = function () { openIG(compose()); };
    if ($('send-mail')) $('send-mail').onclick = function () { window.open(mailURL('Custom crochet order', compose()), '_blank'); };

    // modal
    if ($('detail-close')) $('detail-close').addEventListener('click', closeDetail);
    if ($('detail')) $('detail').addEventListener('click', function (e) { if (e.target.id === 'detail') closeDetail(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDetail(); });

    // mobile nav
    var t = $('nav-toggle'), mn = $('mobile-nav');
    if (t && mn) {
      t.addEventListener('click', function () { mn.classList.toggle('open'); });
      Array.prototype.forEach.call(mn.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { mn.classList.remove('open'); }); });
    }

    if ($('year')) $('year').textContent = new Date().getFullYear();
    observeReveals();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
