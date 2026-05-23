// background.js — Link Parser Ultra
// Receives URL arrays from popup and opens them all,
// independent of popup lifecycle.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'openTabs') {
    const { urls, active } = msg;
    (async () => {
      for (const url of urls) {
        await chrome.tabs.create({ url, active: !!active });
      }
      sendResponse({ done: true, count: urls.length });
    })();
    return true; // keep channel open for async response
  }
});
