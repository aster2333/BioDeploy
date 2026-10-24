import { languages, locales } from './locales.js';
import { sampleData, sampleCsv } from './sample-data.js';
import { calculateDemoQuote, demoCatalog } from './quote.js';

const localeKey = 'biodeploy.locale';
const state = { locale: 'en', stage: 'input', region: 'cn', package: 'expression', candidate: 'binder_001', dataView: 'raw', milestone: 0, apiView: 'request' };
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
  $('#dialog-depth').textContent = prefix === 'expression' ? t('expressionDepth') : `${t('screeningDepth')} / ${t('affinityDepth')}`;
  $('#dialog-days').textContent = `${prefix === 'expression' ? '14–21' : '14–28'} ${t('days')}`;
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
  renderExperience();
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
matchMedia('(min-width: 1101px)').addEventListener('change', ({ matches }) => {
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

// Local-only product previews. All state is independent of language and region.
const number = (value) => new Intl.NumberFormat(state.locale, { maximumFractionDigits: 2 }).format(value);
const money = (cents) => new Intl.NumberFormat(state.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(cents / 100);
const outcomeKeys = { binder: 'outcomeBinder', negative: 'outcomeNegative', unexpressed: 'outcomeUnexpressed', flagged: 'outcomeFlagged' };
const fitChart = $('.results-chart').cloneNode(true);
fitChart.querySelector('#chart-candidate').removeAttribute('id');
fitChart.querySelector('svg').removeAttribute('data-i18n-aria');
$('#fit-chart-mount').append(fitChart);

function drawTraces(container, traces) {
  container.querySelectorAll('.data-trace').forEach((path, index) => {
    const trace = traces[index];
    path.setAttribute('d', trace ? trace.points.map(({ time_s, response_ru }, point) => `${point ? 'L' : 'M'}${(35 + time_s / 210 * 500).toFixed(2)},${(120 - response_ru * 7 / 6).toFixed(2)}`).join(' ') : '');
  });
}

function renderResults() {
  const candidate = sampleData.candidates.find(({ id }) => id === state.candidate);
  const status = t(outcomeKeys[candidate.outcome]);
  $('#candidate-select').value = state.candidate;
  const rawContainer = $('#data-raw .results-chart');
  rawContainer.querySelector('.chart-caption .mono').textContent = candidate.id;
  fitChart.querySelector('.chart-caption .mono').textContent = candidate.id;
  fitChart.querySelector('svg').setAttribute('aria-label', t('chartAria'));
  drawTraces(rawContainer, candidate.raw_traces);
  drawTraces(fitChart, candidate.fitted_traces);
  $('#data-raw .results-layout').hidden = candidate.raw_traces.length === 0;
  $('#measurement-empty').hidden = candidate.raw_traces.length !== 0;
  $('#data-raw .trace-legend').hidden = candidate.raw_traces.length === 0;
  fitChart.hidden = candidate.fitted_traces.length === 0;
  $('#fit-unavailable').hidden = candidate.fitted_traces.length !== 0;
  $('#candidate-kd').textContent = candidate.illustrative_estimate.kd === null ? '—' : `${number(candidate.illustrative_estimate.kd)} nM`;
  $('#candidate-outcome').textContent = status;
  $('#candidate-reason').textContent = t(candidate.reason_key);
  $('#candidate-reason').dataset.outcome = candidate.outcome;
  $('#qc-status').textContent = status;
  $('#qc-mae').textContent = candidate.qc.mae_ru === null ? '—' : `${number(candidate.qc.mae_ru)} RU`;
  $('#qc-protocol').textContent = `${candidate.provenance.protocol_id} / v${candidate.provenance.protocol_version}`;
  $('#qc-batch').textContent = `${candidate.provenance.batch_id} / ${candidate.provenance.lab_id}`;
  $$('[data-view]').forEach((button) => {
    const selected = button.dataset.view === state.dataView;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    $(`#data-${button.dataset.view}`).hidden = !selected;
  });
  const rows = sampleData.candidates.map((item) => {
    const row = document.createElement('tr');
    row.classList.toggle('selected', item.id === candidate.id);
    const nameCell = document.createElement('th');
    nameCell.scope = 'row';
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.candidate = item.id;
    button.textContent = item.id;
    button.setAttribute('aria-pressed', String(item.id === candidate.id));
    nameCell.append(button);
    row.append(nameCell);
    for (const value of [t(item.expression === 'detected' ? 'detected' : 'notDetected'), t(outcomeKeys[item.outcome]), item.illustrative_estimate.kd === null ? '—' : number(item.illustrative_estimate.kd)]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    return row;
  });
  $('#candidate-rows').replaceChildren(...rows);
}
$('#candidate-select').addEventListener('change', (event) => { state.candidate = event.target.value; renderResults(); });
$('#candidate-rows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-candidate]');
  if (!button) return;
  state.candidate = button.dataset.candidate;
  renderResults();
  $('#candidate-select').focus({ preventScroll: true });
});
const dataButtons = $$('[data-view]');
dataButtons.forEach((button) => {
  const activate = (target) => { state.dataView = target.dataset.view; renderResults(); };
  button.addEventListener('click', () => activate(button));
  button.addEventListener('keydown', (event) => activateTabWithKeys(event, dataButtons, activate));
});

const quoteForm = $('#quote-form');
function currentQuote() {
  return calculateDemoQuote({ mode: $('#quote-mode').value, quantity: $('#quote-quantity').valueAsNumber, replicates: Number($('#quote-replicates').value), targets: Number($('#quote-targets').value) });
}
function renderQuote() {
  const mode = $('#quote-mode').value;
  const expression = mode === 'expression';
  $('#quote-targets').disabled = expression;
  if (expression) $('#quote-targets').value = '1';
  $('#quote-scope').textContent = t(demoCatalog[mode].scopeKey);
  const quote = currentQuote();
  const error = $('#quantity-error');
  error.hidden = quote.valid;
  error.textContent = quote.valid ? '' : t(quote.errorKey);
  $('#quote-quantity').setAttribute('aria-invalid', String(!quote.valid));
  $('#save-estimate').disabled = !quote.valid;
  $$('[data-quantity]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.quantity) === $('#quote-quantity').valueAsNumber)));
  for (const [selector, key] of [['#quote-unit','unit_cents'],['#quote-base','base_cents'],['#quote-extra','extra_replicate_cents'],['#quote-total','total_cents']]) $(selector).textContent = quote.valid ? money(quote[key]) : '—';
  $('#quote-days').textContent = `${demoCatalog[mode].days.join('–')} ${t('days')}`;
  $('#quote-formula').textContent = quote.valid ? `${number(quote.configuration.quantity)} × ${money(quote.unit_cents)} × ${number(quote.configuration.targets)} + ${money(quote.extra_replicate_cents)}` : '';
}
quoteForm.addEventListener('submit', (event) => event.preventDefault());
quoteForm.addEventListener('input', renderQuote);
quoteForm.addEventListener('change', renderQuote);
$$('[data-quantity]').forEach((button) => button.addEventListener('click', () => { $('#quote-quantity').value = button.dataset.quantity; renderQuote(); }));
$('#dialog-configure').addEventListener('click', () => {
  $('#quote-mode').value = state.package === 'expression' ? 'expression' : 'screening';
  renderQuote();
  dialog.close();
  // Wait for the native close event's opener restoration before focusing the destination.
  dialog.addEventListener('close', () => {
    $('#pricing-heading').tabIndex = -1;
    $('#pricing-heading').focus({ preventScroll: true });
  }, { once: true });
});

const milestoneNames = ['Scope', 'Materials', 'Expression', 'Measurement', 'Release'];
const milestoneWindows = ['0', '1–5', '6–10', '11–15', '16–21'];
function renderMilestone() {
  const index = state.milestone;
  $('#milestone-title').textContent = t(`milestone${milestoneNames[index]}`);
  $('#milestone-copy').textContent = t(`milestone${milestoneNames[index]}Copy`);
  $('#milestone-owner').textContent = t(index === 0 ? 'scopeOwner' : index === 4 ? 'releaseOwner' : 'labOwner');
  $('#milestone-window').textContent = `${milestoneWindows[index]} ${t('days')}`;
  $('#milestone-detail').setAttribute('aria-labelledby', `milestone-${index}`);
  $$('[data-milestone]').forEach((button) => {
    const selected = Number(button.dataset.milestone) === index;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}
const milestoneButtons = $$('[data-milestone]');
milestoneButtons.forEach((button) => {
  const activate = (target) => { state.milestone = Number(target.dataset.milestone); renderMilestone(); };
  button.addEventListener('click', () => activate(button));
  button.addEventListener('keydown', (event) => activateTabWithKeys(event, milestoneButtons, activate));
});

const apiExamples = {
  request: `POST https://api.biodeploy.example/v1/experiments\n\n{\n  "schema_version": "0.2",\n  "demo": true,\n  "package": "binding_screening",\n  "sequence_refs": ["binder_001", "binder_002"],\n  "budget": { "currency": "USD", "limit": 1500 },\n  "requires_confirmation": true\n}`,
  event: JSON.stringify({ schema_version: '0.2', demo: true, event: 'results.example', data: { synthetic: true, candidate: 'binder_004', binding: 'unknown', kd_nM: null, reason: 'fit_qc_review', protocol_id: 'DEMO-SPR-01', qc: { synthetic: true, status: 'review_example' } } }, null, 2),
};
function renderApi() {
  $('#api-code').textContent = apiExamples[state.apiView];
  $('#api-code-panel').setAttribute('aria-labelledby', `api-${state.apiView}`);
  $$('[data-api-view]').forEach((button) => {
    const selected = button.dataset.apiView === state.apiView;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}
const apiButtons = $$('[data-api-view]');
apiButtons.forEach((button) => {
  const activate = (target) => { state.apiView = target.dataset.apiView; renderApi(); };
  button.addEventListener('click', () => activate(button));
  button.addEventListener('keydown', (event) => activateTabWithKeys(event, apiButtons, activate));
});

function downloadLocal(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function announce(key) {
  $('#announcement').textContent = '';
  setTimeout(() => { $('#announcement').textContent = t(key); }, 50);
}
$('#save-estimate').addEventListener('click', () => {
  const quote = currentQuote();
  if (!quote.valid) return;
  downloadLocal(JSON.stringify(quote, null, 2), 'biodeploy-demo-estimate.json', 'application/json');
  announce('estimateSaved');
});
$$('[data-export]').forEach((button) => button.addEventListener('click', () => {
  const json = button.dataset.export === 'json';
  downloadLocal(json ? JSON.stringify(sampleData, null, 2) : sampleCsv(), `biodeploy-synthetic-example.${json ? 'json' : 'csv'}`, json ? 'application/json' : 'text/csv;charset=utf-8');
  announce('exportAnnouncement');
}));
function renderExperience() { renderQuote(); renderResults(); renderMilestone(); renderApi(); }
renderLocale();
