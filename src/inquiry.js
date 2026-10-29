import { calculateDemoQuote } from './quote.js';

// Syntax validation only; no contact data is stored or transmitted.
export function validateInquiryEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  if (email.length > 254 || /[\s\r\n]/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+$/.test(local)) return false;
  const labels = domain.split('.');
  return labels.length > 1 && labels.every((label) => label.length <= 63 && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label));
}

export function createDemoInquiry(configuration, email) {
  const estimate = calculateDemoQuote(configuration);
  if (!estimate.valid) return { valid: false, errorKey: estimate.errorKey };
  if (!validateInquiryEmail(email)) return { valid: false, errorKey: 'inquiryEmailError' };
  return {
    valid: true,
    schema_version: '2.0',
    synthetic: true,
    not_a_quote: true,
    status: 'draft_not_sent',
    contact: { email: email.trim() },
    estimate,
  };
}
