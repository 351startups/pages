/* Renderers for programs.html, ecosystem.html, community.html. */
(async function () {
  const data = await FY.loadData();
  const { verticals, programs, incubators, rd_centers, anchors, startups,
          partners, success_stories, stats } = data;
  const { vertLabel } = FY.helpers;

  // Programs page — group by vertical
  const progGrid = document.querySelector('[data-page-programs]');
  if (progGrid) {
    const groups = verticals.map(v => ({
      v,
      items: programs.filter(p => p.vertical === v.id)
    })).filter(g => g.items.length);

    progGrid.innerHTML = groups.map(g => `
      <div class="fy-vgroup" data-vert="${g.v.id}">
        <h2 class="fy-h2" style="display:flex;align-items:center;gap:12px;">
          <span class="fy-vcard__icon" style="margin:0;">${g.v.icon}</span>
          ${g.v.label}
        </h2>
        <div class="fy-grid" style="margin-top:24px;">
          ${g.items.map(p => `
            <a class="fy-card" href="${p.url || '#'}" target="_blank" rel="noopener" data-vert="${p.vertical}">
              <div class="fy-card__img">${p.name.split(' ')[0]}</div>
              <div class="fy-card__body">
                <div class="fy-card__meta">${p.duration || ''}</div>
                <h3 class="fy-card__title">${p.name}</h3>
                <p class="fy-card__blurb">${p.blurb || ''}</p>
                <div class="fy-card__tags">
                  <span class="fy-tag fy-tag--vert" data-vert="${p.vertical}">${vertLabel(verticals, p.vertical)}</span>
                  ${(p.stages || []).slice(0,3).map(s => `<span class="fy-tag">${s}</span>`).join('')}
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Ecosystem page — 4 entity-type sections, each grouped by city.
  const ecoPage = document.querySelector('[data-page-ecosystem]');
  if (ecoPage) {
    const groups = [
      { type: 'anchors',     label: 'Anchor Companies',          items: anchors,     desc: 'The industrial, energy and digital-infrastructure giants that anchor the Alentejo platform.' },
      { type: 'incubators',  label: 'Incubators & Accelerators', items: incubators,  desc: 'Where Alentejo-based founders get a desk, mentors, soft funding and a path into the regional pipeline.' },
      { type: 'rd_centers',  label: 'R&D Centres',               items: rd_centers,  desc: 'Universities, polytechnics and research labs producing the science and the talent.' },
      { type: 'startups',    label: 'Startups & Scaleups',       items: startups,    desc: 'Companies headquartered or with a major operation in the Alentejo region.' },
    ];

    ecoPage.innerHTML = groups.map(g => {
      const cities = [...new Set(g.items.map(l => l.city))];
      const blocks = cities.map(city => {
        const items = g.items.filter(l => l.city === city);
        return `
          <div class="fy-citygroup">
            <h3 class="fy-h3" style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;">
              ${city}
              <span class="fy-meta">${items.length} ${items.length === 1 ? 'entry' : 'entries'}</span>
            </h3>
            <div class="fy-ecogrid" style="margin-top:18px;">
              ${items.map(l => {
                const verts = l.vertical_focus || l.vertical || [];
                const v = verts[0] || 'other';
                return `
                  <a class="fy-ecocard fy-ecocard--lg" id="${l.id}" href="${l.url || '#'}" ${l.url ? 'target="_blank" rel="noopener"' : ''} data-vert="${v}">
                    <div class="fy-ecocard__name">${l.name}${l.flagship ? ' <span class="fy-flagship-pill">FLAGSHIP</span>' : ''}</div>
                    <div class="fy-ecocard__city">${l.city || ''}</div>
                    ${l.blurb ? `<p class="fy-ecocard__blurb">${l.blurb}</p>` : ''}
                    <div class="fy-card__tags">
                      ${verts.slice(0,3).map(vid =>
                        `<span class="fy-tag fy-tag--vert" data-vert="${vid}">${vertLabel(verticals, vid)}</span>`).join('')}
                    </div>
                  </a>`;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="fy-ecosection" id="${g.type}">
          <div class="fy-secthead">
            <div class="fy-secthead__text">
              <p class="fy-eyebrow">${g.label}</p>
              <h2 class="fy-h2">${g.label} <span class="fy-meta" style="font-size:0.6em;">${g.items.length} total</span></h2>
              <p class="fy-lead">${g.desc}</p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:48px;margin-top:24px;">${blocks}</div>
        </section>
      `;
    }).join('');
  }

  // Community page (stories + partners + stats)
  const commStories = document.querySelector('[data-page-stories]');
  if (commStories) {
    commStories.innerHTML = success_stories.map(s => `
      <article class="fy-story" data-vert="${s.vertical}">
        <h3 class="fy-story__name">${s.name}</h3>
        <p class="fy-story__blurb">${s.blurb}</p>
        <div class="fy-story__vert">${vertLabel(verticals, s.vertical)}</div>
      </article>
    `).join('');
  }
  const commPartners = document.querySelector('[data-page-partners]');
  if (commPartners) {
    commPartners.innerHTML = partners.map(p => `
      <div class="fy-partner">${p.name}</div>
    `).join('');
  }
  const commStats = document.querySelector('[data-page-stats]');
  if (commStats) {
    const items = [
      { num: '€' + stats.investment_pipeline_eur_b + 'B',  label: 'Investment pipeline' },
      { num: stats.datacenter_capacity_gw + ' GW',         label: 'Data-centre capacity' },
      { num: stats.industrial_land_ha.toLocaleString() + ' ha', label: 'ZILS Sines' },
      { num: stats.submarine_cables + '+',                  label: 'Subsea cables' },
      { num: stats.incubators + ' + ' + stats.rd_centers,   label: 'Incubators + R&D' },
    ];
    commStats.innerHTML = items.map(s => `
      <div class="fy-stat">
        <div class="fy-stat__num">${s.num}</div>
        <div class="fy-stat__label">${s.label}</div>
      </div>
    `).join('');
  }
})();
