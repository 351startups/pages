/* Shared data loader. Caches the fetch promise so multiple pages/components share one request. */
window.FY = window.FY || {};

FY.loadData = (function () {
  let cached;
  return function () {
    if (cached) return cached;
    cached = fetch('assets/data/data.json')
      .catch(() => fetch('/assets/data/data.json'))
      .then(r => r.json());
    return cached;
  };
})();

FY.helpers = {
  byId(arr, id) { return arr.find(x => x.id === id); },
  vertLabel(verts, id) { const v = verts.find(x => x.id === id); return v ? v.label : id; },
  vertColor(verts, id) { const v = verts.find(x => x.id === id); return v ? v.color : '#C9764D'; },
  /* Look up an entity by id across all four place-like arrays. Used by events / stories. */
  findPlace(data, id) {
    const pools = ['incubators', 'rd_centers', 'anchors', 'startups'];
    for (const k of pools) {
      const arr = data[k] || [];
      const hit = arr.find(x => x.id === id);
      if (hit) return hit;
    }
    return null;
  },
  formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return String(n);
  },
  qs(name, def) {
    const v = new URLSearchParams(location.search).get(name);
    return v == null ? def : v;
  },
  pushQS(state) {
    const p = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => { if (v) p.set(k, v); });
    const q = p.toString();
    history.pushState(state, '', q ? `?${q}` : location.pathname);
  }
};
