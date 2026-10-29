import { initNavigation } from './navigation.js';
import { renderKineticsChart, renderConcentrationLegend } from './kinetics-chart.js';
import { createNetworkGlobe } from './network-globe.js';
import { languages, locales } from './locales.js';
import { sampleData, sampleCsv } from './sample-data.js';
import { initQuoteFlow } from './quote-flow.js';
import { createFeedback, createDownloadManager, createOutcomeBadge } from './ui-feedback.js';

const localeKey = 'biodeploy.locale';
const state = { locale: 'en', stage: 'input', region: 'ch', package: 'kinetics', candidate: 'enzyme_001', dataView: 'raw', milestone: 0, apiView: 'request' };
try {
  const saved = localStorage.getItem(localeKey);
  if (Object.hasOwn(locales, saved)) state.locale = saved;
} catch { /* A blocked storage policy must not prevent language selection. */ }

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const t = (key) => locales[state.locale][key];
const localeTrigger = $('#locale-trigger');
const localeMenu = $('#locale-menu');
const navigation = initNavigation({ beforeOpen: () => closeLocale() });
const dialog = $('#package-dialog');
const feedback = createFeedback({ root: $('#ui-feedback'), t });
const downloads = createDownloadManager({ feedback });
let dialogOpener;

const heroLine = $('#hero-rotating-line');
const heroMotion = matchMedia('(prefers-reduced-motion: reduce)');
let heroTimer;

function renderHero() {
  clearTimeout(heroTimer);
  heroLine.classList.toggle('hero-static', heroMotion.matches);
  if (heroMotion.matches) {
    heroLine.textContent = t('heroStaticLine');
    return;
  }

  const words = ['heroProtein', 'heroMolecule', 'heroSequence'].map(t);
  const slot = document.createElement('span');
  slot.className = 'hero-word';
  const text = document.createElement('span');
  text.id = 'hero-word-text';
  slot.append(text);
  const suffix = document.createElement('span');
  suffix.textContent = t('heroSuffix');
  heroLine.replaceChildren(slot, suffix);

  let index = 0;
  let length = 0;
  let deleting = false;
  function tick() {
    const letters = Array.from(words[index]);
    length += deleting ? -1 : 1;
    text.textContent = letters.slice(0, length).join('');
    let delay = deleting ? 65 : 130;
    if (length === letters.length && !deleting) {
      deleting = true;
      delay = 1800;
    } else if (length === 0 && deleting) {
      deleting = false;
      index = (index + 1) % words.length;
      delay = 300;
    }
    heroTimer = setTimeout(tick, delay);
  }
  if (!document.hidden) heroTimer = setTimeout(tick, 250);
}
heroMotion.addEventListener('change', renderHero);
document.addEventListener('visibilitychange', renderHero);

const proteinScene = $('.protein-scene');
let proteinSceneVisible = true;
function syncProteinScene() {
  proteinScene.classList.toggle('is-still', document.hidden || !proteinSceneVisible);
}
new IntersectionObserver(([entry]) => {
  proteinSceneVisible = entry.isIntersecting;
  syncProteinScene();
}).observe(proteinScene);
document.addEventListener('visibilitychange', syncProteinScene);


function renderDialog() {
  const prefix = state.package;
  $('#dialog-inputs').textContent = t(`${prefix}Inputs`);
  $('#dialog-code').textContent = { kinetics: 'KIN-01', matrix: 'MTX-01', expressionQc: 'EXP-QC' }[prefix];
  for (const [id, suffix] of [['title', 'Name'], ['description', 'Description'], ['method', 'Method'], ['output', 'Output'], ['depth', 'Depth']]) {
    $(`#dialog-${id}`).textContent = t(`${prefix}${suffix}`);
  }
  $('#dialog-replicates').textContent = t(prefix === 'expressionQc' ? 'packageSingleCulture' : 'packageTechnicalTriplicates');
  $('#dialog-days').textContent = t('packageSchedule');
}

const networkGlobe = createNetworkGlobe(document.querySelector('#network-globe'));

function renderRegion() {
  const regions = {
    ch: ['CH / EUROPE', 'regionChCopy', t('supplierPending')],
    sg: ['SG / APAC', 'regionSgCopy', 'GenScript'],
    us: ['US / AMERICAS', 'regionUsCopy', 'Twist Bioscience'],
    cn: ['CN / APAC', 'regionCnCopy', t('supplierPending')],
  };
  const [code, key, supplier] = regions[state.region];
  $('.region-code').textContent = code;
  $('#region-copy').textContent = t(key);
  $('#region-copy').dataset.i18n = key;
  $('#region-supplier').textContent = supplier;
  const badge = $('#region-status');
  badge.dataset.i18n = ['cn', 'ch'].includes(state.region) ? 'supplierUpcoming' : 'supplierLabel';
  badge.textContent = t(badge.dataset.i18n);
  networkGlobe?.select(state.region);
  $('#region-description').setAttribute('aria-labelledby', `region-${state.region}`);
  $$('[data-region]').forEach((button) => {
    const selected = button.dataset.region === state.region;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function renderLocale() {
  document.documentElement.lang = state.locale;
  document.title = t('pageTitle');
  $('meta[name="description"]').content = t('pageDescription');
  $$('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-aria]').forEach((element) => element.setAttribute('aria-label', t(element.dataset.i18nAria)));
  renderHero();
  const language = languages.find(({ code }) => code === state.locale);
  $('#locale-label').textContent = language.name;
  $('#locale-label').lang = state.locale;
  localeTrigger.setAttribute('aria-label', `${t('chooseLanguage')}: ${language.name}`);
  $$('input[name="locale"]').forEach((input) => { input.checked = input.value === state.locale; });
  renderRegion();
  renderDialog();
  renderExperience();
  feedback.render();
}

function closeLocale(restoreFocus = false) {
  localeMenu.hidden = true;
  localeTrigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) localeTrigger.focus();
}

localeTrigger.addEventListener('click', () => {
  navigation.close();
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
  }
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
const outcomeKeys = { active: 'outcomeActive', negative: 'outcomeNegative', unexpressed: 'outcomeUnexpressed', flagged: 'outcomeFlagged' };
const scientificNumber = (value) => new Intl.NumberFormat(state.locale, { maximumSignificantDigits: 4 }).format(value);
const parameterText = (value, unit = '') => value === null ? '—' : `${scientificNumber(value)}${unit ? ` ${unit}` : ''}`;

function renderResults() {
  const candidate = sampleData.candidates.find(({ id }) => id === state.candidate);
  $('#candidate-select').value = state.candidate;
  $('#chart-candidate').textContent = candidate.id;
  $('#fit-candidate').textContent = candidate.id;
  renderKineticsChart($('#raw-kinetics-chart'), candidate, 'raw', t, scientificNumber);
  renderKineticsChart($('#fit-kinetics-chart'), candidate, 'fit', t, scientificNumber);
  renderKineticsChart($('#hero-kinetics-chart'), sampleData.candidates[0], 'fit', t, scientificNumber);
  renderConcentrationLegend($('#concentration-legend'), sampleData.assay.substrate_concentrations_uM, scientificNumber);
  const measured = candidate.raw_traces.length > 0;
  const fitted = candidate.fitted_curve.length > 0;
  $('#data-raw .results-layout').hidden = !measured;
  $('#measurement-empty').hidden = measured;
  $('#data-raw .trace-legend').hidden = !measured;
  $('#concentration-legend').hidden = !measured;
  $('#fit-chart-mount').hidden = !fitted;
  $('#fit-unavailable').hidden = fitted;
  $('#candidate-kcat').textContent = parameterText(candidate.fitted_parameters.kcat_s_1, 's⁻¹');
  for (const [id, key, unit] of [['parameter-km', 'km_uM', 'µM'], ['parameter-vmax', 'vmax_uM_s', 'µM/s'], ['parameter-kcat', 'kcat_s_1', 's⁻¹'], ['parameter-efficiency', 'catalytic_efficiency_M_1_s_1', 'M⁻¹ s⁻¹'], ['parameter-r2', 'r_squared', ''], ['parameter-km-se', 'km_se_uM', 'µM']]) {
    $(`#${id}`).textContent = parameterText(candidate.fitted_parameters[key], unit);
  }
  $('#candidate-outcome').replaceChildren(createOutcomeBadge(candidate.outcome, t));
  $('#candidate-reason').textContent = t(candidate.reason_key);
  const emptyView = (state.dataView === 'raw' && !measured) || (state.dataView === 'fit' && !fitted);
  $('#candidate-reason').hidden = candidate.outcome === 'active' || emptyView;
  $('#candidate-reason').dataset.outcome = candidate.outcome;
  $('#qc-status').replaceChildren(createOutcomeBadge(candidate.outcome, t));
  $('#measurement-empty-reason').textContent = t(candidate.reason_key);
  $('#fit-empty-reason').textContent = t(candidate.reason_key);
  $('#fit-show-raw').hidden = !measured;
  $('#qc-rmse').textContent = parameterText(candidate.qc.fit_rmse_uM_s, 'µM/s');
  $('#qc-protocol').textContent = `${candidate.provenance.protocol_id} / v${candidate.provenance.protocol_version}`;
  $('#qc-batch').textContent = `${candidate.provenance.batch_id} / ${candidate.provenance.lab_id}`;
  $('#qc-conditions').textContent = `pH ${scientificNumber(sampleData.assay.pH)} · ${scientificNumber(sampleData.assay.temperature_C)} °C`;
  $('#qc-buffer').textContent = t('kinBufferValue');
  $('#qc-enzyme').textContent = parameterText(candidate.active_enzyme_concentration_uM, 'µM');
  $('#qc-depletion').textContent = parameterText(candidate.qc.max_substrate_depletion_percent, '%');
  $('#qc-limit').textContent = parameterText(candidate.qc.rate_detection_limit_uM_s, 'µM/s');
  $('#qc-cv').textContent = parameterText(candidate.qc.max_replicate_cv_percent, '%');
  $('#qc-controls').textContent = t('kinControls');
  $('#qc-flags').textContent = candidate.outcome === 'active' ? t('kinQcPass') : t(candidate.reason_key);
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
    for (const [index, value] of [t(item.expression === 'detected' ? 'detected' : 'notDetected'), t(outcomeKeys[item.outcome]), parameterText(item.fitted_parameters.kcat_s_1), parameterText(item.fitted_parameters.km_uM), parameterText(item.fitted_parameters.r_squared)].entries()) {
      const cell = document.createElement('td');
      if (index === 1) cell.append(createOutcomeBadge(item.outcome, t));
      else cell.textContent = value;
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

$$('[data-result-recovery]').forEach((button) => button.addEventListener('click', () => {
  state.dataView = button.dataset.resultRecovery;
  renderResults();
  $(`#view-${state.dataView}`).focus({ preventScroll: true });
}));

const quoteFlow = initQuoteFlow({ t, money, number, downloads, announce });
$('#dialog-configure').addEventListener('click', () => {
  quoteFlow.configure(state.package);
  dialog.close();
  // Wait for the native close event's opener restoration before focusing the destination.
  dialog.addEventListener('close', () => {
    $('#pricing-heading').tabIndex = -1;
    $('#pricing-heading').focus({ preventScroll: true });
  }, { once: true });
});

const milestoneNames = ['Scope', 'Materials', 'Expression', 'Measurement', 'Release'];
const milestoneWindows = ['0', '1-5', '6-10', '11-15', '16-21'];
const workflow = $('#workflow');
const milestoneButtons = $$('[data-milestone]');
const workflowMotion = matchMedia('(prefers-reduced-motion: reduce)');
const milestoneDuration = 4200;
let workflowPaused = workflowMotion.matches;
let workflowVisible = false;
let milestoneTimer;
let milestoneProgress;
let renderedMilestone;

function renderMilestone() {
  const index = state.milestone;
  if (renderedMilestone !== undefined && renderedMilestone !== index && !workflowMotion.matches) {
    $('#milestone-detail').animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
  }
  renderedMilestone = index;
  $('#milestone-title').textContent = t(`milestone${milestoneNames[index]}`);
  $('#milestone-copy').textContent = t(`milestone${milestoneNames[index]}Copy`);
  $('#milestone-owner').textContent = t(index === 0 ? 'scopeOwner' : index === 4 ? 'releaseOwner' : 'labOwner');
  $('#milestone-window').textContent = t('dayWindow').replace('{days}', milestoneWindows[index]);
  $('#milestone-number').textContent = String(index + 1).padStart(2, '0');
  $('#milestone-detail').setAttribute('aria-labelledby', `milestone-${index}`);
  milestoneButtons.forEach((button) => {
    const selected = Number(button.dataset.milestone) === index;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  $$('[data-orbit-step]').forEach((arc) => arc.classList.toggle('active', Number(arc.dataset.orbitStep) === index));
  $('#workflow-play').setAttribute('aria-pressed', String(workflowPaused));
  $('#workflow-play-label').textContent = t(workflowPaused ? 'workflowPlay' : 'workflowPause');
  $('.workflow-play-icon').textContent = workflowPaused ? '▷' : 'Ⅱ';
  scheduleMilestone();
}

function scheduleMilestone() {
  clearTimeout(milestoneTimer);
  milestoneProgress?.cancel();
  const running = workflowVisible && !document.hidden && !workflowPaused && !$('.milestones').contains(document.activeElement);
  $('.workflow-orbit').classList.toggle('is-paused', !running);
  if (!running) return;
  milestoneProgress = $('.workflow-dwell span').animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: milestoneDuration, fill: 'forwards' });
  milestoneTimer = setTimeout(() => {
    state.milestone = (state.milestone + 1) % milestoneNames.length;
    renderMilestone();
  }, milestoneDuration);
}

milestoneButtons.forEach((button) => {
  const activate = (target) => {
    state.milestone = Number(target.dataset.milestone);
    renderMilestone();
  };
  button.addEventListener('click', () => activate(button));
  button.addEventListener('keydown', (event) => activateTabWithKeys(event, milestoneButtons, activate));
});
$('.milestones').addEventListener('focusin', scheduleMilestone);
$('.milestones').addEventListener('focusout', () => requestAnimationFrame(scheduleMilestone));
$('#workflow-play').addEventListener('click', () => {
  workflowPaused = !workflowPaused;
  renderMilestone();
});
workflowMotion.addEventListener('change', () => {
  workflowPaused = workflowMotion.matches;
  renderMilestone();
});
document.addEventListener('visibilitychange', scheduleMilestone);
new IntersectionObserver(([entry]) => {
  workflowVisible = entry.isIntersecting;
  scheduleMilestone();
}, { threshold: .25 }).observe(workflow);

const apiExamples = {
  request: `POST https://api.biodeploy.example/v1/experiments\n\n${JSON.stringify({ schema_version: '1.0', demo: true, package: 'enzyme_kinetics', sequence_refs: ['enzyme_001', 'enzyme_002'], substrate_id: sampleData.input.substrate_id, substrate_concentrations_uM: sampleData.assay.substrate_concentrations_uM, technical_replicates: 3, pH: sampleData.assay.pH, temperature_C: sampleData.assay.temperature_C, requires_confirmation: true }, null, 2)}`,
  event: JSON.stringify({ schema_version: sampleData.schema_version, demo: true, event: 'enzyme_kinetics.results.example', data: { synthetic: true, candidate: sampleData.candidates[3].id, activity: sampleData.candidates[3].activity, fitted_parameters: sampleData.candidates[3].fitted_parameters, reason: 'nonlinear_initial_rate_window', protocol_id: sampleData.candidates[3].provenance.protocol_id, qc: sampleData.candidates[3].qc } }, null, 2),
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

function announce(key) { feedback.show(key); }
$$('[data-export]').forEach((button) => button.addEventListener('click', () => {
  const json = button.dataset.export === 'json';
  downloads.run({
    content: () => json ? JSON.stringify(sampleData, null, 2) : sampleCsv(),
    filename: `biodeploy-synthetic-enzyme-kinetics.${json ? 'json' : 'csv'}`,
    type: json ? 'application/json' : 'text/csv;charset=utf-8',
    button,
    successKey: 'stateDownloadStarted',
  });
}));
function renderExperience() { quoteFlow.render(); renderResults(); renderMilestone(); renderApi(); }
renderLocale();
