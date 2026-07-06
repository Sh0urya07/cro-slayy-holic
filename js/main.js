/* =====================================================================
   cro_slayy_holic — 3D SHOWROOM (robust, GSAP-free)
   Grounded products on velvet podiums, a soft studio floor with real
   shadows, drag-to-orbit camera, products that fly in and reorganize,
   click a product to open its details. Classic script, global THREE.
   ===================================================================== */
/* global THREE */
(function(){
function D(m){ try{ (window.__diag||function(){})(m); }catch(e){} }
D('THREE = ' + (typeof THREE!=='undefined' ? ('loaded r'+(THREE.REVISION||'?')) : 'NOT LOADED ❌'));
if (typeof THREE === 'undefined'){ return; }

var COL = { bg1:0x2a2038, bg2:0x4a3a52, floor:0x241a2e,
            pink:0xff9ec7, lav:0xc9b6ff, cream:0xfff4e6, mint:0xb6f0d4, gold:0xffd9a8 };

var scene, camera, renderer, clock, raycaster, pointer;
var products = [], balls = [], reduced = false;
var orbit = { angle: 0, target: 0.15, radius: 13, height: 4.5, auto: true };
var drag = { on:false, x:0, y:0, moved:0 };
var CENTER = new THREE.Vector3(0, 1.2, 0);

function rr(a,b){ return a + (b-a)*Math.random(); }

try { init(); }
catch(e){ D('init crashed ❌ ' + (e && e.message ? e.message : e)); console.error(e); }

function init(){
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  D('init: starting');

  var canvas = document.getElementById('world');
  renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  D('renderer ok');

  scene = new THREE.Scene();
  scene.background = gradientBackground();
  scene.fog = new THREE.Fog(COL.bg1, 18, 48);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 200);
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  buildLights();
  buildFloor();
  buildAmbientYarn();
  buildProducts();
  D('scene built: ' + products.length + ' products');

  addEvents();
  wireContact();
  var yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();
  activateOverlay();

  window.__CRO_3D = true;
  document.body.dataset.ready = '1';
  document.body.classList.remove('no3d');

  D('rendering ✓');
  animate();
}

/* ---------- soft studio gradient backdrop ---------- */
function gradientBackground(){
  var c = document.createElement('canvas'); c.width = 16; c.height = 256;
  var x = c.getContext('2d');
  var g = x.createLinearGradient(0,0,0,256);
  g.addColorStop(0, '#37294a'); g.addColorStop(0.55, '#2a2038'); g.addColorStop(1, '#1c1526');
  x.fillStyle = g; x.fillRect(0,0,16,256);
  var t = new THREE.CanvasTexture(c); return t;
}

/* ---------- lighting ---------- */
function buildLights(){
  scene.add(new THREE.HemisphereLight(0xffe9d6, 0x2a2038, 0.55));
  var key = new THREE.DirectionalLight(0xfff1dd, 1.15);
  key.position.set(6, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024,1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 60;
  key.shadow.camera.left=-20; key.shadow.camera.right=20;
  key.shadow.camera.top=20; key.shadow.camera.bottom=-20;
  key.shadow.bias = -0.0005;
  scene.add(key);
  var rim = new THREE.PointLight(COL.pink, 0.9, 60); rim.position.set(-10,4,-6); scene.add(rim);
  var fill = new THREE.PointLight(COL.lav, 0.7, 60); fill.position.set(8,3,10); scene.add(fill);
}

/* ---------- studio floor with contact shadows ---------- */
function buildFloor(){
  var geo = new THREE.CircleGeometry(40, 64);
  var mat = new THREE.MeshStandardMaterial({ color:COL.floor, roughness:0.95, metalness:0 });
  var floor = new THREE.Mesh(geo, mat);
  floor.rotation.x = -Math.PI/2; floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);
  // soft glowing ring under the display
  var ring = new THREE.Mesh(
    new THREE.RingGeometry(6.5, 12, 48),
    new THREE.MeshBasicMaterial({ color:COL.pink, transparent:true, opacity:0.06, side:THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI/2; ring.position.y = 0.01; scene.add(ring);
}

/* ---------- gentle floating yarn balls (ambiance) ---------- */
function buildAmbientYarn(){
  var pal = [COL.pink, COL.lav, COL.mint, COL.gold];
  var n = reduced ? 4 : 9;
  for (var i=0;i<n;i++){
    var r = rr(0.35,0.9);
    var b = new THREE.Mesh(
      new THREE.SphereGeometry(r, 24, 24),
      new THREE.MeshStandardMaterial({ color: pal[i%pal.length], roughness:0.95 })
    );
    b.position.set(rr(-16,16), rr(3,10), rr(-16,-2));
    b.castShadow = false;
    b.userData = { ph: rr(0,6.28), sp: rr(-0.3,0.3), bob: rr(0.3,0.8), y0: b.position.y };
    balls.push(b); scene.add(b);
  }
}

/* ---------- product photo → texture (with graceful text fallback) ---------- */
function labelTexture(name, price){
  var c = document.createElement('canvas'); c.width = 512; c.height = 640;
  var x = c.getContext('2d');
  var g = x.createLinearGradient(0,0,512,640);
  g.addColorStop(0,'#ffd0e6'); g.addColorStop(1,'#e6d9ff');
  x.fillStyle = g; x.fillRect(0,0,512,640);
  x.fillStyle = '#5a2340'; x.textAlign = 'center'; x.font = 'bold 40px sans-serif';
  var words = (name||'make').split(' '), line='', lines=[];
  words.forEach(function(w){ var t=line+w+' '; if(x.measureText(t).width>440 && line){ lines.push(line); line=w+' '; } else line=t; });
  lines.push(line);
  var sy = 300 - (lines.length-1)*26;
  lines.forEach(function(l,i){ x.fillText(l.trim(), 256, sy+i*52); });
  x.fillStyle = '#8a5a72'; x.font = '30px sans-serif';
  x.fillText(price||'DM for price', 256, 470);
  return new THREE.CanvasTexture(c);
}

/* ---------- one product: a thick card on a velvet podium ---------- */
function makeProduct(d){
  var grp = new THREE.Group();

  // velvet podium
  var pod = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 2.0, 0.55, 32),
    new THREE.MeshStandardMaterial({ color:COL.lav, roughness:1 })
  );
  pod.position.y = 0.27; pod.castShadow = true; pod.receiveShadow = true;
  grp.add(pod);

  // the product as a THICK card (reads as a real 3D object)
  var front = new THREE.MeshStandardMaterial({ map: labelTexture(d.name, d.price), roughness:0.72 });
  var edge  = new THREE.MeshStandardMaterial({ color: COL.cream, roughness:0.85 });
  var mats  = [edge, edge, edge, edge, front, edge]; // +z face = front
  var card  = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.8, 0.28), mats);
  card.position.y = 2.5; card.castShadow = true;
  grp.add(card);
  grp.userData.card = card;

  // load real photo onto the front face if present
  if (d.image){
    new THREE.TextureLoader().load(d.image, function(tex){
      front.map = tex; front.needsUpdate = true;
    }, undefined, function(){ /* keep label */ });
  }
  return grp;
}

/* ---------- build products from data (fly-in → reorganize) ---------- */
function buildProducts(){
  var DATA = (window.CRO_PRODUCTS && window.CRO_PRODUCTS.products) || [];
  var hud = document.getElementById('product-hud');

  if (!DATA.length){
    if (hud) hud.innerHTML = '<div class="glow">✨ new drops coming soon</div>' +
      '<div style="opacity:.85;margin-top:6px">the shelves fill up with every make — DM to be first</div>';
    var ph = makeProduct({ name:'coming soon ✨', price:'DM to be first' });
    ph.userData.placeholder = true;
    ph.position.set(0,0,0); products.push({ mesh:ph, data:null }); scene.add(ph);
    return;
  }

  if (hud) hud.innerHTML = '<div class="glow">drag to look around · tap a product for details ✦</div>';
  var N = DATA.length;
  var gap = 4.6;
  DATA.forEach(function(d, i){
    var g = makeProduct(d);
    // organized slot: a shallow arc on the floor
    var tx = (i - (N-1)/2) * gap;
    var tz = -Math.abs(i - (N-1)/2) * 1.1;
    var tRy = -(i - (N-1)/2) * 0.16;
    g.userData.target = new THREE.Vector3(tx, 0, tz);
    g.userData.ry = tRy;
    g.userData.ph = rr(0,6.28);
    g.userData.settled = reduced;

    if (!reduced){
      // 1) appear at a random spot, tiny + tumbling …
      g.position.set(rr(-14,14), rr(6,14), rr(-14,6));
      g.rotation.set(rr(-1,1), rr(-1.5,1.5), rr(-1,1));
      g.scale.setScalar(0.01);
      g.userData.delay = 0.4 + i*0.22;         // staggered entrance (seconds)
    } else {
      g.position.copy(g.userData.target);
      g.rotation.y = tRy;
    }
    products.push({ mesh:g, data:d }); scene.add(g);
  });
}

/* ---------- input: drag to orbit, click to open ---------- */
function addEvents(){
  window.addEventListener('resize', onResize);
  var el = renderer.domElement;
  el.addEventListener('pointerdown', function(e){ drag.on=true; drag.x=e.clientX; drag.y=e.clientY; drag.moved=0; orbit.auto=false; });
  window.addEventListener('pointermove', function(e){
    if(!drag.on) return;
    var dx = e.clientX - drag.x; drag.x = e.clientX; drag.moved += Math.abs(dx);
    orbit.target -= dx * 0.006;
  });
  window.addEventListener('pointerup', function(e){
    if (drag.on && drag.moved < 6) tryPick(e);   // a tap, not a drag
    drag.on = false;
    setTimeout(function(){ orbit.auto = true; }, 2500);
  });
  var mt = document.getElementById('motion-toggle');
  if (mt) mt.addEventListener('click', function(){
    reduced = !reduced; document.body.classList.toggle('reduced', reduced);
    mt.textContent = reduced ? '✨ motion: off' : '✨ motion: on';
  });
  var dc = document.getElementById('detail-close'); if (dc) dc.addEventListener('click', closeDetail);
  var dv = document.getElementById('detail'); if (dv) dv.addEventListener('click', function(e){ if(e.target.id==='detail') closeDetail(); });
}

function tryPick(e){
  pointer.x = (e.clientX/window.innerWidth)*2 - 1;
  pointer.y = -(e.clientY/window.innerHeight)*2 + 1;
  raycaster.setFromCamera(pointer, camera);
  var cards = products.map(function(p){ return p.mesh.userData.card; }).filter(Boolean);
  var hit = raycaster.intersectObjects(cards, true)[0];
  if (!hit) return;
  var g = hit.object; while(g && !g.userData.target && !g.userData.placeholder && g.parent) g = g.parent;
  var pr = products.filter(function(p){ return p.mesh===g; })[0];
  if (pr && pr.data) openDetail(pr.data);
  else { var cu=document.getElementById('beat-custom'); if(cu) cu.scrollIntoView({behavior:'smooth'}); }
}

/* ---------- detail panel ---------- */
function openDetail(d){
  var $ = function(id){ return document.getElementById(id); };
  var img = $('detail-img');
  if (img){ img.src = d.image||''; img.onerror=function(){ img.style.visibility='hidden'; }; img.onload=function(){ img.style.visibility='visible'; }; }
  if ($('detail-name'))  $('detail-name').textContent  = d.name || 'Handmade piece';
  if ($('detail-price')) $('detail-price').textContent = d.price || 'DM for price';
  if ($('detail-desc'))  $('detail-desc').textContent  = d.description || '';
  if ($('detail-tag'))   $('detail-tag').textContent   = d.soldOut ? 'sold out 🥺' : (d.custom ? '✨ made to order' : (d.tag||''));
  var sw = $('detail-colors'); if (sw){ sw.innerHTML=''; (d.colors||[]).forEach(function(c){ var i=document.createElement('i'); i.style.background=c; sw.appendChild(i); }); }
  var msg = 'Hi! I’m interested in "'+(d.name||'a piece')+'" from your shop 💕';
  if ($('detail-ig'))   $('detail-ig').onclick   = function(ev){ ev.preventDefault(); openIG(msg); };
  if ($('detail-mail')) $('detail-mail').onclick = function(ev){ ev.preventDefault(); openMail('Order: '+(d.name||''), msg); };
  var dv=$('detail'); if(dv){ dv.classList.add('open'); dv.setAttribute('aria-hidden','false'); }
}
function closeDetail(){ var dv=document.getElementById('detail'); if(dv){ dv.classList.remove('open'); dv.setAttribute('aria-hidden','true'); } }

/* ---------- contact: Instagram DM or email ---------- */
function cfg(){ return window.CRO_CONFIG || { instagram:'cro_slayy_holic', email:'' }; }
function openIG(message){
  var h = cfg().instagram.replace(/^@/,'');
  if (message && navigator.clipboard) navigator.clipboard.writeText(message).catch(function(){});
  var s=document.getElementById('custom-status'); if(s){ s.textContent='message copied 💬 — paste it in her DM'; setTimeout(function(){s.textContent='';},4000); }
  window.open('https://ig.me/m/'+h, '_blank');
}
function openMail(sub, body){ window.location.href = 'mailto:'+(cfg().email||'')+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body); }
function wireContact(){
  var H='https://ig.me/m/'+cfg().instagram.replace(/^@/,'');
  var fig=document.getElementById('foot-ig'), fml=document.getElementById('foot-mail');
  if(fig){ fig.href=H; fig.target='_blank'; } if(fml){ fml.href='mailto:'+(cfg().email||''); }
  var compose=function(){
    var n=(document.getElementById('f-name')||{}).value||'';
    var idea=(document.getElementById('f-idea')||{}).value||'';
    var vibe=(document.getElementById('f-vibe')||{}).value||'';
    return 'Hi! I’m '+(n||'someone')+' 💕\nCustom idea: '+(idea||'(idea)')+'\nColors/vibe: '+(vibe||'(open)');
  };
  var sig=document.getElementById('send-ig'), sml=document.getElementById('send-mail');
  if(sig) sig.onclick=function(){ openIG(compose()); };
  if(sml) sml.onclick=function(){ openMail('Custom crochet order', compose()); };
}

/* ---------- overlay beats: show hero, then reveal on scroll ---------- */
function activateOverlay(){
  var beats = document.querySelectorAll('.beat');
  if (!beats.length) return;
  beats[0].classList.add('active');
  // simple, reliable scroll: map page scroll to which beat is shown + orbit
  var spacer = document.createElement('div');
  spacer.id='scroll-spacer'; spacer.style.cssText='height:400vh;width:1px;position:relative;pointer-events:none;';
  var ov=document.getElementById('overlay'); if(ov) ov.appendChild(spacer);
  window.addEventListener('scroll', function(){
    var max = document.body.scrollHeight - window.innerHeight;
    var p = max>0 ? window.scrollY/max : 0;
    var idx = Math.min(beats.length-1, Math.floor(p*beats.length + 0.001));
    beats.forEach(function(b,i){ b.classList.toggle('active', i===idx); });
    orbit.target = 0.15 + p * Math.PI * 1.2;   // scrolling also walks you around the display
    orbit.auto = false;
  }, { passive:true });
}

/* ---------- resize ---------- */
function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- render loop ---------- */
var _stop = false;
function animate(){
  if (_stop) return;
  requestAnimationFrame(animate);
  try {
    var dt = clock.getDelta(), t = clock.elapsedTime;

    // orbit camera around the display
    if (orbit.auto && !reduced) orbit.target += dt * 0.12;
    orbit.angle += (orbit.target - orbit.angle) * 0.06;
    camera.position.set(
      Math.sin(orbit.angle) * orbit.radius,
      orbit.height + Math.sin(t*0.4)*0.3,
      Math.cos(orbit.angle) * orbit.radius
    );
    camera.lookAt(CENTER);

    // products fly in and settle
    products.forEach(function(pr){
      var g = pr.mesh;
      if (g.userData.placeholder){ g.rotation.y += dt*0.3; return; }
      if (!g.userData.settled){
        if (t > (g.userData.delay||0)){
          g.position.lerp(g.userData.target, 0.07);
          var s = g.scale.x + (1 - g.scale.x)*0.09; g.scale.set(s,s,s);
          g.rotation.x += (0 - g.rotation.x)*0.08;
          g.rotation.z += (0 - g.rotation.z)*0.08;
          g.rotation.y += (g.userData.ry - g.rotation.y)*0.08;
          if (g.position.distanceTo(g.userData.target) < 0.05 && Math.abs(1-s) < 0.02){ g.userData.settled = true; g.scale.set(1,1,1); g.position.copy(g.userData.target); }
        }
      } else if (!reduced){
        // gentle idle bob once settled
        g.position.y = Math.sin(t*0.8 + g.userData.ph)*0.06;
        g.rotation.y = g.userData.ry + Math.sin(t*0.5 + g.userData.ph)*0.05;
      }
    });

    // ambient yarn balls drift
    if (!reduced) balls.forEach(function(b){
      b.rotation.y += b.userData.sp*dt;
      b.position.y = b.userData.y0 + Math.sin(t*b.userData.bob + b.userData.ph)*0.5;
    });

    renderer.render(scene, camera);
  } catch(err){
    _stop = true; D('render error ❌ ' + (err && err.message ? err.message : err)); console.error(err);
  }
}

})();
