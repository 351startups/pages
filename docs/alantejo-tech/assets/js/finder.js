/* Finder filter logic. URL-state driven so filters are shareable.
   ?type=all|events|perks|programs|mentors|partners|incubators|rd_centers|anchors|startups
   &vertical=datacenter|energy|agritech|...
   &city=Sines|Évora|Beja|...
   &stage=idea|preseed|seed|growth|scale
*/
(async function () {
  const data = await FY.loadData();
  const { verticals, stages } = data;
  const { vertLabel, formatDate, findPlace } = FY.helpers;

  // Build the unique sorted city list from all place arrays.
  const PLACE_TYPES_FOR_CITIES = ['anchors', 'incubators', 'rd_centers', 'startups'];
  const cityOpts = (() => {
    const set = new Set();
    PLACE_TYPES_FOR_CITIES.forEach(t => (data[t] || []).forEach(e => { if (e.city) set.add(e.city); }));
    return [{ id: '', label: 'All' }].concat(
      [...set].sort((a, b) => a.localeCompare(b)).map(c => ({ id: c, label: c }))
    );
  })();

  const TYPES = [
    { id: 'all',         label: 'All' },
    { id: 'anchors',     label: 'Anchor Cos' },
    { id: 'incubators',  label: 'Incubators' },
    { id: 'rd_centers',  label: 'R&D' },
    { id: 'startups',    label: 'Startups' },
    { id: 'programs',    label: 'Programs' },
    { id: 'events',      label: 'Events' },
    { id: 'perks',       label: 'Perks' },
    { id: 'mentors',     label: 'Mentors' },
    { id: 'partners',    label: 'Partners' },
  ];

  const root = document.querySelector('[data-finder]');
  if (!root) return;

  const state = {
    type: FY.helpers.qs('type', 'all'),
    vertical: FY.helpers.qs('vertical', null),
    city: FY.helpers.qs('city', null),
    stage: FY.helpers.qs('stage', null),
  };

  const grid = root.querySelector('[data-grid]');
  const countEl = root.querySelector('[data-count]');

  // --- Build pill rows ---
  function buildPills(slot, items, getId, current, onClick, opts = {}) {
    slot.innerHTML = items.map(it => {
      const id = getId(it);
      const cls = ['fy-pill'];
      if (opts.vert) cls.push('fy-pill--vert');
      if (id === current) cls.push('is-active');
      const dataVert = opts.vert ? `data-vert="${id}"` : '';
      return `<button class="${cls.join(' ')}" ${dataVert} data-pill="${id}">${it.label}</button>`;
    }).join('');
    slot.querySelectorAll('[data-pill]').forEach(b => {
      b.addEventListener('click', () => {
        onClick(b.dataset.pill);
        refreshActive();
      });
    });
  }

  buildPills(
    root.querySelector('[data-pills-type]'),
    TYPES, t => t.id, state.type,
    (id) => { state.type = id; sync(); render(); }
  );

  const vertOpts = [{ id: '', label: 'All' }, ...verticals];
  buildPills(
    root.querySelector('[data-pills-vertical]'),
    vertOpts, v => v.id, state.vertical || '',
    (id) => { state.vertical = id || null; sync(); render(); },
    { vert: true }
  );

  buildPills(
    root.querySelector('[data-pills-city]'),
    cityOpts, c => c.id, state.city || '',
    (id) => { state.city = id || null; sync(); render(); }
  );

  const stageOpts = [{ id: '', label: 'All' }, ...stages];
  buildPills(
    root.querySelector('[data-pills-stage]'),
    stageOpts, s => s.id, state.stage || '',
    (id) => { state.stage = id || null; sync(); render(); }
  );

  root.querySelector('[data-clear]').addEventListener('click', () => {
    state.vertical = null; state.city = null; state.stage = null;
    sync(); refreshActive(); render();
  });

  function sync() { FY.helpers.pushQS(state); }

  function refreshActive() {
    root.querySelectorAll('[data-pills-type] [data-pill]').forEach(p =>
      p.classList.toggle('is-active', p.dataset.pill === state.type));
    root.querySelectorAll('[data-pills-vertical] [data-pill]').forEach(p =>
      p.classList.toggle('is-active', p.dataset.pill === (state.vertical || '')));
    root.querySelectorAll('[data-pills-city] [data-pill]').forEach(p =>
      p.classList.toggle('is-active', p.dataset.pill === (state.city || '')));
    root.querySelectorAll('[data-pills-stage] [data-pill]').forEach(p =>
      p.classList.toggle('is-active', p.dataset.pill === (state.stage || '')));
  }

  // --- Filters ---
  function matchesVertical(item) {
    if (!state.vertical) return true;
    if (Array.isArray(item.vertical)) return item.vertical.includes(state.vertical);
    if (Array.isArray(item.vertical_focus)) return item.vertical_focus.includes(state.vertical);
    return item.vertical === state.vertical;
  }
  function matchesStage(item) {
    if (!state.stage) return true;
    if (Array.isArray(item.stages)) return item.stages.includes(state.stage);
    return true;
  }
  // Places have `city` directly. Events have a `location_id` → resolve to place city.
  // Items with no city info (programs/perks/mentors/partners) are region-wide,
  // so they always pass — they're available to anyone in any Alentejo city.
  function matchesCity(item) {
    if (!state.city) return true;
    if (item.city) return item.city === state.city;
    if (item.location_id) {
      const place = findPlace(data, item.location_id);
      return !!place && place.city === state.city;
    }
    return true;
  }

  // --- Card templates ---
  function placeCard(l, type) {
    const verts = l.vertical_focus || l.vertical || [];
    const v = verts[0] || 'other';
    return `
      <a class="fy-ecocard fy-ecocard--lg" href="${l.url || '#'}" ${l.url ? 'target="_blank" rel="noopener"' : ''} data-vert="${v}">
        <div class="fy-ecocard__name">${l.name}${l.flagship ? ' <span class="fy-flagship-pill">FLAGSHIP</span>' : ''}</div>
        <div class="fy-ecocard__city">${l.city || ''}</div>
        ${l.blurb ? `<p class="fy-ecocard__blurb">${l.blurb}</p>` : ''}
        <div class="fy-card__tags">
          ${verts.slice(0,3).map(vid =>
            `<span class="fy-tag fy-tag--vert" data-vert="${vid}">${vertLabel(verticals, vid)}</span>`).join('')}
        </div>
      </a>`;
  }

  const TPL = {
    incubators(l) { return placeCard(l, 'incubators'); },
    rd_centers(l) { return placeCard(l, 'rd_centers'); },
    anchors(l)    { return placeCard(l, 'anchors'); },
    startups(l)   { return placeCard(l, 'startups'); },
    events(e) {
      const loc = findPlace(data, e.location_id);
      return `
        <a class="fy-card" href="${e.rsvp_url || '#'}" target="_blank" rel="noopener" data-vert="${e.vertical}">
          <div class="fy-card__body">
            <div class="fy-card__meta">${formatDate(e.date_iso)} · ${loc ? loc.name : ''}</div>
            <h3 class="fy-card__title">${e.title}</h3>
            <p class="fy-card__blurb">${e.blurb || ''}</p>
            <div class="fy-card__tags">
              <span class="fy-tag fy-tag--vert" data-vert="${e.vertical}">${vertLabel(verticals, e.vertical)}</span>
              ${(e.stages || []).slice(0,2).map(s => `<span class="fy-tag">${s}</span>`).join('')}
            </div>
          </div>
        </a>`;
    },
    programs(p) {
      return `
        <a class="fy-card" href="${p.url || '#'}" target="_blank" rel="noopener" data-vert="${p.vertical}">
          <div class="fy-card__img">${p.name.split(' ')[0]}</div>
          <div class="fy-card__body">
            <div class="fy-card__meta">${p.duration || ''}</div>
            <h3 class="fy-card__title">${p.name}</h3>
            <p class="fy-card__blurb">${p.blurb || ''}</p>
            <div class="fy-card__tags">
              <span class="fy-tag fy-tag--vert" data-vert="${p.vertical}">${vertLabel(verticals, p.vertical)}</span>
              ${(p.stages || []).slice(0,2).map(s => `<span class="fy-tag">${s}</span>`).join('')}
            </div>
          </div>
        </a>`;
    },
    perks(p) {
      const v = (p.vertical || [])[0] || 'other';
      return `
        <a class="fy-card" href="${p.cta_url || '#'}" data-vert="${v}">
          <div class="fy-card__body">
            <div class="fy-card__meta">${p.partner}</div>
            <h3 class="fy-card__title">${p.value}</h3>
            <p class="fy-card__blurb">${p.blurb || ''}</p>
            <div class="fy-card__tags">
              ${(p.vertical || []).slice(0,3).map(vid =>
                `<span class="fy-tag fy-tag--vert" data-vert="${vid}">${vertLabel(verticals, vid)}</span>`).join('')}
            </div>
          </div>
        </a>`;
    },
    mentors(m) {
      if (m.placeholder) {
        return `
          <div class="fy-mentor-card">
            <div class="fy-mentor-card__name" style="color:var(--fy-muted)">${m.role}</div>
            <div class="fy-mentor-card__role">${m.company}</div>
            <span class="fy-mentor-card__placeholder">Coming soon</span>
          </div>`;
      }
      const v = (m.vertical || [])[0] || 'other';
      return `
        <a class="fy-mentor-card" href="${m.linkedin !== '#' ? m.linkedin : '#'}" target="_blank" rel="noopener" data-vert="${v}">
          <div class="fy-mentor-card__name">${m.name}</div>
          <div class="fy-mentor-card__role">${m.role} · ${m.company}</div>
          <p class="fy-mentor-card__blurb">${m.blurb || ''}</p>
          <div class="fy-card__tags" style="padding-top:10px;">
            ${(m.vertical || []).slice(0,3).map(vid =>
              `<span class="fy-tag fy-tag--vert" data-vert="${vid}">${vertLabel(verticals, vid)}</span>`).join('')}
          </div>
        </a>`;
    },
    partners(p) {
      const v = (p.vertical || [])[0] || 'other';
      const tierLabel = {
        founding:  'Founding Partner',
        vc:        'VC / Programme',
        corporate: 'Corporate',
        gov:       'Public / Institutional'
      }[p.tier] || '';
      return `
        <a class="fy-card" href="${p.url || '#'}" data-vert="${v}">
          <div class="fy-card__body">
            <div class="fy-card__meta">${tierLabel}</div>
            <h3 class="fy-card__title">${p.name}</h3>
            <div class="fy-card__tags">
              ${(p.vertical || []).slice(0,3).map(vid =>
                `<span class="fy-tag fy-tag--vert" data-vert="${vid}">${vertLabel(verticals, vid)}</span>`).join('')}
            </div>
          </div>
        </a>`;
    }
  };

  // --- "All" sectioned view ---
  const SECTION_TYPES = ['anchors','incubators','rd_centers','startups','programs','events','perks','mentors','partners'];

  function renderAll() {
    const sections = SECTION_TYPES.map(t => {
      const pool = data[t] || [];
      const filtered = pool.filter(i => !i.placeholder && matchesVertical(i) && matchesStage(i) && matchesCity(i));
      return { type: t, items: filtered };
    }).filter(s => s.items.length > 0);

    const total = sections.reduce((n, s) => n + s.items.length, 0);
    countEl.textContent = `${total} results across ${sections.length} categories`;

    const vParam = state.vertical ? `&vertical=${state.vertical}` : '';
    const cParam = state.city ? `&city=${encodeURIComponent(state.city)}` : '';
    const sParam = state.stage ? `&stage=${state.stage}` : '';

    grid.className = 'fy-all-sections';
    grid.innerHTML = sections.length ? sections.map(s => `
      <div class="fy-all-section">
        <div class="fy-all-section__head">
          <h3 class="fy-all-section__title">${labelFor(s.type)}</h3>
          <a class="fy-all-section__more" href="finder.html?type=${s.type}${vParam}${cParam}${sParam}">See all ${s.items.length} ${labelFor(s.type)} →</a>
        </div>
        <div class="${isPlace(s.type) ? 'fy-ecogrid' : 'fy-grid'}">
          ${s.items.slice(0, 4).map(TPL[s.type]).join('')}
        </div>
      </div>
    `).join('') : `<div class="fy-empty">No results match these filters. Try a different vertical or stage.</div>`;
  }

  function isPlace(t) { return ['incubators','rd_centers','anchors','startups'].includes(t); }
  function labelFor(t) {
    return ({
      anchors:    'Anchor Companies',
      incubators: 'Incubators & Accelerators',
      rd_centers: 'R&D Centres',
      startups:   'Startups',
      programs:   'Programs',
      events:     'Events',
      perks:      'Perks',
      mentors:    'Mentors',
      partners:   'Partners',
    })[t] || t;
  }

  // --- Main render ---
  function render() {
    if (state.type === 'all') { renderAll(); return; }

    const pool = data[state.type] || [];
    const filtered = pool.filter(i => matchesVertical(i) && matchesStage(i) && matchesCity(i));

    grid.className = isPlace(state.type) ? 'fy-ecogrid' : 'fy-grid';
    grid.innerHTML = filtered.length
      ? filtered.map(TPL[state.type]).join('')
      : `<div class="fy-empty">No ${labelFor(state.type)} match these filters yet. Try a different vertical or stage.</div>`;
    countEl.textContent = `${filtered.length} ${labelFor(state.type)}`;
  }

  window.addEventListener('popstate', () => {
    state.type = FY.helpers.qs('type', 'all');
    state.vertical = FY.helpers.qs('vertical', null);
    state.city = FY.helpers.qs('city', null);
    state.stage = FY.helpers.qs('stage', null);
    refreshActive(); render();
  });

  refreshActive();
  render();
})();
