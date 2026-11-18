// Menyimpan foto sementara (maks. 3 menit) di browser ini saja. Tidak ada yang dikirim ke server mana pun.
const MAX_AGE_MS = 3 * 60 * 1000;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'store') {
    chrome.storage.local.set({ pending: { t: Date.now(), files: msg.files } }, () => sendResponse({ ok: !chrome.runtime.lastError }));
    return true;
  }
  if (msg && msg.type === 'take') {
    // foto baru dihapus setelah berhasil menempel ('done'), supaya pengalihan halaman tidak membuatnya hilang
    chrome.storage.local.get('pending', ({ pending }) => {
      if (pending && Date.now() - pending.t < MAX_AGE_MS) sendResponse({ files: pending.files });
      else { chrome.storage.local.remove('pending'); sendResponse({ files: [] }); }
    });
    return true;
  }
  if (msg && msg.type === 'done') {
    chrome.storage.local.remove('pending');
    sendResponse({ ok: true });
  }
});
