import { landPoints } from './globe-land.js';

// Orthographic projection with true geographic coordinates. China is a regional
// placeholder, so it is never given a supplier location or a delivery route.
const radians = Math.PI / 180;
const sites = {
  ch: { lat: 46.52, lon: 6.63, label: 'CH', focus: 30 },
  sg: { lat: 1.35, lon: 103.82, label: 'SG', focus: 95 },
  us: { lat: 37.66, lon: -122.4, label: 'US', focus: -100 },
  cn: { lat: 35.86, lon: 104.2, label: 'CN', focus: 110, pending: true },
};
const vector = (lat, lon) => {
  const a = lat * radians, b = lon * radians;
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
};
const land = landPoints.map(([lat, lon]) => vector(lat, lon));
const routes = [['ch', 'sg'], ['ch', 'us'], ['sg', 'us']].map(([from, to]) => {
  const a = vector(sites[from].lat, sites[from].lon);
  const b = vector(sites[to].lat, sites[to].lon);
  const angle = Math.acos(Math.max(-1, Math.min(1, a.reduce((sum, n, i) => sum + n * b[i], 0))));
  return { from, to, points: Array.from({ length: 81 }, (_, i) => {
    const t = i / 80;
    const height = 1 + Math.sin(Math.PI * t) * .19;
    return a.map((n, j) => height * (Math.sin((1 - t) * angle) * n + Math.sin(t * angle) * b[j]) / Math.sin(angle));
  }) };
});

export function createNetworkGlobe(canvas) {
  const context = canvas?.getContext('2d');
  if (!context) return null;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'ch', longitude = 30, target = 30, frame = 0, previous = 0;
  let visible = false, ratio = 1;
  const cx = 260, cy = 226, radius = 164;

  function draw(time = 0) {
    const ctx = context;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, 520, 450);
    const phi = longitude * radians, tilt = 22 * radians;
    const sin = Math.sin(phi), cos = Math.cos(phi);
    function project([x, y, z]) {
      const depth = x * sin + z * cos;
      return [cx + radius * (x * cos - z * sin), cy - radius * (y * Math.cos(tilt) - depth * Math.sin(tilt)), y * Math.sin(tilt) + depth * Math.cos(tilt)];
    }
    function circle(x, y, r, color) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    }
    // A soft atmosphere and directional shading establish volume, rather than
    // suggesting a flat map inside a circular outline.
    const atmosphere = ctx.createRadialGradient(cx, cy, radius * .8, cx, cy, radius * 1.27);
    atmosphere.addColorStop(0, 'rgba(20,110,245,.05)'); atmosphere.addColorStop(1, 'rgba(20,110,245,0)');
    circle(cx, cy, radius * 1.27, atmosphere);
    ctx.save(); ctx.translate(cx, cy + 172); ctx.scale(1, .12);
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, 160);
    shadow.addColorStop(0, 'rgba(53,76,110,.13)'); shadow.addColorStop(1, 'rgba(53,76,110,0)');
    circle(0, 0, 160, shadow); ctx.restore();
    const surface = ctx.createRadialGradient(cx - 70, cy - 90, 10, cx + 35, cy + 30, 210);
    surface.addColorStop(0, '#fff'); surface.addColorStop(.66, '#f0f4f9'); surface.addColorStop(1, '#dce5ef');
    circle(cx, cy, radius, surface);
    ctx.strokeStyle = 'rgba(133,155,182,.22)'; ctx.lineWidth = .65;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    // Thin projected graticules are secondary to the land silhouette.
    ctx.strokeStyle = 'rgba(114,143,177,.12)'; ctx.lineWidth = .5;
    const line = (points) => {
      ctx.beginPath(); let pen = false;
      for (const point of points) {
        const [x, y, z] = project(point);
        if (z < 0) { pen = false; continue; }
        if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
    };
    for (let latitude = -60; latitude <= 60; latitude += 30) {
      line(Array.from({ length: 181 }, (_, i) => vector(latitude, i * 2 - 180)));
    }
    for (let lon = -180; lon < 180; lon += 30) {
      line(Array.from({ length: 91 }, (_, i) => vector(i * 2 - 90, lon)));
    }
    for (const point of land) {
      const [x, y, z] = project(point);
      if (z <= 0) continue;
      circle(x, y, .5 + .65 * Math.sqrt(z), `rgba(58,81,113,${.15 + .56 * z})`);
    }
    for (const route of routes) {
      const active = selected === route.from || selected === route.to;
      ctx.strokeStyle = active ? 'rgba(20,110,245,.6)' : 'rgba(20,110,245,.18)';
      ctx.lineWidth = active ? 1.05 : .65;
      ctx.beginPath(); let pen = false;
      for (const point of route.points) {
        const [x, y, z] = project(point);
        if (z < 0 && Math.hypot(x - cx, y - cy) < radius + 1) { pen = false; continue; }
        if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
      if (active && !motion.matches) {
        const index = Math.floor((time / 55) % route.points.length);
        const [x, y, z] = project(route.points[index]);
        if (z > 0 || Math.hypot(x - cx, y - cy) > radius) circle(x, y, 2, '#146ef5');
      }
    }
    for (const [key, site] of Object.entries(sites)) {
      const [x, y, z] = project(vector(site.lat, site.lon));
      if (z < .08) continue;
      const active = selected === key;
      const color = site.pending ? '#8593a6' : '#146ef5';
      circle(x, y, active ? 12 : 7, site.pending ? 'rgba(101,120,147,.08)' : 'rgba(20,110,245,.09)');
      circle(x, y, active ? 5 : 3.5, '#fff');
      circle(x, y, active ? 3.1 : 2.1, color);
      ctx.font = `${active ? '600' : '400'} 10px "Geist Mono", monospace`;
      ctx.fillStyle = active ? '#172b48' : '#62748c';
      ctx.fillText(site.label, x + 12, y - 10);
    }
  }
  function animate(time) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (time - previous >= 32) {
      const elapsed = Math.min(time - previous, 64); previous = time;
      longitude += (target - longitude) * (1 - Math.exp(-elapsed / 150));
      if (Math.abs(target - longitude) < .015) longitude = target;
      draw(time);
    }
    if (!motion.matches) frame = requestAnimationFrame(animate);
  }
  function resume() {
    if (!visible || document.hidden || frame) return;
    if (motion.matches) { longitude = target; draw(); }
    else { previous = performance.now(); frame = requestAnimationFrame(animate); }
  }
  new ResizeObserver(() => {
    ratio = Math.min(window.devicePixelRatio || 1, 2) * canvas.clientWidth / 520;
    canvas.width = Math.round(520 * ratio); canvas.height = Math.round(450 * ratio);
    draw();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { cancelAnimationFrame(frame); frame = 0; }
    else resume();
  }, { rootMargin: '80px' }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else resume();
  });
  motion.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0; resume();
  });
  return { select(region) {
    if (!Object.hasOwn(sites, region)) return;
    selected = region;
    target = sites[region].focus;
    // Choose the shortest rotation across the antimeridian.
    longitude = target + ((longitude - target + 540) % 360) - 180;
    if (motion.matches) longitude = target;
    draw(); resume();
  } };
}
