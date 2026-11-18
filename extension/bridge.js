// Berjalan di situs JKT48 Top 10 saja. Meneruskan foto dari halaman ke ekstensi.
window.addEventListener('message', (e) => {
  if (e.source !== window || !e.data || typeof e.data !== 'object') return;
  if (e.data.jkt48 === 'ping') {
    window.postMessage({ jkt48: 'ext-ready' }, location.origin);
  }
  if (e.data.jkt48 === 'photos' && Array.isArray(e.data.files)) {
    const files = e.data.files
      .filter((f) => f && typeof f.dataUrl === 'string' && f.dataUrl.startsWith('data:image/'))
      .slice(0, 20)
      .map((f) => ({ name: String(f.name || 'foto.png').slice(0, 80), dataUrl: f.dataUrl }));
    chrome.runtime.sendMessage({ type: 'store', files }, () => {
      window.postMessage({ jkt48: 'photos-ack' }, location.origin);
    });
  }
});
window.postMessage({ jkt48: 'ext-ready' }, location.origin);
