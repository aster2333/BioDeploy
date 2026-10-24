import { languages, locales } from './locales.js';
import { sampleData } from './sample-data.js';

const localeKey = 'biodeploy.locale';
const state = { locale: 'en', stage: 'input', region: 'cn', package: 'expression' };
try {
  const saved = localStorage.getItem(localeKey);
  if (Object.hasOwn(locales, saved)) state.locale = saved;
} catch { /* A blocked storage policy must not prevent language selection. */ }

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const t = (key) => locales[state.locale][key];
const localeTrigger = $('#locale-trigger');
const localeMenu = $('#locale-menu');
const mobileTrigger = $('.mobile-toggle');
const mobileNav = $('#mobile-nav');
const dialog = $('#package-dialog');
let dialogOpener;

function renderDialog() {
  const prefix = state.package;
  $('#dialog-code').textContent = prefix === 'expression' ? 'EXP-01' : 'BND-01';
  $('#dialog-title').textContent = t(`${prefix}Name`);
  $('#dialog-description').textContent = t(`${prefix}Description`);
  $('#dialog-method').textContent = t(`${prefix}Method`);
  $('#dialog-output').textContent = t(`${prefix}Output`);
}

function renderRegion() {
  const regions = { cn: ['CN / APAC', 'regionCnCopy'], us: ['US / AMERICAS', 'regionUsCopy'], au: ['AU / APAC', 'regionAuCopy'] };
  const [code, key] = regions[state.region];
  $('.region-code').textContent = code;
  $('#region-copy').textContent = t(key);
  $('#region-description').setAttribute('aria-labelledby', `region-${state.region}`);
  $$('[data-region]').forEach((button) => {
    const selected = button.dataset.region === state.region;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  $$('[data-map-region]').forEach((pin) => pin.classList.toggle('active', pin.dataset.mapRegion === state.region));
}

function renderLocale() {
  document.documentElement.lang = state.locale;
  document.title = t('pageTitle');
  $('meta[name="description"]').content = t('pageDescription');
  $$('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-aria]').forEach((element) => element.setAttribute('aria-label', t(element.dataset.i18nAria)));
  const language = languages.find(({ code }) => code === state.locale);
  $('#locale-label').textContent = language.name;
  $('#locale-label').lang = state.locale;
  localeTrigger.setAttribute('aria-label', `${t('chooseLanguage')}: ${language.name}`);
  $$('input[name="locale"]').forEach((input) => { input.checked = input.value === state.locale; });
  renderRegion();
  renderDialog();
}

function closeLocale(restoreFocus = false) {
  localeMenu.hidden = true;
  localeTrigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) localeTrigger.focus();
}

localeTrigger.addEventListener('click', () => {
  if (!localeMenu.hidden) { closeLocale(); return; }
  localeMenu.hidden = false;
  localeTrigger.setAttribute('aria-expanded', 'true');
  $('input[name="locale"]:checked').focus();
});

$$('input[name="locale"]').forEach((input) => input.addEventListener('change', () => {
  state.locale = input.value;
  try { localStorage.setItem(localeKey, state.locale); } catch { /* Session-only fallback. */ }
  renderLocale();
}));
$$('input[name="locale"]').forEach((input) => {
  input.addEventListener('click', (event) => {
    // Native radio arrow navigation also emits a click with detail=0.
    // Keep the menu open for keyboard exploration; Enter/Escape close it.
    if (event.detail > 0) closeLocale(true);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); closeLocale(true); }
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.locale-control')) closeLocale();
});
document.addEventListener('focusin', (event) => {
  if (!event.target.closest('.locale-control')) closeLocale();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!localeMenu.hidden) { event.preventDefault(); closeLocale(true); }
    if (!mobileNav.hidden) { mobileNav.hidden = true; mobileTrigger.setAttribute('aria-expanded', 'false'); mobileTrigger.focus(); }
  }
});

mobileTrigger.addEventListener('click', () => {
  mobileNav.hidden = !mobileNav.hidden;
  mobileTrigger.setAttribute('aria-expanded', String(!mobileNav.hidden));
});
$$('#mobile-nav a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  mobileTrigger.setAttribute('aria-expanded', 'false');
  const target = $(link.getAttribute('href'))?.querySelector('h2');
  if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
}));
matchMedia('(min-width: 901px)').addEventListener('change', ({ matches }) => {
  if (matches) { mobileNav.hidden = true; mobileTrigger.setAttribute('aria-expanded', 'false'); }
});

function selectStage(stage) {
  state.stage = stage;
  $$('[data-stage]').forEach((button) => {
    const selected = button.dataset.stage === stage;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    $(`#panel-${button.dataset.stage}`).hidden = !selected;
  });
}

function activateTabWithKeys(event, buttons, activate) {
  const index = buttons.indexOf(event.currentTarget);
  let next;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = buttons.length - 1;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
  if (next === undefined) return;
  event.preventDefault();
  activate(buttons[next]);
  buttons[next].focus();
}

const stageButtons = $$('[data-stage]');
stageButtons.forEach((button) => {
  button.addEventListener('click', () => selectStage(button.dataset.stage));
  button.addEventListener('keydown', (event) => activateTabWithKeys(event, stageButtons, (next) => selectStage(next.dataset.stage)));
});
$$('[data-next-stage]').forEach((button) => button.addEventListener('click', () => {
  selectStage(button.dataset.nextStage);
  $(`#panel-${state.stage}`).focus({ preventScroll: true });
}));
$$('[data-show-results]').forEach((link) => link.addEventListener('click', () => selectStage('results')));
const regionButtons = $$('[data-region]');
regionButtons.forEach((button) => {
  const activate = () => { state.region = button.dataset.region; renderRegion(); };
  button.addEventListener('click', activate);
  button.addEventListener('keydown', (event) => activateTabWithKeys(event, regionButtons, (next) => { state.region = next.dataset.region; renderRegion(); }));
});

$$('[data-package]').forEach((button) => button.addEventListener('click', () => {
  state.package = button.dataset.package;
  dialogOpener = button;
  renderDialog();
  closeLocale();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}));
function closeDialog() { dialog.close(); }
$('#close-dialog').addEventListener('click', closeDialog);
$('#dialog-done').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogOpener?.focus({ preventScroll: true });
});

// The graph and both file formats share one synthetic fixture.
const chartPaths = $$('.results-chart svg > path');
sampleData.traces.forEach((trace, index) => {
  const path = trace.points.map(({ time_s, response_ru }, point) => `${point ? 'L' : 'M'}${(35 + time_s / 210 * 500).toFixed(2)},${(120 - response_ru * 7 / 6).toFixed(2)}`).join(' ');
  chartPaths[index].setAttribute('d', path);
});

$$('[data-export]').forEach((button) => button.addEventListener('click', () => {
  const format = button.dataset.export;
  const csvHeader = 'schema_version,synthetic,sequence_id,trace_id,method,qc_status,time_s,response_ru,kd_nM';
  const csvRows = sampleData.traces.flatMap((trace) => trace.points.map((point) => [
    sampleData.schema_version, true, sampleData.sequence_id, trace.id, sampleData.assay.method,
    sampleData.assay.qc_status, point.time_s, point.response_ru, sampleData.illustrative_estimate.kd,
  ].join(',')));
  const content = format === 'json' ? JSON.stringify(sampleData, null, 2) : `${csvHeader}\r\n${csvRows.join('\r\n')}\r\n`;
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `biodeploy-synthetic-example.${format}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#announcement').textContent = '';
  setTimeout(() => { $('#announcement').textContent = t('exportAnnouncement'); }, 50);
}));

renderLocale();
