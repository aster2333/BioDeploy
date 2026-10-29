// Render only values from the shared synthetic enzyme dataset.
const NS = 'http://www.w3.org/2000/svg';
const colors = ['#b8d9ff', '#92c5ff', '#6aaeff', '#4695f5', '#80d5d0', '#57bab6', '#c6a4f2', '#a98be0'];
export function renderKineticsChart(svg, candidate, view, t, number) {
  const fit = view === 'fit';
  svg.replaceChildren();
  svg.setAttribute('viewBox', '0 0 570 235');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', t(fit ? 'kinFitAria' : 'chartAria'));
  const element = (tag, attrs, text, parent = svg) => {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    parent.append(node); return node;
  };
  const xmin = 0, xmax = fit ? 640 : 120;
  const ymin = fit ? 0 : -0.02, ymax = fit ? 0.012 : 1.4;
  const x = (value) => 58 + (value - xmin) / (xmax - xmin) * 485;
  const y = (value) => 190 - (value - ymin) / (ymax - ymin) * 160;
  const label = (tx, ty, text, anchor = 'middle') => element('text', { x: tx, y: ty, fill: '#aab7c9', 'font-size': 11, 'text-anchor': anchor }, text);
  for (const value of fit ? [0, .004, .008, .012] : [0, .4, .8, 1.2]) {
    element('path', { d: `M58 ${y(value)}H543`, stroke: '#303a49', 'stroke-width': 1 });
    label(50, y(value) + 4, number(value), 'end');
  }
  for (const value of fit ? [0, 160, 320, 480, 640] : [0, 30, 60, 90, 120]) label(x(value), 207, number(value));
  label(300, 229, t(fit ? 'kinSubstrateAxis' : 'kinTimeAxis'));
  label(58, 16, t(fit ? 'kinVelocityAxis' : 'chartLegend'), 'start');
  element('path', { d: 'M58 30V190H543', stroke: '#67758a', fill: 'none' });
  const plot = element('g', { 'data-plot': view });
  const path = (points, xkey, ykey, attrs) => element('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${x(p[xkey]).toFixed(3)},${y(p[ykey]).toFixed(3)}`).join(' '), fill: 'none', ...attrs }, undefined, plot);
  if (fit) {
    path(candidate.fitted_curve, 'substrate_uM', 'velocity_uM_s', { stroke: '#8abaff', 'stroke-width': 2.5, class: 'kinetics-fit-line' });
    for (const point of candidate.initial_rates) element('circle', { cx: x(point.substrate_uM), cy: y(point.velocity_uM_s), r: 3, fill: '#b8d9ff', opacity: .75, class: 'kinetics-rate-point' }, undefined, plot);
  } else {
    const concentrations = [...new Set(candidate.raw_traces.map((trace) => trace.substrate_uM))];
    for (const trace of candidate.raw_traces) path(trace.points, 'time_s', 'blank_corrected_product_uM', { stroke: colors[concentrations.indexOf(trace.substrate_uM)], 'stroke-width': 1.6, 'stroke-dasharray': ['', '5 3', '2 3'][trace.replicate - 1], opacity: .8, class: 'kinetics-raw-trace' });
  }
}
export function renderConcentrationLegend(container, concentrations, number) {
  container.replaceChildren(...concentrations.map((concentration, index) => {
    const item = document.createElement('span');
    const swatch = document.createElement('i');
    swatch.style.backgroundColor = colors[index];
    swatch.setAttribute('aria-hidden', 'true');
    item.append(swatch, `${number(concentration)} µM`);
    return item;
  }));
}
