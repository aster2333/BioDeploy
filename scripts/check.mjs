import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { languages, messages, locales } from '../src/locales.js';
import { sampleData, sampleCsv } from '../src/sample-data.js';
import { calculateDemoQuote, demoCatalog } from '../src/quote.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
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
const quote = (overrides = {}) => calculateDemoQuote({ mode: 'affinity', quantity: 96, replicates: 2, targets: 1, ...overrides });
assert.equal(quote().total_cents, 1334400);
assert.equal(quote({ replicates: 3, targets: 2 }).total_cents, 3869760);
assert.equal(quote({ mode: 'expression', targets: 3 }).total_cents, 432000);
assert.equal(quote({ mode: 'expression', quantity: 8 }).total_cents, 41400);
assert.equal(quote({ mode: 'expression', quantity: 384 }).total_cents, 1589760);
for (const quantity of [NaN, 0, 7, 385, 12.5, Infinity]) assert.equal(quote({ quantity }).valid, false);
for (const input of [{ mode: 'unknown' }, { replicates: 1 }, { targets: 4 }]) assert.equal(quote(input).valid, false);
assert.equal(quote().synthetic, true);
assert.equal(quote().not_a_quote, true);
assert.equal(quote().currency, 'USD');
for (const entry of Object.values(demoCatalog)) assert.deepEqual(entry.days, [21, 21]);
assert.deepEqual(quote().illustrative_days, [21, 21]);
for (const entry of Object.values(demoCatalog)) for (const locale of Object.values(locales)) {
  assert.ok(locale[entry.nameKey]);
  assert.ok(locale[entry.scopeKey]);
}
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
for (const [, key] of app.matchAll(/\bt\('([^']+)'\)/g)) assert.ok(locales.en[key], `Missing dynamic key ${key}`);
assert.ok(!/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/.test(app), 'The shell must not submit API requests');
assert.ok(!/<form[^>]+action=/.test(html), 'No transaction form action');
process.stdout.write(`Passed: ${languages.length} locales, ${Object.keys(messages).length} keys, quote boundaries and totals, four scientific outcomes, 569 CSV rows, anchors and assets.\n`);
