import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { languages, messages, locales } from '../src/locales.js';
import { sampleData, sampleCsv } from '../src/sample-data.js';
import { calculateDemoQuote, demoCatalog } from '../src/quote.js';
import { createDemoInquiry, validateInquiryEmail } from '../src/inquiry.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const componentHtml = await readFile(new URL('../components.html', import.meta.url), 'utf8');
const notFoundHtml = await readFile(new URL('../404.html', import.meta.url), 'utf8');
const notFoundIds = [...notFoundHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(notFoundIds).size, notFoundIds.length, 'Duplicate 404 element IDs');
for (const [, targets] of notFoundHtml.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
  for (const id of targets.split(' ')) assert.ok(notFoundIds.includes(id), `Missing 404 ARIA target: ${id}`);
}
for (const [, anchor] of notFoundHtml.matchAll(/href="#([^"]+)"/g)) assert.ok(notFoundIds.includes(anchor), `Broken 404 anchor: ${anchor}`);
for (const [, anchor] of notFoundHtml.matchAll(/href="\/#([^"]+)"/g)) assert.ok(html.includes(`id="${anchor}"`), `Broken 404 home link: ${anchor}`);
for (const [, file] of notFoundHtml.matchAll(/(?:src|href)="(\/(?:src|public)\/[^"#]+)"/g)) await access(new URL(`..${file}`, import.meta.url));
for (const [, key] of notFoundHtml.matchAll(/data-i18n="([^"]+)"/g)) {
  for (const locale of Object.values(locales)) assert.ok(locale[key], `Missing 404 translation: ${key}`);
}
assert.equal(languages.length, 4);
for (const [key, translations] of Object.entries(messages)) {
  assert.equal(translations.length, languages.length, `${key}: missing translation`);
  translations.forEach((value) => assert.ok(typeof value === 'string' && value.trim(), `${key}: empty translation`));
}
for (const language of languages) {
  for (const [, key] of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) {
    assert.ok(locales[language.code][key], `${language.code}: missing ${key}`);
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate element IDs');
for (const [, attributes] of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) {
  for (const id of attributes.split(' ')) assert.ok(ids.includes(id), `Missing ARIA target: ${id}`);
}
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor), `Broken anchor: ${anchor}`);
for (const [, file] of html.matchAll(/(?:src|href)="(\/(?:src|public)\/[^"#]+)"/g)) {
  await access(new URL(`..${file}`, import.meta.url));
}
const componentIds = [...componentHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(componentIds).size, componentIds.length, 'Duplicate component-reference IDs');
for (const [, attributes] of componentHtml.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
  for (const id of attributes.split(' ')) assert.ok(componentIds.includes(id), `Missing component ARIA target: ${id}`);
}
for (const [, anchor] of componentHtml.matchAll(/href="#([^"]+)"/g)) assert.ok(componentIds.includes(anchor), `Broken component anchor: ${anchor}`);
for (const [, file] of componentHtml.matchAll(/(?:src|href)="(\/(?:src|public)\/[^"#]+)"/g)) await access(new URL(`..${file}`, import.meta.url));
for (const [, key] of componentHtml.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) {
  for (const locale of Object.values(locales)) assert.ok(locale[key], `Missing component translation: ${key}`);
}
const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
for (const [, font] of css.matchAll(/url\('(\/public\/fonts\/[^']+)'\)/g)) await access(new URL(`..${font}`, import.meta.url));
assert.equal(sampleData.synthetic, true);
assert.equal(sampleData.assay.time_unit, 's');
assert.equal(sampleData.assay.response_unit, 'RU');
assert.equal(sampleData.candidates.length, 4);
for (const candidate of sampleData.candidates) {
  assert.equal(candidate.qc.synthetic, true);
  assert.equal(candidate.provenance.synthetic, true);
  for (const locale of Object.values(locales)) assert.ok(locale[candidate.reason_key]);
  if (candidate.outcome !== 'binder') {
    assert.equal(candidate.illustrative_estimate.kd, null);
    assert.equal(candidate.fitted_traces.length, 0);
  }
  if (candidate.outcome === 'unexpressed') assert.equal(candidate.raw_traces.length, 0);
  for (const trace of [...candidate.raw_traces, ...candidate.fitted_traces]) {
    assert.equal(trace.points.length, 71);
    trace.points.forEach((point, index) => {
      assert.ok(Number.isFinite(point.response_ru));
      if (index) assert.ok(point.time_s > trace.points[index - 1].time_s);
    });
  }
}
const csv = sampleCsv().trim().split(/\r?\n/);
assert.equal(csv.length, 570);
assert.ok(csv.every((row) => row.split(',').length === 14));
const absent = csv.find((row) => row.includes('binder_003'));
assert.ok(absent.includes('not_measured'));
assert.equal(absent.split(',')[11], '', 'Unknown Kd must not become zero');
const quote = (overrides = {}) => calculateDemoQuote({ mode: 'kinetics', quantity: 96, panels: 1, tier: 'standard', ...overrides });
assert.equal(quote().total_cents, 1056000);
assert.equal(quote().sample_measurement_count, 2304);
assert.equal(quote({ tier: 'rush' }).total_cents, 1320000);
assert.deepEqual(quote({ tier: 'rush' }).illustrative_days, [14, 14]);
assert.deepEqual(quote().illustrative_days, [21, 21]);
assert.equal(quote({ quantity: 24 }).total_cents, 264000);
assert.equal(quote({ quantity: 384 }).total_cents, 4224000);
assert.equal(quote({ mode: 'matrix', panels: 2 }).total_cents, 1632000);
assert.equal(quote({ mode: 'matrix', panels: 2, tier: 'rush' }).total_cents, 2040000);
assert.equal(quote({ mode: 'matrix', panels: 4 }).sample_measurement_count, 6912);
assert.equal(quote({ mode: 'matrix', quantity: 384, panels: 4, tier: 'rush' }).total_cents, 16320000);
assert.equal(quote({ mode: 'expressionQc' }).total_cents, 336000);
assert.equal(quote({ mode: 'expressionQc', quantity: 24 }).total_cents, 84000);
assert.equal(quote({ mode: 'expressionQc' }).sample_measurement_count, 96);
assert.equal(quote({ mode: 'expressionQc', panels: 4, targets: 3, replicates: 4 }).total_cents, 336000);
assert.equal(quote({ mode: 'expressionQc', panels: 4 }).configuration.panels, 1);
assert.equal(quote({ panels: 4 }).configuration.panels, 1);
assert.equal(quote({ mode: 'expressionQc' }).configuration.replicates, 1);
assert.equal(quote().configuration.replicates, 3);
for (const quantity of [NaN, 0, 23, 385, 800, 12.5, Infinity]) assert.equal(quote({ quantity }).valid, false);
for (const mode of ['unknown', 'expression', 'screening', 'affinity', 'thermostability']) assert.equal(quote({ mode }).valid, false);
for (const panels of [0, 5, 1.5, NaN, Infinity]) assert.equal(quote({ mode: 'matrix', panels }).valid, false);
for (const tier of ['', 'fast', null]) assert.equal(quote({ tier }).valid, false);
assert.equal(quote().schema_version, '2.0');
assert.equal(quote().synthetic, true);
assert.equal(quote().not_a_quote, true);
assert.equal(quote().currency, 'USD');
assert.equal(quote().assumptions.supplier_costs_verified, false);
assert.ok(quote().exclusions.includes('gene_synthesis'));
for (const entry of Object.values(demoCatalog)) for (const locale of Object.values(locales)) {
  assert.ok(locale[entry.nameKey]);
  assert.ok(locale[entry.scopeKey]);
  assert.ok(locale[entry.methodKey]);
}
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const quoteFlow = await readFile(new URL('../src/quote-flow.js', import.meta.url), 'utf8');
const inquiry = await readFile(new URL('../src/inquiry.js', import.meta.url), 'utf8');
const feedback = await readFile(new URL('../src/ui-feedback.js', import.meta.url), 'utf8');
const gallery = await readFile(new URL('../src/component-gallery.js', import.meta.url), 'utf8');
for (const code of [app, quoteFlow, inquiry, feedback, gallery]) {
  for (const [, key] of code.matchAll(/\bt\('([^']+)'\)/g)) {
    for (const locale of Object.values(locales)) assert.ok(locale[key], `Missing dynamic key ${key}`);
  }
  assert.ok(!/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/.test(code), 'The demo must not submit API requests');
}
for (const email of ['name@example.com', 'research+demo@lab.example.org', ' name@example.com ']) assert.equal(validateInquiryEmail(email), true);
for (const email of ['', 'name', 'name@', 'name@example', '.name@example.org', 'name..x@example.org', 'name@-example.org', 'name@ex ample.org', 'x@example.org\r\nBcc:other@example.org', `${'a'.repeat(65)}@example.org`]) assert.equal(validateInquiryEmail(email), false);
const draft = createDemoInquiry({ mode: 'matrix', quantity: 96, panels: 2, tier: 'rush' }, ' researcher@example.com ');
assert.equal(draft.contact.email, 'researcher@example.com');
assert.equal(draft.estimate.total_cents, 2040000);
assert.equal(draft.estimate.configuration.panels, 2);
assert.equal(draft.estimate.configuration.tier, 'rush');
assert.equal(draft.status, 'draft_not_sent');
assert.equal(draft.schema_version, '2.0');
assert.equal(draft.synthetic, true);
assert.equal(draft.not_a_quote, true);
assert.equal(createDemoInquiry({ mode: 'expressionQc', quantity: 23 }, 'name@example.org').valid, false);
assert.equal(createDemoInquiry({ mode: 'kinetics', quantity: 96 }, 'invalid').valid, false);
assert.ok(!html.includes('id="binding-resolution"'));
assert.ok(!html.includes('data-base-price="affinity"'));
assert.ok(html.includes('id="quote-quantity" name="quantity" value="96" min="24" max="384"'));
assert.ok(!/<form[^>]+action=/.test(html), 'No transaction form action');
process.stdout.write(`Passed: ${languages.length} locales, ${Object.keys(messages).length} keys, quote and inquiry validation, four scientific outcomes, 569 CSV rows, anchors and assets.\n`);
