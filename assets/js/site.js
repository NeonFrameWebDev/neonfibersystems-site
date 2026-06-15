/* ============================================================================
   NEON FIBER SYSTEMS site interactions (vanilla JS, no deps)
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- year stamp ------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- sticky nav state ------------------------------------------------- */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- mobile menu ------------------------------------------------------ */
  var menu = document.getElementById('mobile-menu');
  var scrim = document.getElementById('scrim');
  function openMenu(o) {
    if (!menu) return;
    menu.classList.toggle('open', o);
    if (scrim) scrim.classList.toggle('open', o);
    document.body.style.overflow = o ? 'hidden' : '';
  }
  document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { openMenu(true); }); });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { openMenu(false); }); });
  if (scrim) scrim.addEventListener('click', function () { openMenu(false); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { openMenu(false); }); });

  /* ---- scroll reveal ---------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- animated bar fills ----------------------------------------------- */
  var bars = document.querySelectorAll('.bar');
  if ('IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); bio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { bio.observe(b); });
  } else { bars.forEach(function (b) { b.classList.add('in'); }); }

  /* ---- count-up numbers ------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var dur = 1400, t0 = null;
    function fmt(n) { return n.toLocaleString('en-US'); }
    if (reduce) { el.textContent = prefix + fmt(target) + suffix; return; }
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else { counters.forEach(countUp); }

  /* ---- hero flip-card demo: a watched door turns LIVE ------------------- */
  var flipDoor = document.getElementById('flip-door');
  if (flipDoor && !reduce) {
    var pill = flipDoor.querySelector('.pill');
    var meta = flipDoor.querySelector('.addr .m');
    var foot = document.getElementById('flip-foot-text');
    var live = false;
    function cycle() {
      live = !live;
      if (live) {
        flipDoor.classList.add('is-live');
        pill.className = 'pill live'; pill.textContent = 'LIVE ✓';
        if (meta) meta.textContent = 'Fiber confirmed ON · sell today';
        if (foot) foot.textContent = 'Flip detected. Area pushed to the sales team’s live-door list.';
      } else {
        flipDoor.classList.remove('is-live');
        pill.className = 'pill watch'; pill.textContent = 'WATCHING';
        if (meta) meta.textContent = 'Fiber permit pulled nearby · go-live estimated soon';
        if (foot) foot.textContent = 'Checked on an escalating schedule until the day it flips';
      }
    }
    setInterval(cycle, 3200);
  }

  /* ---- contact form -> builds a mailto (no backend needed) -------------- */
  var form = document.getElementById('pilot-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements;
      var to = 'chad@neonfibersystems.com';
      var subj = 'Pilot request from ' + (f.company.value || 'a fiber sales team');
      var lines = [
        'Name: ' + (f.name.value || ''),
        'Company: ' + (f.company.value || ''),
        'Email: ' + (f.email.value || ''),
        'Phone: ' + (f.phone ? f.phone.value : ''),
        'Markets / states: ' + (f.markets ? f.markets.value : ''),
        'Team size: ' + (f.teamsize ? f.teamsize.value : ''),
        '',
        (f.message ? f.message.value : '')
      ];
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subj) +
                 '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      var note = document.getElementById('form-note');
      if (note) { note.hidden = false; }
    });
  }

  /* ---- hero fiber canvas: light pulses traveling along strands ---------- */
  var canvas = document.getElementById('fiber-canvas');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, strands = [], pulses = [], node = { x: 0, y: 0 };

    function rand(a, b) { return a + Math.random() * (b - a); }

    function build() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // convergence node sits to the right side on wide screens, center on narrow
      node.x = W > 900 ? W * 0.72 : W * 0.5;
      node.y = W > 900 ? H * 0.46 : H * 0.34;
      strands = [];
      var n = W < 700 ? 9 : 16;
      for (var i = 0; i < n; i++) {
        var ang = (Math.PI * 2 * i) / n + rand(-0.18, 0.18);
        var len = rand(W * 0.28, W * 0.62);
        var sx = node.x + Math.cos(ang) * len;
        var sy = node.y + Math.sin(ang) * len;
        // control point for a gentle curve
        var mx = (sx + node.x) / 2 + rand(-60, 60);
        var my = (sy + node.y) / 2 + rand(-60, 60);
        strands.push({ sx: sx, sy: sy, mx: mx, my: my, ex: node.x, ey: node.y });
      }
      pulses = [];
      for (var j = 0; j < strands.length; j++) {
        // one or two pulses per strand, staggered
        pulses.push({ s: j, t: Math.random(), v: rand(0.0016, 0.0036) });
        if (Math.random() > 0.5) pulses.push({ s: j, t: Math.random(), v: rand(0.0016, 0.0034) });
      }
    }

    function bez(p, a) {
      var u = 1 - p;
      return {
        x: u * u * a.sx + 2 * u * p * a.mx + p * p * a.ex,
        y: u * u * a.sy + 2 * u * p * a.my + p * p * a.ey
      };
    }

    var grad;
    function makeGrad() {
      grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, 'rgba(34,211,238,0.5)');
      grad.addColorStop(0.55, 'rgba(59,130,246,0.42)');
      grad.addColorStop(1, 'rgba(167,139,250,0.46)');
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      // faint strands
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(120,150,200,0.10)';
      strands.forEach(function (a) {
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy);
        ctx.quadraticCurveTo(a.mx, a.my, a.ex, a.ey); ctx.stroke();
      });
      // node glow
      var ng = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 60);
      ng.addColorStop(0, 'rgba(234,251,255,0.9)');
      ng.addColorStop(0.25, 'rgba(34,211,238,0.55)');
      ng.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.arc(node.x, node.y, 60, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(242,254,255,0.95)';
      ctx.beginPath(); ctx.arc(node.x, node.y, 4.2, 0, Math.PI * 2); ctx.fill();

      // traveling pulses (move from outer end inward to the node)
      pulses.forEach(function (p) {
        p.t += p.v; if (p.t > 1) p.t = 0;
        var a = strands[p.s];
        var pos = bez(1 - p.t, a); // 1->0 so it heads toward node as t grows
        var glow = 7 * (0.4 + 0.6 * (1 - p.t));
        var pg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glow);
        pg.addColorStop(0, 'rgba(234,251,255,0.95)');
        pg.addColorStop(0.4, 'rgba(34,211,238,0.6)');
        pg.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, glow, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    }

    var raf;
    function start() { build(); makeGrad(); cancelAnimationFrame(raf); frame(); }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(start, 180); }, { passive: true });
    start();
    // pause when tab hidden (battery / CPU)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else frame();
    });
  }
})();
