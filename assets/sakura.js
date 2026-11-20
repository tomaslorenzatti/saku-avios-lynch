// Falling sakura petals. Each <canvas class="petals" data-count="N"> gets its own layer.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const COLORS = ['#F7C6DA', '#F3B4CF', '#FBDDE8', '#E9C8F5', '#D9C2FA'];

  function layer(canvas) {
    const ctx = canvas.getContext('2d');
    const count = Number(canvas.dataset.count) || 30;
    let w = 0, h = 0, dpr = 1, petals = [], raf = 0, visible = true;

    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -20 - Math.random() * h * 0.3,
      s: 6 + Math.random() * 9,
      vy: 0.35 + Math.random() * 0.75,
      vx: 0.2 + Math.random() * 0.5,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.03,
      sway: Math.random() * Math.PI * 2,
      flip: Math.random() * Math.PI * 2,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    });

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!petals.length) petals = Array.from({ length: count }, () => spawn(true));
    }

    function petal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.scale(1, Math.max(0.25, Math.abs(Math.cos(p.flip))));
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      // A sakura petal: rounded body with the characteristic notch at the tip.
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.8, p.s * 0.8, p.s * 0.6, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.6, -p.s * 0.9, -p.s * 0.8, 0, -p.s);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(-p.s * 0.22, -p.s * 1.02);
      ctx.lineTo(0, -p.s * 0.62);
      ctx.lineTo(p.s * 0.22, -p.s * 1.02);
      ctx.fill();
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.sway += 0.012; p.flip += 0.03; p.a += p.va;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        if (p.y > h + 20 || p.x > w + 20) Object.assign(p, spawn(false), { x: Math.random() * w * 1.1 - w * 0.1 });
        petal(p);
      }
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    }

    function still() {
      // Reduced motion: a few resting petals, no animation.
      ctx.clearRect(0, 0, w, h);
      petals.slice(0, Math.ceil(count / 3)).forEach(petal);
    }

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) return still();
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    resize();
    new ResizeObserver(() => { resize(); if (reduce.matches) still(); }).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(canvas);
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener?.('change', start);
    start();
  }

  document.querySelectorAll('canvas.petals').forEach(layer);
})();
