// Berjalan di x.com / twitter.com. Jika ada foto yang baru dikirim dari situs JKT48 Top 10,
// foto itu ditempelkan ke kotak tweet. Tidak memposting apa pun: kamu tetap menekan "Post" sendiri.
(function () {
  // hanya di halaman tulis-tweet; twitter.com biasanya dialihkan ke x.com, jadi jangan ambil foto di sana
  if (location.hostname !== 'x.com' && location.hostname !== 'www.x.com') return;
  if (!/^\/(intent\/(post|tweet)|compose\/(post|tweet))/.test(location.pathname)) return;

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
        setTimeout(tick, 300);
      })();
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const attached = () => document.querySelector('[data-testid="attachments"] img, [data-testid="attachments"] video, [data-testid="attachments"] [role="group"]');

  function banner(text, final) {
    let b = document.getElementById('jkt48-ext-note');
    if (!b) {
      b = document.createElement('div'); b.id = 'jkt48-ext-note';
      b.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#e4002b;color:#fff;padding:10px 16px;border-radius:999px;font:600 14px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35)';
      document.body.appendChild(b);
    }
    b.textContent = text;
    clearTimeout(banner.t); banner.t = setTimeout(() => b.remove(), final ? 30000 : 90000);
  }

  chrome.runtime.sendMessage({ type: 'take' }, async (res) => {
    const items = res && res.files;
    if (!items || !items.length) return;
    const files = items.map(toFile).filter(Boolean);
    if (!files.length) return;
    banner('JKT48 Top 10: menempelkan foto...');

    const editor = await waitFor(() => document.querySelector('[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]'), 25000);
    const input = await waitFor(() => document.querySelector('input[type="file"][data-testid="fileInput"]') || document.querySelector('input[type="file"][accept*="image"]'), 10000);

    banner('JKT48 Top 10: kotak tweet ' + (editor ? 'ketemu' : 'TIDAK ketemu') + ', input file ' + (input ? 'ketemu' : 'TIDAK ketemu') + ', ' + files.length + ' foto...');
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));

    // cara 1: isi input unggah file
    if (input) {
      try {
        input.files = dt.files;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (e) {}
      for (let i = 0; i < 10 && !attached(); i++) await sleep(300);
    }
    // cara 2: simulasi tempel (paste) di kotak tweet
    if (!attached() && editor) {
      try {
        editor.focus();
        const d2 = new DataTransfer(); files.forEach((f) => d2.items.add(f));
        editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: d2, bubbles: true, cancelable: true }));
      } catch (e) {}
      for (let i = 0; i < 10 && !attached(); i++) await sleep(300);
    }
    // cara 3: simulasi seret-lepas (drop) ke kotak tweet
    if (!attached() && editor) {
      try {
        const d3 = new DataTransfer(); files.forEach((f) => d3.items.add(f));
        ['dragenter', 'dragover', 'drop'].forEach((t) => editor.dispatchEvent(new DragEvent(t, { dataTransfer: d3, bubbles: true, cancelable: true })));
      } catch (e) {}
      for (let i = 0; i < 10 && !attached(); i++) await sleep(300);
    }

    if (attached()) { banner('JKT48 Top 10: foto sudah menempel. Tulis lalu tekan Post sendiri ya.', true); chrome.runtime.sendMessage({ type: 'done' }); }
    else banner('JKT48 Top 10: foto belum bisa ditempel otomatis. Pakai tombol Unduh foto di situs ya. (editor: ' + !!editor + ', input: ' + !!input + ')', true);
  });
})();
