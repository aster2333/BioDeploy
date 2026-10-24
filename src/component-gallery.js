import { languages, locales } from './locales.js';
import { sampleData } from './sample-data.js';
import { validateInquiryEmail } from './inquiry.js';
import { createFeedback, createDownloadManager, createOutcomeBadge } from './ui-feedback.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let locale = 'en';
try { const saved = localStorage.getItem('biodeploy.locale'); if (Object.hasOwn(locales, saved)) locale = saved; } catch { /* This reference works without storage. */ }
const t = (key) => locales[locale][key];
const feedback = createFeedback({ root: $('#ui-feedback'), t });
const downloads = createDownloadManager({ feedback });
const selected = new Set();
// Reuse the scientific examples without modifying the production dataset.
const rows = Array.from({ length: 12 }, (_, i) => ({ ...sampleData.candidates[i % 4], id: `binder_${String(i + 1).padStart(3, '0')}` }));
let emailTouched = false;

function renderEmail() {
  const valid = validateInquiryEmail($('#example-email').value);
  $('#example-email').setAttribute('aria-invalid', String(emailTouched && !valid));
  $('#example-email-error').hidden = !emailTouched || valid;
  $('#example-email-error').textContent = t('inquiryEmailError');
  $('#example-email-success').hidden = !emailTouched || !valid;
  $('#example-email-success').textContent = t('componentsEmailValid');
}
function visibleRows() {
  const query = $('#sample-search').value.trim().toLowerCase();
  const filter = $('#sample-outcome').value;
  return rows.filter((row) => row.id.includes(query) && (filter === 'all' || row.outcome === filter)).sort((a, b) => $('#sample-sort').value === 'kd' ? (a.illustrative_estimate.kd ?? Infinity) - (b.illustrative_estimate.kd ?? Infinity) || a.id.localeCompare(b.id) : a.id.localeCompare(b.id));
}
function renderTable() {
  const visible = visibleRows();
  const ready = $('#sample-view').value === 'ready';
  const all = $('#sample-select-all');
  const visibleSelected = visible.filter((row) => selected.has(row.id)).length;
  all.checked = visible.length > 0 && visibleSelected === visible.length;
  all.indeterminate = visibleSelected > 0 && visibleSelected < visible.length;
  all.disabled = !visible.length || !ready;
  const exportButton = $('#sample-export');
  exportButton.dataset.disabledByState = String(selected.size === 0 || !ready);
  exportButton.disabled = selected.size === 0 || !ready || exportButton.dataset.downloadBusy === 'true';
  $('#sample-clear-selection').disabled = !selected.size;
  $('#sample-selected-count').textContent = t('componentsSelected').replace('{count}', new Intl.NumberFormat(locale).format(selected.size));
  $('#sample-count').textContent = t('componentsMatches').replace('{count}', new Intl.NumberFormat(locale).format(visible.length));
  $('#sample-count').hidden = !ready;
  $('#sample-table-scroll').hidden = !ready || visible.length === 0;
  $('#sample-empty').hidden = !ready || visible.length !== 0;
  $('#sample-loading').hidden = $('#sample-view').value !== 'loading';
  $('#sample-error').hidden = $('#sample-view').value !== 'error';
  $('#sample-container').setAttribute('aria-busy', String($('#sample-view').value === 'loading'));
  const focusedId = document.activeElement?.dataset.rowId;
  $('#sample-table-body').replaceChildren(...visible.map((row) => {
    const tr = document.createElement('tr');
    tr.dataset.selected = String(selected.has(row.id));
    const selection = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'checkbox'; input.dataset.rowId = row.id; input.checked = selected.has(row.id);
    input.setAttribute('aria-label', t('componentsSelectRow').replace('{id}', row.id));
    selection.append(input); tr.append(selection);
    const id = document.createElement('th'); id.scope = 'row'; id.textContent = row.id; tr.append(id);
    const outcome = document.createElement('td'); outcome.append(createOutcomeBadge(row.outcome, t)); tr.append(outcome);
    for (const value of [row.illustrative_estimate.kd === null ? '—' : new Intl.NumberFormat(locale).format(row.illustrative_estimate.kd), `${row.provenance.batch_id} / ${row.provenance.lab_id}`]) {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    }
    return tr;
  }));
  if (focusedId) $$('[data-row-id]').find((input) => input.dataset.rowId === focusedId)?.focus({ preventScroll: true });
}
function renderLocale() {
  document.documentElement.lang = locale;
  document.title = `Biodeploy · ${t('componentsTitle')}`;
  $$('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-aria]').forEach((element) => element.setAttribute('aria-label', t(element.dataset.i18nAria)));
  $('#gallery-language').value = locale;
  $('#gallery-language').setAttribute('aria-label', t('chooseLanguage'));
  for (const id of ['light-badges', 'dark-badges']) $(`#${id}`).replaceChildren(...['binder', 'negative', 'unexpressed', 'flagged'].map((outcome) => createOutcomeBadge(outcome, t)));
  feedback.render(); renderEmail(); renderTable();
}
$('#gallery-language').addEventListener('change', (event) => { if (languages.some((item) => item.code === event.target.value)) locale = event.target.value; renderLocale(); });
$('#example-email-form').addEventListener('submit', (event) => { event.preventDefault(); emailTouched = true; renderEmail(); if (!validateInquiryEmail($('#example-email').value)) $('#example-email').focus(); });
$('#example-email').addEventListener('blur', () => { emailTouched = true; renderEmail(); });
$('#example-email').addEventListener('input', renderEmail);
for (const id of ['example-primary', 'example-secondary']) $(`#${id}`).addEventListener('click', () => feedback.show('componentsStateNote'));
$('#example-show-raw').addEventListener('click', () => { $('#example-raw-note').hidden = false; feedback.show('componentsStateNote'); });
function downloadSample(button, exerciseFailure = false) {
  let failOnce = exerciseFailure;
  return downloads.run({ button, filename: 'biodeploy-component-sample.json', type: 'application/json', content: () => {
    if (failOnce) { failOnce = false; throw new Error('Explicit component failure exercise'); }
    return JSON.stringify(sampleData, null, 2);
  } });
}
$('#example-download').addEventListener('click', (event) => downloadSample(event.currentTarget));
$('#example-failure').addEventListener('click', (event) => downloadSample(event.currentTarget, true));
for (const id of ['sample-search', 'sample-outcome', 'sample-sort', 'sample-view']) $(`#${id}`).addEventListener(id === 'sample-search' ? 'input' : 'change', renderTable);
$('#sample-table-body').addEventListener('change', (event) => {
  const id = event.target.dataset.rowId;
  if (!id) return;
  if (event.target.checked) selected.add(id); else selected.delete(id);
  renderTable();
});
$('#sample-select-all').addEventListener('change', (event) => {
  for (const row of visibleRows()) { if (event.target.checked) selected.add(row.id); else selected.delete(row.id); }
  renderTable();
});
$('#sample-clear-selection').addEventListener('click', () => { selected.clear(); renderTable(); $('#sample-select-all').focus(); });
$('#sample-clear-filters').addEventListener('click', () => { $('#sample-search').value = ''; $('#sample-outcome').value = 'all'; renderTable(); $('#sample-search').focus(); });
$('#sample-retry').addEventListener('click', () => { $('#sample-view').value = 'ready'; renderTable(); $('#sample-view').focus(); });
$('#sample-export').addEventListener('click', (event) => downloads.run({ button: event.currentTarget, filename: 'biodeploy-selected-samples.json', type: 'application/json', content: () => {
  if (!selected.size) throw new Error('No selection');
  return JSON.stringify({ ...sampleData, candidates: rows.filter((row) => selected.has(row.id)) }, null, 2);
} }));
const dialog = $('#example-dialog');
$('#example-open-dialog').addEventListener('click', () => { dialog.showModal(); document.body.classList.add('dialog-open'); });
$('#example-close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); $('#example-open-dialog').focus({ preventScroll: true }); });
renderLocale();
