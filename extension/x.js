// Berjalan di x.com / twitter.com. Jika ada foto yang baru dikirim dari situs JKT48 Top 10,
// foto itu ditempelkan ke kotak tweet (input unggah file). Tidak memposting apa pun: kamu tetap menekan "Post" sendiri.
(function () {
  function toFile(item) {
    const m = /^data:([^;,]+)(;base64)?,(.*)$/.exec(item.dataUrl);
    if (!m) return null;
    const bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], item.name, { type: m[1] });
  }

  function waitFor(fn, ms) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      (function tick() {
        const v = fn();
        if (v) return resolve(v);
        if (Date.now() - t0 > ms) return resolve(null);
        setTimeout(tick, 400);
      })();
    });
  }

  chrome.runtime.sendMessage({ type: 'take' }, async (res) => {
    const items = res && res.files;
    if (!items || !items.length) return;
    const input = await waitFor(() => document.querySelector('input[type="file"][data-testid="fileInput"]') || document.querySelector('input[type="file"][accept*="image"]'), 25000);
    if (!input) return;
    const dt = new DataTransfer();
    items.map(toFile).filter(Boolean).forEach((f) => dt.items.add(f));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
})();
