/* Tiny client-side includer for header/footer + active-nav highlighting.
   Usage: <div data-include="header"></div>  /  <div data-include="footer"></div>
*/
(async function () {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all([...slots].map(async (slot) => {
    const name = slot.getAttribute('data-include');
    try {
      const r = await fetch(`partials/${name}.html`);
      if (!r.ok) {
        // try root-relative when nested
        const r2 = await fetch(`/partials/${name}.html`);
        if (!r2.ok) return;
        slot.outerHTML = await r2.text();
      } else {
        slot.outerHTML = await r.text();
      }
    } catch (_) { /* ignore */ }
  }));

  // Highlight active nav item
  const path = location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  const map = {
    'index.html': null,
    'programs.html': 'programs',
    'finder.html': new URLSearchParams(location.search).get('type') || 'events',
    'locations.html': 'locations',
    'community.html': 'community',
    'contact.html': null,
  };
  const active = map[path];
  if (active) {
    const link = document.querySelector(`[data-nav="${active}"]`);
    if (link) link.classList.add('is-active');
  }

  // Mobile nav toggle
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('is-open'));
  }
})();
