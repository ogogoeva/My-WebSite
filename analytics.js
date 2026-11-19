// Inactive compatibility file for previously cached pages. No analytics is loaded.
(() => {
  const counter = 114379082;
  if (typeof window.ym === 'function') {
    try { window.ym(counter, 'destruct'); } catch {}
  }
  window['disableYaCounter' + counter] = true;
  try { localStorage.removeItem('ogogo-statistics-consent-v1'); } catch {}
  document.querySelectorAll('.analytics-consent,[data-statistics-settings]').forEach(element => element.remove());
})();
