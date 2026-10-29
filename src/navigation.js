// One disclosure navigation shared by desktop, touch and keyboard users.
export function initNavigation({ beforeOpen }) {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('#site-navigation');
  const toggle = document.querySelector('.mobile-toggle');
  const groups = [...nav.querySelectorAll('.nav-group')];
  const mobile = matchMedia('(max-width: 900px)');

  function closeGroup(group) {
    group.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    group.querySelector('.nav-panel').hidden = true;
  }

  function closeGroups(except) {
    groups.forEach((group) => {
      if (group !== except) closeGroup(group);
    });
  }

  function close() {
    closeGroups();
    header.classList.remove('navigation-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openGroup(group) {
    beforeOpen();
    closeGroups(group);
    group.querySelector('.nav-trigger').setAttribute('aria-expanded', 'true');
    group.querySelector('.nav-panel').hidden = false;
  }

  groups.forEach((group) => {
    const trigger = group.querySelector('.nav-trigger');
    const panel = group.querySelector('.nav-panel');
    trigger.addEventListener('click', () => {
      if (panel.hidden) openGroup(group);
      else closeGroups();
    });
    trigger.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      openGroup(group);
      const links = [...panel.querySelectorAll('a')];
      (event.key === 'ArrowDown' ? links[0] : links.at(-1)).focus();
    });
    group.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || panel.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      closeGroups();
      trigger.focus();
    });
  });

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('navigation-open');
    close();
    if (open) {
      beforeOpen();
      header.classList.add('navigation-open');
      toggle.setAttribute('aria-expanded', 'true');
      groups[0].querySelector('.nav-trigger').focus();
    }
  });
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const opener = mobile.matches ? toggle : link.closest('.nav-group')?.querySelector('.nav-trigger');
    close();
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      const heading = target?.querySelector('h2, h3');
      if (heading) {
        heading.tabIndex = -1;
        // Let the browser finish native fragment navigation before moving focus.
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    } else opener?.focus();
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
  });
  document.addEventListener('focusin', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
    else groups.forEach((group) => { if (!group.contains(event.target)) closeGroup(group); });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('navigation-open')) {
      event.preventDefault();
      close();
      toggle.focus();
    }
  });
  mobile.addEventListener('change', () => {
    const hiddenFocus = nav.contains(document.activeElement);
    close();
    if (hiddenFocus && mobile.matches) toggle.focus();
    else if (document.activeElement === toggle && !mobile.matches) groups[0].querySelector('.nav-trigger').focus();
  });
  return { close };
}
