import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { languages, messages, locales } from '../src/locales.js';
import { sampleData } from '../src/sample-data.js';

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
assert.equal(sampleData.assay.qc_status, 'not_assessed');
assert.equal(sampleData.assay.time_unit, 's');
assert.equal(sampleData.assay.response_unit, 'RU');
for (const trace of sampleData.traces) {
  assert.equal(trace.points.length, 71);
  trace.points.forEach((point, index) => {
    assert.ok(Number.isFinite(point.response_ru) && point.response_ru >= 0);
    if (index) assert.ok(point.time_s > trace.points[index - 1].time_s);
  });
}
process.stdout.write(`Passed: ${languages.length} complete locales, ${Object.keys(messages).length} translation keys, assets, anchors, ARIA targets, and synthetic data contract.\n`);
