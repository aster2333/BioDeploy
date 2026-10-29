import { calculateDemoQuote, demoCatalog, substrateCatalog, stageOnePricing } from './quote.js';
import { createDemoInquiry, validateInquiryEmail } from './inquiry.js';

export function initQuoteFlow({ t, money, number, downloads, announce }) {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const form = $('#quote-form');
  $('#quote-substrate').replaceChildren(...substrateCatalog.map(({ id, label }) => new Option(label, id)));
  let step = 0;
  let reached = 0;
  let emailTouched = false;
  let draft = null;
  let activeService = form.elements.service.value;
  const service = () => form.elements.service.value;
  const mode = service;
  const settings = Object.fromEntries(Object.keys(demoCatalog).map((key) => [key, { quantity: '96', panels: '1', tier: 'standard', passed: '96', substrate: 'pnpa' }]));
  const configuration = () => ({ mode: mode(), quantity: $('#quote-quantity').valueAsNumber, panels: Number($('#quote-panels').value), tier: $('#quote-tier').value, passedQuantity: $('#quote-passed').valueAsNumber, substrateId: $('#quote-substrate').value });
  const currentQuote = () => calculateDemoQuote(configuration());
  const batch = () => t('newBatchCount').replace('{count}', number($('#quote-quantity').valueAsNumber));

  function rememberService() {
    for (const key of ['quantity', 'panels', 'tier', 'passed', 'substrate']) settings[activeService][key] = $(`#quote-${key}`).value;
  }
  function restoreService() {
    for (const key of ['quantity', 'panels', 'tier', 'passed', 'substrate']) $(`#quote-${key}`).value = settings[service()][key];
    activeService = service();
  }

  function emailError() {
    const invalid = emailTouched && !validateInquiryEmail($('#inquiry-email').value);
    $('#email-error').hidden = !invalid;
    $('#email-error').textContent = invalid ? t('inquiryEmailError') : '';
    $('#inquiry-email').setAttribute('aria-invalid', String(invalid));
    return !invalid;
  }

  function render() {
    const matrix = service() === 'matrix';
    const expression = service() === 'expressionQc';
    $('#quote-passed-field').hidden = expression;
    $('#quote-passed').max = $('#quote-quantity').value;
    const quote = currentQuote();
    const entry = demoCatalog[mode()];
    $('#quote-panel-field').hidden = !matrix;
    $('#quote-panels').disabled = !matrix;
    $('#quote-replicates').textContent = t(expression ? 'packageSingleCulture' : 'packageTechnicalTriplicates');
    $('#quote-price-basis').textContent = t(`${mode()}Basis`);
    $('#quote-scope').textContent = `${t(`${mode()}Inputs`)} ${t(entry.scopeKey)} ${t(`${mode()}Output`)}`;
    const errorFields = { newInvalidQuantity: 'quote-quantity', newInvalidPanels: 'quote-panels', newInvalidTier: 'quote-tier', invalidPassedQuantity: 'quote-passed', invalidSubstrate: 'quote-substrate' };
    const invalidField = quote.valid ? null : errorFields[quote.errorKey];
    const error = $('#quantity-error');
    error.hidden = quote.valid;
    error.textContent = quote.valid ? '' : t(quote.errorKey);
    for (const id of ['quote-quantity', 'quote-panels', 'quote-tier', 'quote-passed', 'quote-substrate']) {
      const field = $(`#${id}`);
      field.setAttribute('aria-invalid', String(id === invalidField));
    }
    if (invalidField) {
      const field = $(`#${invalidField}`);
      (field.closest('.quantity-line') || field).insertAdjacentElement('afterend', error);
    }
    const validQuantity = Number.isInteger($('#quote-quantity').valueAsNumber) && $('#quote-quantity').valueAsNumber >= 24 && $('#quote-quantity').valueAsNumber <= 384;
    if (validQuantity) $('#quote-quantity-slider').value = $('#quote-quantity').value;
    $('#quote-quantity-slider').setAttribute('aria-invalid', String(invalidField === 'quote-quantity'));
    for (const id of ['save-estimate', 'quote-review', 'quote-contact', 'preview-inquiry']) {
      const button = $(`#${id}`);
      button.dataset.disabledByState = String(!quote.valid);
      button.disabled = !quote.valid || button.dataset.downloadBusy === 'true';
    }
    $$('[data-quantity]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.quantity) === $('#quote-quantity').valueAsNumber)));
    $$('[data-base-price]').forEach((element) => { element.textContent = money(demoCatalog[element.dataset.basePrice].baseUnitCents); });
    for (const [selector, key] of [['#quote-unit', 'unit_cents'], ['#quote-base', 'stage_two_cents'], ['#quote-synthesis', 'synthesis_cents'], ['#quote-gate', 'protein_gate_cents'], ['#quote-extra', 'rush_cents'], ['#quote-total', 'total_cents'], ['#contact-total', 'total_cents']]) {
      $(selector).textContent = quote.valid ? money(quote[key]) : '—';
    }
    $('#quote-unit-label').textContent = t(matrix ? 'newUnitPanel' : expression ? 'newUnitSequence' : 'newUnitVariant');
    $('#quote-base-label').textContent = t('newBase');
    $('#quote-summary-assay').textContent = t(entry.nameKey);
    $('#quote-equation').textContent = quote.valid ? `${batch()} × ${money(stageOnePricing.synthesisUnitCents + stageOnePricing.proteinGateUnitCents)} + ${number(quote.configuration.estimated_passed_quantity)} × ${money(expression ? 0 : quote.unit_cents)}${matrix ? ` × ${number(quote.configuration.panels)}` : ''}` : '—';
    $('#quote-days').textContent = quote.valid ? `${quote.illustrative_days[0]} ${t('days')}` : '—';
    $('#quote-measurement-label').textContent = t(expression ? 'newCultures' : 'newReactionWells');
    $('#quote-measurements').textContent = quote.valid ? number(quote.sample_measurement_count) : '—';
    $('#review-assay').textContent = t(entry.nameKey);
    $('#review-batch').textContent = quote.valid ? `${batch()} · ${t('passedLabel')}: ${number(quote.configuration.estimated_passed_quantity)}` : '—';
    $('#review-replicates').textContent = t(expression ? 'packageSingleCulture' : 'packageTechnicalTriplicates');
    $('#review-panel-row').hidden = !matrix;
    $('#review-panels').textContent = $('#quote-panels').value;
    $('#review-tier').textContent = quote.valid ? t(quote.configuration.tier === 'rush' ? 'newRush' : 'newStandard') : '—';
    $('#review-method').textContent = `${t(entry.methodKey)} · ${substrateCatalog.find((item) => item.id === $('#quote-substrate').value)?.label || ''}`;
    $('#contact-assay').textContent = `${t(entry.nameKey)} · ${quote.valid ? batch() : '—'}`;
    if (draft) {
      $('#inquiry-ready-email').textContent = draft.contact.email;
      $('#inquiry-ready-assay').textContent = t(entry.nameKey);
      $('#inquiry-ready-batch').textContent = batch();
    }
    $('#inquiry-contact-fields').hidden = Boolean(draft);
    $('#inquiry-ready').hidden = !draft;
    $('#quote-panel-2').setAttribute('aria-labelledby', draft ? 'inquiry-ready-heading' : 'contact-heading');
    for (let i = 0; i < 3; i++) $(`#quote-panel-${i}`).hidden = i !== step;
    $$('[data-quote-step]').forEach((button) => {
      const index = Number(button.dataset.quoteStep);
      button.disabled = index > reached || (index > 0 && !quote.valid);
      button.classList.toggle('is-complete', index < step);
      if (index === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    emailError();
  }

  function go(next) {
    if (next > 0 && !currentQuote().valid) return;
    step = next;
    reached = Math.max(reached, next);
    render();
    const heading = $(draft && next === 2 ? '#inquiry-ready-heading' : ['#configure-heading', '#review-heading', '#contact-heading'][next]);
    heading.focus({ preventScroll: true });
    $('#pricing').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  function update(event) {
    if (activeService !== service()) {
      rememberService();
      restoreService();
    }
    if (event?.target === $('#quote-quantity-slider')) $('#quote-quantity').value = $('#quote-quantity-slider').value;
    if (event?.target === $('#quote-quantity') || event?.target === $('#quote-quantity-slider')) $('#quote-passed').value = $('#quote-quantity').value;
    draft = null;
    render();
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  $('#inquiry-email').addEventListener('blur', () => { emailTouched = true; emailError(); });
  $$('[data-quantity]').forEach((button) => button.addEventListener('click', () => { $('#quote-quantity').value = button.dataset.quantity; $('#quote-passed').value = button.dataset.quantity; update(); }));
  $('#quote-review').addEventListener('click', () => go(1));
  $('#quote-contact').addEventListener('click', () => go(2));
  $$('[data-quote-step]').forEach((button) => button.addEventListener('click', () => go(Number(button.dataset.quoteStep))));
  $$('[data-quote-back]').forEach((button) => button.addEventListener('click', () => go(Number(button.dataset.quoteBack))));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (step < 2) { if (currentQuote().valid) go(step + 1); return; }
    if (!currentQuote().valid) { go(0); $('#quote-quantity').focus(); return; }
    emailTouched = true;
    emailError();
    const result = createDemoInquiry(configuration(), $('#inquiry-email').value);
    if (!result.valid) { $('#inquiry-email').focus(); return; }
    draft = result;
    $('#inquiry-email').value = draft.contact.email;
    render();
    $('#inquiry-ready-heading').focus({ preventScroll: true });
    announce('inquiryNotSent');
  });
  $('#inquiry-edit').addEventListener('click', () => { draft = null; render(); $('#inquiry-email').focus(); });
  $('#download-inquiry').addEventListener('click', () => {
    if (!draft) return;
    downloads.run({ content: () => {
      if (!draft || !currentQuote().valid) throw new Error('Draft is no longer available');
      return JSON.stringify(draft, null, 2);
    }, filename: 'biodeploy-demo-inquiry.json', type: 'application/json', button: $('#download-inquiry'), successKey: 'stateDownloadStarted' });
  });
  $('#save-estimate').addEventListener('click', () => {
    const quote = currentQuote();
    if (!quote.valid) return;
    downloads.run({ content: () => {
      const latest = currentQuote();
      if (!latest.valid) throw new Error('Invalid estimate');
      return JSON.stringify(latest, null, 2);
    }, filename: 'biodeploy-demo-estimate.json', type: 'application/json', button: $('#save-estimate'), successKey: 'stateDownloadStarted' });
  });
  return {
    render,
    configure(packageMode) {
      rememberService();
      form.elements.service.value = demoCatalog[packageMode].service;
      restoreService();
      draft = null;
      step = 0;
      reached = 0;
      render();
    },
  };
}
