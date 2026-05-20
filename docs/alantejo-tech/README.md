# Alentejo Tech

Static, multi-page site for **Alentejo Tech** — a co-branded project from **351 Startups** (Portugal's largest startup association) and **Start Campus** (developer of SINES DC, Europe's largest sustainable data-centre campus). Maps every anchor company, incubator, R&D centre and startup operating in the Alentejo region — filterable by vertical (Data Centre & AI Infra, Energy, Agritech, Aerospace, Deep Tech, CleanTech, AI, Other) and founder stage.

Demo built for a partnership-proposal conversation with Start Campus.

## Stack

- Vanilla HTML/CSS/ES2020 — no bundler, no build step
- Single source of truth: `assets/data/data.json`
- Hosts on **GitHub Pages** as-is. Each page also has an Elementor-friendly snippet under `/embed/`.

## File map

```
index.html              Homepage — hero, stats, verticals, ecosystem map, programs, events, stories, mentors, partners
ecosystem.html          Full ecosystem map (anchors / incubators / R&D / startups), grouped by sub-region
programs.html           All programs grouped by vertical
finder.html             Unified filterable finder
community.html          About / story / 351 + Start Campus narrative
contact.html            Join (founders) + partner form
locations.html          Redirect → ecosystem.html (kept for back-compat)
embed/finder.html       Drop-in Elementor snippet for the finder
embed/locations.html    Drop-in Elementor snippet for the locations grid (legacy)
embed/stats.html        Drop-in Elementor snippet for the stat bar
embed/partner-wall.html Drop-in Elementor snippet for the partner wall
partials/header.html    Shared nav (injected by include.js)
partials/footer.html    Shared footer with co-branded 351 + Start Campus logos
assets/css/styles.css   Full-site dark theme — Alentejo earth palette (ochre, terracotta, olive on Atlantic-night)
assets/css/embed.css    Same theme scoped under .fy-embed for CMS embedding
assets/js/data-loader.js  fetch() helper, caches data.json, cross-entity place lookup
assets/js/include.js    Header/footer injector + nav highlighter
assets/js/home.js       Homepage section renderers
assets/js/finder.js     Finder URL-state + filtering (10 entity types)
assets/js/page-pages.js Renderers for programs / ecosystem / community
assets/data/data.json   All content
sitemap.xml / robots.txt
```

## Data model

`data.json` has four place-like arrays (`incubators`, `rd_centers`, `anchors`, `startups`) plus the content arrays (`programs`, `events`, `perks`, `mentors`, `partners`, `success_stories`). Events and stories reference any place via `location_id` — `FY.helpers.findPlace(data, id)` searches across all four arrays.

Verticals: `datacenter`, `energy`, `agritech`, `aerospace`, `deeptech`, `cleantech`, `ai`, `other`. Each vertical has a CSS color variable; the `[data-vert="…"]` selector drives accent colors across cards.

## Branding

- Wordmark: "ALENTEJO TECH" in Space Grotesk uppercase with a small `AT` mark.
- Co-branded footer: a project from **351 Startups** + **Start Campus**.
- Palette: Atlantic-night `#15182A` background · terracotta `#C9764D` accent · ochre `#E5A04C` for stats · vertical-specific accents driven by `[data-vert]` attributes.

## Key sources (researched & verified 2026-05-19)

- [Start Campus — SINES DC](https://www.startcampus.pt/sines) — 1.2 GW IT capacity, €8.5B, SIN01 operational, Microsoft + Nscale + NVIDIA Rubin/Blackwell partnership
- [AICEP Global Parques — ZILS](https://globalparques.pt/en/zils-sines-industrial-and-logistics-zone/) — 2,375 ha industrial zone, €20B+ committed investment
- [MadoquaPower2X](https://madoquapower2x.com/) — 500 MW → 1.2 GW green H₂ + ammonia, breaks ground 2026
- [Sines Tecnopolo / BIC Alentejo](https://www.sinestecnopolo.org/) — 40+ SME incubator, founded 2007
- [Sines Tech — Innovation & Data Centre Hub](https://sinestech.pt/) — European Enterprise Promotion Awards 2023 winner
- [ADRAL — Rede de Incubadoras do Alentejo](https://www.adral.pt/) — ÉvoraTech, CAESC, CAME, StartUP Alentejo
- [PACT — Évora](https://pact.pt/) — 50+ companies, 540+ workers, aerospace/digital health/software cluster
- [BioBIP — Portalegre](https://www.biobip.pt/), [CEBAL — Beja](https://www.cebal.pt/)
- [EDIA — Alqueva](https://www.edia.pt/en/) — 130,000 ha irrigation network
- [Aernnova Évora](https://www.aernnova.com/news/aernnova-evora) — ex-Embraer plants, ~500 jobs, KC-390 / E-Jet structures
- Submarine cables landing at Sines: [EllaLink](https://ella.link/), [Medusa](https://www.submarinenetworks.com/en/systems/asia-europe-africa/medusa), [Olisipo](https://www.submarinenetworks.com/en/systems/intra-europe/sines-lisbon), 2Africa, Equiano, Nuvem

## Run locally

```sh
cd "/Users/ferna/code/Claude/351 Startups/Proposals/Alantejo Tech/foundersyard"
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub Pages

```sh
git init && git add . && git commit -m "Initial Alentejo Tech site"
gh repo create alentejotech --public --push
# in the repo settings: Pages → branch main → /
```

## Editing content

Update `assets/data/data.json` — every list on the site reads from it.

- Add a new anchor / incubator / R&D centre / startup: append to the relevant top-level array. Filter on the finder picks it up immediately.
- Add a new program / event / perk / mentor / partner: append to the relevant array.
- Add a vertical: edit `verticals[]` and add a matching `--fy-<id>` CSS variable + `[data-vert="<id>"]` rule in `styles.css`.
