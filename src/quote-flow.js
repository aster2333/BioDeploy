import { calculateDemoQuote, demoCatalog } from './quote.js';
import { createDemoInquiry, validateInquiryEmail } from './inquiry.js';

export function initQuoteFlow({ t, money, number, downloads, announce }) {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const form = $('#quote-form');
  let step = 0;
  let reached = 0;
  let emailTouched = false;
  let draft = null;
  let activeService = form.elements.service.value;
  const service = () => form.elements.service.value;
  const mode = () => service() === 'binding' ? form.elements.resolution.value : service();
  const settings = {
    expression: { quantity: '96', replicates: '2', targets: '1', conditions: '1' },
    binding: { quantity: '96', replicates: '2', targets: '1', conditions: '1', resolution: 'affinity' },
    thermostability: { quantity: '96', replicates: '1', targets: '1', conditions: '1' },
  };
  const configuration = () => ({ mode: mode(), quantity: $('#quote-quantity').valueAsNumber, replicates: Number($('#quote-replicates').value), targets: Number($('#quote-targets').value), conditions: Number($('#quote-conditions').value) });
  const currentQuote = () => calculateDemoQuote(configuration());
  const batch = () => t('inquiryProteinCount').replace('{count}', number($('#quote-quantity').valueAsNumber));

  function rememberService() {
    const saved = settings[activeService];
    for (const key of ['quantity', 'replicates', 'targets', 'conditions']) saved[key] = $(`#quote-${key}`).value;
    if (activeService === 'binding') saved.resolution = form.elements.resolution.value;
  }

  function restoreService() {
    const saved = settings[service()];
    for (const key of ['quantity', 'replicates', 'targets', 'conditions']) $(`#quote-${key}`).value = saved[key];
    if (service() === 'binding') form.elements.resolution.value = saved.resolution;
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
    const binding = service() === 'binding';
    const thermal = service() === 'thermostability';
    $('#binding-resolution').hidden = !binding;
    $('#binding-resolution').disabled = !binding;
    $('#quote-target-field').hidden = !binding;
    $('#quote-targets').disabled = !binding;
    $('#quote-condition-field').hidden = !thermal;
    $('#quote-conditions').disabled = !thermal;
    const singleReplicate = $('#quote-replicates option[value="1"]');
    singleReplicate.disabled = !thermal;
    singleReplicate.hidden = !thermal;
    const quote = currentQuote();
    const entry = demoCatalog[mode()];
    $('#quote-scope').textContent = t(entry.scopeKey);
    $('#quote-price-basis').textContent = t(thermal ? 'thermalPriceBasis' : 'inquiryPriceBasis');
    $('#replicate-help').textContent = t(thermal ? 'thermalReplicateHelp' : 'inquiryReplicateHelp');
    $('#target-help').textContent = t('inquiryTargetHelp');
    const errorFields = { invalidQuantity: 'quote-quantity', invalidReplicates: 'quote-replicates', invalidThermalReplicates: 'quote-replicates', invalidTargets: 'quote-targets', invalidConditions: 'quote-conditions' };
    const invalidField = quote.valid ? null : errorFields[quote.errorKey];
    const error = $('#quantity-error');
    error.hidden = quote.valid;
    error.textContent = quote.valid ? '' : t(quote.errorKey);
    for (const id of ['quote-quantity', 'quote-replicates', 'quote-targets', 'quote-conditions']) {
      const field = $(`#${id}`);
      field.setAttribute('aria-invalid', String(id === invalidField));
      const descriptions = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
      descriptions.add('quantity-error');
      field.setAttribute('aria-describedby', [...descriptions].join(' '));
    }
    if (invalidField) {
      const field = $(`#${invalidField}`);
      (field.closest('.quantity-line') || field).insertAdjacentElement('afterend', error);
    }
    // A range cannot represent an empty/fractional/out-of-range entry. Leave its
    // last valid position available to recover without rewriting typed input.
    if (Number.isInteger($('#quote-quantity').valueAsNumber) && $('#quote-quantity').valueAsNumber >= 8 && $('#quote-quantity').valueAsNumber <= 800) {
      $('#quote-quantity-slider').value = $('#quote-quantity').value;
    }
    for (const id of ['save-estimate', 'quote-review', 'quote-contact', 'preview-inquiry']) {
      const button = $(`#${id}`);
      button.dataset.disabledByState = String(!quote.valid);
      button.disabled = !quote.valid || button.dataset.downloadBusy === 'true';
    }
    $$('[data-quantity]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.quantity) === $('#quote-quantity').valueAsNumber)));
    $$('[data-base-price]').forEach((element) => { element.textContent = money(demoCatalog[element.dataset.basePrice].baseUnitCents); });
    for (const [selector, key] of [['#quote-unit', 'unit_cents'], ['#quote-base', 'base_cents'], ['#quote-extra', 'extra_replicate_cents'], ['#quote-total', 'total_cents'], ['#contact-total', 'total_cents']]) {
      $(selector).textContent = quote.valid ? money(quote[key]) : '—';
    }
    $('#quote-unit-label').textContent = t(binding ? 'quoteUnit' : thermal ? 'thermalUnit' : 'inquiryUnitExpression');
    $('#quote-base-label').textContent = t(thermal ? 'thermalBase' : 'quoteBase');
    $('#quote-summary-assay').textContent = t(entry.nameKey);
    const multiplier = binding ? t('inquiryTargetCount').replace('{count}', number(quote.configuration?.targets)) : thermal ? t('thermalConditionCount').replace('{count}', number(quote.configuration?.conditions)) : '';
    $('#quote-equation').textContent = quote.valid ? `${batch()} × ${money(quote.unit_cents)}${multiplier ? ` × ${multiplier}` : ''}` : '—';
    $('#quote-days').textContent = `${entry.days[0]} ${t('days')}`;
    $('#review-assay').textContent = t(entry.nameKey);
    $('#review-batch').textContent = quote.valid ? batch() : '—';
    $('#review-replicates').textContent = $('#quote-replicates').value;
    $('#review-target-row').hidden = !binding;
    $('#review-targets').textContent = $('#quote-targets').value;
    $('#review-condition-row').hidden = !thermal;
    $('#review-conditions').textContent = $('#quote-conditions').value;
    $('#review-method').textContent = t(entry.methodKey);
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
    draft = null;
    render();
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  $('#inquiry-email').addEventListener('blur', () => { emailTouched = true; emailError(); });
  $$('[data-quantity]').forEach((button) => button.addEventListener('click', () => { $('#quote-quantity').value = button.dataset.quantity; update(); }));
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
      if (service() === 'binding') form.elements.resolution.value = packageMode;
      draft = null;
      step = 0;
      reached = 0;
      render();
    },
  };
}
