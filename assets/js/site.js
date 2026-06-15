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

  /* ---- hero fiber canvas: light flowing along strands into a node -------
     Time-based + smooth fade envelopes (no teleport "pop"); rebuilds ONLY on a
     real width change, so iOS Safari's address-bar resize no longer re-randomizes
     and "hops" the field. Calmer + subtler on mobile so the headline stays clean. */
  var canvas = document.getElementById('fiber-canvas');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, mobile = false, alpha = 0.9, strands = [], node = { x: 0, y: 0 };

    function rand(a, b) { return a + Math.random() * (b - a); }
    function smooth(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }

    function build() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mobile = W < 760;
      alpha = mobile ? 0.7 : 0.85;
      node.x = mobile ? W * 0.80 : W * 0.70;
      node.y = mobile ? H * 0.15 : H * 0.44;
      var n = mobile ? 7 : 14, far = Math.max(W, H);
      strands = [];
      for (var i = 0; i < n; i++) {
        var ang = (Math.PI * 2 * i) / n + rand(-0.22, 0.22);
        var len = rand(far * 0.45, far * 0.95);
        var sx = node.x + Math.cos(ang) * len;
        var sy = node.y + Math.sin(ang) * len;
        var mx = (sx + node.x) / 2 + rand(-70, 70);
        var my = (sy + node.y) / 2 + rand(-70, 70);
        var pulses = [{ off: Math.random(), spd: rand(0.05, 0.11) }];
        if (Math.random() < 0.5) pulses.push({ off: Math.random(), spd: rand(0.05, 0.11) });
        strands.push({ sx: sx, sy: sy, mx: mx, my: my, ex: node.x, ey: node.y, pulses: pulses });
      }
    }

    function bez(p, a) {
      var u = 1 - p;
      return { x: u * u * a.sx + 2 * u * p * a.mx + p * p * a.ex,
               y: u * u * a.sy + 2 * u * p * a.my + p * p * a.ey };
    }

    function frame(ts) {
      var t = (ts || 0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = alpha;

      // faint strand lines
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,150,200,0.07)';
      for (var i = 0; i < strands.length; i++) {
        var a = strands[i];
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy);
        ctx.quadraticCurveTo(a.mx, a.my, a.ex, a.ey); ctx.stroke();
      }

      // convergence node — gentle breathing glow
      var breathe = 0.85 + 0.15 * Math.sin(t * 1.3);
      var R = (mobile ? 46 : 66) * breathe;
      var ng = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, R);
      ng.addColorStop(0, 'rgba(234,251,255,' + (0.8 * breathe).toFixed(3) + ')');
      ng.addColorStop(0.28, 'rgba(34,211,238,0.45)');
      ng.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.arc(node.x, node.y, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(242,254,255,0.92)';
      ctx.beginPath(); ctx.arc(node.x, node.y, 3.2, 0, Math.PI * 2); ctx.fill();

      // pulses: travel source(0) -> node(1); fade in at spawn AND out at the node
      for (var s = 0; s < strands.length; s++) {
        var st = strands[s];
        for (var j = 0; j < st.pulses.length; j++) {
          var pl = st.pulses[j];
          var f = (t * pl.spd + pl.off) % 1;
          var env = smooth(f / 0.18) * smooth((1 - f) / 0.18);
          if (env < 0.02) continue;
          var pos = bez(f, st);
          var g = (mobile ? 5 : 6.5) * env + 1.2;
          var pg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, g);
          pg.addColorStop(0, 'rgba(236,252,255,' + (0.95 * env).toFixed(3) + ')');
          pg.addColorStop(0.4, 'rgba(34,211,238,' + (0.6 * env).toFixed(3) + ')');
          pg.addColorStop(1, 'rgba(34,211,238,0)');
          ctx.fillStyle = pg;
          ctx.beginPath(); ctx.arc(pos.x, pos.y, g, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    var raf, playing = false, lastW = 0;
    function play() { if (playing || document.hidden) return; playing = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    function pause() { playing = false; cancelAnimationFrame(raf); }
    function init() { build(); lastW = W; }
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        // rebuild ONLY on a real width change — ignore iOS URL-bar height-only resizes
        if (Math.abs(canvas.getBoundingClientRect().width - lastW) < 4) return;
        init();
      }, 220);
    }, { passive: true });
    init(); play();
    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else play(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) play(); else pause(); });
      }, { threshold: 0 }).observe(canvas);
    }
  }
})();
