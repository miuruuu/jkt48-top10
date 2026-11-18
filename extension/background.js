// Menyimpan foto sementara (maks. 3 menit) di browser ini saja. Tidak ada yang dikirim ke server mana pun.
const MAX_AGE_MS = 3 * 60 * 1000;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'store') {
    chrome.storage.local.set({ pending: { t: Date.now(), files: msg.files } }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg && msg.type === 'take') {
    chrome.storage.local.get('pending', ({ pending }) => {
      chrome.storage.local.remove('pending');
      if (pending && Date.now() - pending.t < MAX_AGE_MS) sendResponse({ files: pending.files });
      else sendResponse({ files: [] });
    });
    return true;
  }
});
