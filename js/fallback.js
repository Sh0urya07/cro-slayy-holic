/* =====================================================================
   Graceful 2D fallback.
   If the 3D libraries (three.js / GSAP) don't load — e.g. no internet
   when the file is opened — the cinematic world can't run. This makes
   sure the site is still fully usable: a clean, scrollable 2D page.
   ===================================================================== */
(function () {
  function cfg(){ return window.CRO_CONFIG || { instagram:'cro_slayy_holic', email:'' }; }

  function igLink(){ return 'https://ig.me/m/' + cfg().instagram.replace(/^@/,''); }
  function mailLink(sub){ return 'mailto:' + (cfg().email||'') + (sub ? ('?subject='+encodeURIComponent(sub)) : ''); }

  function buildProductGrid(){
    var hud = document.getElementById('product-hud');
    if (!hud) return;
    var data = (window.CRO_PRODUCTS && window.CRO_PRODUCTS.products) || [];
    if (!data.length){
      hud.innerHTML =
        '<div class="glow">✨ new drops coming soon</div>' +
        '<div style="opacity:.85;margin-top:6px">the shelves fill up with every make — DM to be first</div>';
      return;
    }
    var html = '<div class="fb-grid">';
    data.forEach(function(d){
      var msg = 'Hi! I’m interested in "'+ (d.name||'a piece') +'" from your shop 💕';
      html +=
        '<div class="fb-card">' +
          '<div class="fb-img"><img src="'+ (d.image||'') +'" alt="'+ (d.name||'') +'" ' +
             'onerror="this.style.display=\'none\';this.parentNode.classList.add(\'noimg\');" /></div>' +
          '<div class="fb-info">' +
            '<h4>'+ (d.name||'Handmade piece') +'</h4>' +
            '<p class="fb-price">'+ (d.price||'DM for price') +'</p>' +
            (d.description ? '<p class="fb-desc">'+ d.description +'</p>' : '') +
            '<div class="btn-row">' +
              '<a class="btn ig" target="_blank" href="'+ igLink() +'" ' +
                 'onclick="navigator.clipboard&&navigator.clipboard.writeText(\''+ msg.replace(/'/g,"\\'") +'\')">DM to order 💌</a>' +
              '<a class="btn mail" href="'+ mailLink('Order: '+(d.name||'')) +'">Email</a>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';
    hud.innerHTML = html;
  }

  function wireContact(){
    var H = igLink();
    ['foot-ig'].forEach(function(id){ var e=document.getElementById(id); if(e){e.href=H;e.target='_blank';} });
    var fm=document.getElementById('foot-mail'); if(fm) fm.href=mailLink();
    var sig=document.getElementById('send-ig'), sml=document.getElementById('send-mail');
    var compose=function(){
      var n=(document.getElementById('f-name')||{}).value||'';
      var idea=(document.getElementById('f-idea')||{}).value||'';
      var vibe=(document.getElementById('f-vibe')||{}).value||'';
      return 'Hi! I’m '+(n||'someone')+' 💕\nCustom idea: '+(idea||'(idea)')+'\nColors/vibe: '+(vibe||'(open)');
    };
    if(sig) sig.onclick=function(){ if(navigator.clipboard) navigator.clipboard.writeText(compose()); window.open(H,'_blank'); status('message copied 💬 — paste it in her DM'); };
    if(sml) sml.onclick=function(){ window.location.href=mailLink('Custom crochet order'); };
  }
  function status(t){ var s=document.getElementById('custom-status'); if(s){ s.textContent=t; setTimeout(function(){s.textContent='';},4000);} }

  function engageFallback(){
    if (window.__CRO_3D) return;                 // 3D loaded fine — do nothing
    document.body.classList.add('no3d');
    // reveal all sections stacked & scrollable
    document.querySelectorAll('.beat').forEach(function(b){ b.classList.add('active'); });
    // dismiss the loader if it's still up
    var intro=document.getElementById('intro');
    if(intro){ intro.classList.add('done'); setTimeout(function(){intro.style.display='none';},900); }
    buildProductGrid();
    wireContact();
    var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  }

  // give the 3D world a chance to boot, then fall back if it didn't
  window.addEventListener('load', function(){ setTimeout(engageFallback, 3500); });
})();
