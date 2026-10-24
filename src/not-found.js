import { languages, locales } from './locales.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const trigger = $('#locale-trigger');
const menu = $('#locale-menu');
let locale = 'en';
try {
  const saved = localStorage.getItem('biodeploy.locale');
  if (Object.hasOwn(locales, saved)) locale = saved;
} catch { /* Keep the page usable when storage is unavailable. */ }

function render() {
  const copy = locales[locale];
  const language = languages.find(({ code }) => code === locale);
  document.documentElement.lang = locale;
  document.title = copy.notFoundTitle;
  $$('[data-i18n]').forEach((element) => { element.textContent = copy[element.dataset.i18n]; });
  $('#locale-label').textContent = language.name;
  $('#locale-label').lang = locale;
  trigger.setAttribute('aria-label', `${copy.chooseLanguage}: ${language.name}`);
  $$('input[name="locale"]').forEach((input) => { input.checked = input.value === locale; });
}
function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) trigger.focus();
}
trigger.addEventListener('click', () => {
  if (!menu.hidden) { closeMenu(); return; }
  menu.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  $('input[name="locale"]:checked').focus();
});
$$('input[name="locale"]').forEach((input) => {
  input.addEventListener('change', () => {
    locale = input.value;
    try { localStorage.setItem('biodeploy.locale', locale); } catch { /* Session-only language selection. */ }
    render();
  });
  input.addEventListener('click', (event) => { if (event.detail > 0) closeMenu(true); });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); closeMenu(true); }
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); closeMenu(true); }
});
document.addEventListener('click', (event) => { if (!event.target.closest('.locale-control')) closeMenu(); });
document.addEventListener('focusin', (event) => { if (!event.target.closest('.locale-control')) closeMenu(); });
render();
