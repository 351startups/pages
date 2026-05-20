/* Homepage rendering. Reads data.json and populates each section. */
(async function () {
  const data = await FY.loadData();
  const { verticals, stats, programs, events, partners, success_stories,
          incubators, rd_centers, anchors, startups } = data;
  const { vertLabel, findPlace } = FY.helpers;

  // Stats
  const statsEl = document.querySelector('[data-stats]');
  if (statsEl) {
    const items = [
      { num: '€' + stats.investment_pipeline_eur_b + 'B',  label: 'Investment pipeline' },
      { num: stats.datacenter_capacity_gw + ' GW',         label: 'Data-centre capacity' },
      { num: stats.industrial_land_ha.toLocaleString() + ' ha', label: 'ZILS Sines' },
      { num: stats.submarine_cables + '+',                  label: 'Subsea cables' },
      { num: stats.incubators + ' + ' + stats.rd_centers,   label: 'Incubators + R&D' },
    ];
    statsEl.innerHTML = items.map(s => `
      <div class="fy-stat">
        <div class="fy-stat__num">${s.num}</div>
        <div class="fy-stat__label">${s.label}</div>
      </div>
    `).join('');
  }

  // Verticals grid
  const vertEl = document.querySelector('[data-verticals]');
  if (vertEl) {
    vertEl.innerHTML = verticals.map(v => `
      <a class="fy-vcard" href="finder.html?vertical=${v.id}" data-vert="${v.id}">
        <span class="fy-vcard__icon">${v.icon}</span>
        <h3 class="fy-vcard__title">${v.label}</h3>
        <p class="fy-vcard__blurb">${v.blurb}</p>
        <div class="fy-vcard__more">Explore ${v.label} →</div>
      </a>
    `).join('');
  }

  // Featured programs (first 6)
  const progEl = document.querySelector('[data-programs]');
  if (progEl) {
    progEl.innerHTML = programs.slice(0, 6).map(p => `
      <a class="fy-card" href="finder.html?type=programs&vertical=${p.vertical}" data-vert="${p.vertical}">
        <div class="fy-card__img">${p.name.split(' ')[0]}</div>
        <div class="fy-card__body">
          <div class="fy-card__meta">${p.duration}</div>
          <h3 class="fy-card__title">${p.name}</h3>
          <p class="fy-card__blurb">${p.blurb}</p>
          <div class="fy-card__tags">
            <span class="fy-tag fy-tag--vert" data-vert="${p.vertical}">${vertLabel(verticals, p.vertical)}</span>
            ${p.stages.slice(0, 2).map(s => `<span class="fy-tag">${s}</span>`).join('')}
          </div>
        </div>
      </a>
    `).join('');
  }

  // Ecosystem map — 4 entity types, 2 cards from each
  const ecoEl = document.querySelector('[data-ecosystem]');
  if (ecoEl) {
    const groups = [
      { type: 'anchors',     label: 'Anchor Companies', items: anchors.slice(0, 3),     href: 'ecosystem.html#anchors' },
      { type: 'incubators',  label: 'Incubators & Accelerators', items: incubators.slice(0, 3), href: 'ecosystem.html#incubators' },
      { type: 'rd_centers',  label: 'R&D Centres',      items: rd_centers.slice(0, 3),  href: 'ecosystem.html#rd_centers' },
      { type: 'startups',    label: 'Startups',         items: startups.slice(0, 3),    href: 'ecosystem.html#startups' },
    ];
    ecoEl.innerHTML = groups.map(g => `
      <div class="fy-ecogroup">
        <div class="fy-ecogroup__head">
          <h3 class="fy-ecogroup__title">${g.label}</h3>
          <a class="fy-ecogroup__more" href="${g.href}">See all →</a>
        </div>
        <div class="fy-ecogroup__list">
          ${g.items.map(l => `
            <a class="fy-ecocard" href="${l.url || g.href}" ${l.url ? 'target="_blank" rel="noopener"' : ''} data-vert="${(l.vertical_focus || l.vertical || [])[0] || 'other'}">
              <div class="fy-ecocard__name">${l.name}${l.flagship ? ' <span class="fy-flagship-pill">FLAGSHIP</span>' : ''}</div>
              <div class="fy-ecocard__city">${l.city || ''}</div>
              ${l.blurb ? `<p class="fy-ecocard__blurb">${l.blurb}</p>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Success stories
  const storiesEl = document.querySelector('[data-stories]');
  if (storiesEl) {
    storiesEl.innerHTML = success_stories.map(s => `
      <article class="fy-story" data-vert="${s.vertical}">
        <h3 class="fy-story__name">${s.name}</h3>
        <p class="fy-story__blurb">${s.blurb}</p>
        <div class="fy-story__vert">${vertLabel(verticals, s.vertical)}</div>
      </article>
    `).join('');
  }

  // Upcoming events (next 4 by date)
  const evEl = document.querySelector('[data-events]');
  if (evEl) {
    const upcoming = [...events].sort((a, b) => a.date_iso.localeCompare(b.date_iso)).slice(0, 4);
    evEl.innerHTML = upcoming.map(e => {
      const loc = findPlace(data, e.location_id);
      return `
        <a class="fy-card" href="${e.rsvp_url || '#'}" target="_blank" rel="noopener" data-vert="${e.vertical}">
          <div class="fy-card__body">
            <div class="fy-card__meta">${FY.helpers.formatDate(e.date_iso)} · ${loc ? loc.name : ''}</div>
            <h3 class="fy-card__title">${e.title}</h3>
            <p class="fy-card__blurb">${e.blurb}</p>
            <div class="fy-card__tags">
              <span class="fy-tag fy-tag--vert" data-vert="${e.vertical}">${vertLabel(verticals, e.vertical)}</span>
            </div>
          </div>
        </a>`;
    }).join('');
  }

  // Mentors (6 sample, no placeholders)
  const mentorsEl = document.querySelector('[data-mentors]');
  if (mentorsEl) {
    const { mentors } = data;
    const sample = mentors.filter(m => !m.placeholder).slice(0, 6);
    mentorsEl.innerHTML = sample.map(m => {
      const v = (m.vertical || [])[0] || 'other';
      return `
        <a class="fy-mentor-card" href="${m.linkedin && m.linkedin !== '#' ? m.linkedin : 'finder.html?type=mentors'}" target="_blank" rel="noopener" data-vert="${v}">
          <div class="fy-mentor-card__name">${m.name}</div>
          <div class="fy-mentor-card__role">${m.role} · ${m.company}</div>
          <p class="fy-mentor-card__blurb">${m.blurb || ''}</p>
          <div class="fy-card__tags" style="padding-top:10px;">
            ${(m.vertical || []).slice(0,3).map(vid =>
              `<span class="fy-tag fy-tag--vert" data-vert="${vid}">${vertLabel(verticals, vid)}</span>`
            ).join('')}
          </div>
        </a>`;
    }).join('');
  }

  // Partner wall
  const partnersEl = document.querySelector('[data-partners]');
  if (partnersEl) {
    partnersEl.innerHTML = partners.map(p => `
      <div class="fy-partner">${p.name}</div>
    `).join('');
  }
})();
