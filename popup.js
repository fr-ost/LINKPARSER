// ═══════════════════════════════════════════════════════
//  Link Parser Ultra — popup.js
//  © Shahriar Ahmed · https://t.me/igfrostt
// ═══════════════════════════════════════════════════════

// ── CATEGORY MAPS ──────────────────────────────────────
const DOMAINS = {
  twitter:  ['twitter.com', 'x.com', 't.co'],
  social:   ['instagram.com', 'facebook.com', 'linkedin.com', 'tiktok.com',
             'snapchat.com', 'pinterest.com', 'reddit.com', 'tumblr.com',
             'threads.net', 'mastodon.social', 'discord.com', 'discord.gg',
             'telegram.org', 't.me', 'whatsapp.com'],
  video:    ['youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv',
             'dailymotion.com', 'rumble.com', 'odysee.com', 'bitchute.com',
             'kick.com', 'streamable.com'],
  dev:      ['github.com', 'gitlab.com', 'stackoverflow.com', 'npmjs.com',
             'pypi.org', 'developer.mozilla.org', 'codepen.io', 'jsfiddle.net',
             'replit.com', 'vercel.app', 'netlify.app', 'cloudflare.com',
             'docs.anthropic.com', 'openai.com', 'huggingface.co'],
  news:     ['medium.com', 'substack.com', 'dev.to', 'hashnode.com',
             'techcrunch.com', 'theverge.com', 'wired.com', 'bbc.com',
             'cnn.com', 'reuters.com', 'nytimes.com', 'bloomberg.com'],
};

const BADGE = {
  twitter: ['𝕏 Twitter', 'b-twitter'],
  social:  ['Social',    'b-social'],
  video:   ['Video',     'b-video'],
  dev:     ['Dev',       'b-dev'],
  news:    ['News',      'b-news'],
  other:   ['Link',      'b-other'],
};

// ── STATE ──────────────────────────────────────────────
let allLinks     = [];   // full result set
let shownLinks   = [];   // after search filter
let activeTabId  = 'text';
let pageFilter   = 'all';

// ── DOM REFS ───────────────────────────────────────────
const $ = id => document.getElementById(id);

const inputBox      = $('inputBox');
const parseBtn      = $('parseBtn');
const scanBtn       = $('scanBtn');
const openAllBtn    = $('openAllBtn');
const openSelBtn    = $('openSelBtn');
const copyAllBtn    = $('copyAllBtn');
const exportBtn     = $('exportBtn');
const searchInput   = $('searchInput');
const selAll        = $('selAll');
const linksList     = $('linksList');
const resultsSection= $('resultsSection');
const toast         = $('toast');
const settingsBtn   = $('settingsBtn');
const settingsPanel = $('settingsPanel');
const clearHistBtn  = $('clearHistBtn');
const pasteBtn      = $('pasteBtn');
const clearTxtBtn   = $('clearTxtBtn');
const tgLink        = $('tgLink');
const progBar       = $('progBar');
const progFill      = $('progFill');
const scanMsg       = $('scanMsg');
const charCount     = $('charCount');
const tabIndicator  = $('tabIndicator');
const tabsEl        = $('tabs');

// Settings
const dedupToggle       = $('dedupToggle');
const bgTabToggle       = $('bgTabToggle');
const twitterOnlyToggle = $('twitterOnlyToggle');

// ── UTILS ──────────────────────────────────────────────
function showToast(msg, ms = 2200) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), ms);
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url.split('/')[2] || url; }
}

function getCategory(domain) {
  for (const [cat, list] of Object.entries(DOMAINS)) {
    if (list.some(d => domain === d || domain.endsWith('.' + d))) return cat;
  }
  return 'other';
}

function faviconUrl(domain) {
  return `https://www.google.com/s2/favicons?sz=32&domain_url=${domain}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── LINK EXTRACTION ────────────────────────────────────
function extractLinks(text) {
  const patterns = [
    // Full URLs with scheme
    /https?:\/\/[^\s<>"'`\])}\\,]+/gi,
    // www. without scheme
    /\bwww\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s<>"'`\])}\\,]*/gi,
    // Common bare domains without www (github.com/user, t.me/user, etc.)
    /\b(?:github|gitlab|twitter|x|youtube|youtu\.be|t\.me|instagram|linkedin|tiktok|reddit|discord|npmjs|dev\.to|medium|substack|vimeo|twitch)(?:\.[a-z]{2,3}){1,2}\/[^\s<>"'`\])}\\,]*/gi,
  ];

  const found = new Set();
  for (const re of patterns) {
    const matches = text.match(re) || [];
    matches.forEach(m => found.add(m));
  }

  const clean = [];
  for (let link of found) {
    link = link.trim().replace(/[.,!?;:'")\]}>\\]+$/, '');
    if (!link.startsWith('http')) link = 'https://' + link;
    try { new URL(link); clean.push(link); } catch { /* skip */ }
  }

  return clean;
}

function processLinks(links) {
  if (dedupToggle.checked) links = [...new Set(links)];
  if (twitterOnlyToggle.checked) {
    links = links.filter(l => {
      const d = getDomain(l);
      return DOMAINS.twitter.some(td => d === td || d.endsWith('.' + td));
    });
  }
  return links;
}

// ── RENDER ──────────────────────────────────────────────
function renderLinks(links, label = 'Parsed Links') {
  allLinks   = links;
  shownLinks = [...links];
  updateStats(links);
  buildList(shownLinks);
  $('resultsLbl').textContent = label;
  resultsSection.style.display = 'flex';
  searchInput.value = '';
  selAll.checked = false;
  if (links.length > 0) saveHistory(links);
}

function buildList(links) {
  if (!links.length) {
    linksList.innerHTML = `<div class="empty-state"><div class="e-icon">🔍</div>No links match the filter.</div>`;
    return;
  }

  linksList.innerHTML = links.map((url, i) => {
    const domain = getDomain(url);
    const cat    = getCategory(domain);
    const [bl, bc] = BADGE[cat];
    const display = url.length > 52 ? url.slice(0, 52) + '…' : url;
    const enc    = encodeURIComponent(url);

    return `<div class="link-item" data-url="${enc}">
      <input type="checkbox" class="link-chk">
      <img class="link-fav" src="${faviconUrl(domain)}"
           onerror="this.style.visibility='hidden'" alt="">
      <div class="link-info">
        <div class="link-domain">${domain}</div>
        <div class="link-url" title="${url}">${display}</div>
      </div>
      <span class="badge ${bc}">${bl}</span>
      <div class="link-btns">
        <button class="labtn la-copy" data-url="${enc}" title="Copy link"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></button>
        <button class="labtn la-open" data-url="${enc}" title="Open link"><svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg></button>
      </div>
    </div>`;
  }).join('');

  // Per-item copy
  linksList.querySelectorAll('.la-copy').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      navigator.clipboard.writeText(decodeURIComponent(btn.dataset.url))
        .then(() => showToast('✅ Copied!'));
    });
  });

  // Per-item open
  linksList.querySelectorAll('.la-open').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      chrome.tabs.create({ url: decodeURIComponent(btn.dataset.url), active: !bgTabToggle.checked });
    });
  });

  // Checkbox → selected class
  linksList.querySelectorAll('.link-chk').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.link-item').classList.toggle('selected', cb.checked);
      syncSelectAll();
    });
  });
}

function updateStats(links) {
  const unique  = [...new Set(links)].length;
  const domains = new Set(links.map(getDomain)).size;
  const social  = links.filter(l => {
    const c = getCategory(getDomain(l));
    return c === 'social' || c === 'twitter';
  }).length;

  $('stTotal').textContent   = links.length;
  $('stUnique').textContent  = unique;
  $('stDomains').textContent = domains;
  $('stSocial').textContent  = social;
}

function syncSelectAll() {
  const all     = linksList.querySelectorAll('.link-chk');
  const checked = linksList.querySelectorAll('.link-chk:checked');
  selAll.indeterminate = checked.length > 0 && checked.length < all.length;
  selAll.checked = all.length > 0 && checked.length === all.length;
}

// ── HISTORY ────────────────────────────────────────────
const LS_KEY = 'lp_history';

function saveHistory(links) {
  const hist = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  hist.unshift({ ts: Date.now(), links: links.slice(0, 100), count: links.length });
  localStorage.setItem(LS_KEY, JSON.stringify(hist.slice(0, 25)));
}

function loadHistory() {
  const hist    = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  const content = $('histContent');

  if (!hist.length) {
    content.innerHTML = '<div class="hist-empty">📭 No history yet.<br>Parse some links to see sessions here.</div>';
    return;
  }

  content.innerHTML = hist.map((e, i) => {
    const d = new Date(e.ts);
    const t = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const preview = e.links.slice(0, 3).map(getDomain).join(', ') + (e.links.length > 3 ? '…' : '');
    return `<div class="hist-item" data-i="${i}">
      <div class="hist-meta">
        <span class="hist-count">${e.count} links</span>
        <span class="hist-time">${t}</span>
      </div>
      <div class="hist-preview">${preview}</div>
    </div>`;
  }).join('');

  content.querySelectorAll('.hist-item').forEach(el => {
    el.addEventListener('click', () => {
      const e = hist[+el.dataset.i];
      switchTab('text');
      renderLinks(e.links, 'Restored Session');
      showToast(`📂 Restored ${e.count} links`);
    });
  });
}

// ── TABS ───────────────────────────────────────────────
function moveIndicator(tabEl) {
  if (!tabEl || !tabIndicator) return;
  tabIndicator.style.left  = tabEl.offsetLeft + 'px';
  tabIndicator.style.width = tabEl.offsetWidth + 'px';
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
  activeTabId = name;
  moveIndicator(document.querySelector(`.tab[data-tab="${name}"]`));
  if (name === 'history') loadHistory();
}

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => switchTab(t.dataset.tab));
});

// ── TEXT PARSE ─────────────────────────────────────────
parseBtn.addEventListener('click', () => {
  const text = inputBox.value.trim();
  if (!text) { showToast('⚠ Paste some text first!'); return; }

  let links = extractLinks(text);
  links = processLinks(links);

  if (!links.length) { showToast('❌ No valid links found.'); return; }

  renderLinks(links);
  showToast(`✅ Found ${links.length} link${links.length !== 1 ? 's' : ''}!`);
});

// ── CHAR COUNT ─────────────────────────────────────────
inputBox.addEventListener('input', () => {
  charCount.textContent = inputBox.value.length.toLocaleString() + ' chars';
});

// ── PAGE SCAN ──────────────────────────────────────────
scanBtn.addEventListener('click', async () => {
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="dots"><span></span><span></span><span></span></span> Scanning…';
  scanMsg.style.display = 'block';
  scanMsg.textContent = 'Injecting scanner into page…';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      showToast('❌ Cannot scan browser internal pages.');
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const hrefs = Array.from(document.querySelectorAll('a[href]'))
          .map(a => {
            try { return new URL(a.href, location.href).href; }
            catch { return null; }
          })
          .filter(h => h && (h.startsWith('http://') || h.startsWith('https://')));
        return [...new Set(hrefs)];
      }
    });

    let links = results?.[0]?.result || [];
    scanMsg.textContent = `Found ${links.length} raw links. Filtering…`;

    // Apply category filter
    if (pageFilter !== 'all') {
      const filterList = DOMAINS[pageFilter] || [];
      links = links.filter(l => {
        const d = getDomain(l);
        return filterList.some(fd => d === fd || d.endsWith('.' + fd));
      });
    }

    links = processLinks(links);

    if (!links.length) {
      showToast(`❌ No ${pageFilter === 'all' ? '' : pageFilter + ' '}links found.`);
      return;
    }

    switchTab('text');
    renderLinks(links, `Page Links · ${tab.title?.slice(0, 30) || 'Current Tab'}`);
    showToast(`✅ Extracted ${links.length} links from page!`);
  } catch (err) {
    console.error(err);
    showToast('❌ Could not scan page. Try refreshing first.');
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>Scan Page Now';
    scanMsg.style.display = 'none';
  }
});

// Page filter chips
document.querySelectorAll('#pageChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#pageChips .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    pageFilter = chip.dataset.filter;
  });
});

// ── SELECT ALL ─────────────────────────────────────────
selAll.addEventListener('change', () => {
  linksList.querySelectorAll('.link-chk').forEach(cb => {
    cb.checked = selAll.checked;
    cb.closest('.link-item').classList.toggle('selected', selAll.checked);
  });
});

// ── SEARCH FILTER ──────────────────────────────────────
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  shownLinks = q ? allLinks.filter(l => l.toLowerCase().includes(q)) : [...allLinks];
  buildList(shownLinks);
  selAll.checked = false;
});

// ── OPEN ALL ───────────────────────────────────────────
openAllBtn.addEventListener('click', () => {
  if (!shownLinks.length) { showToast('⚠ No links to open!'); return; }
  progBar.style.display = 'block';
  progFill.style.width = '60%';
  chrome.runtime.sendMessage(
    { action: 'openTabs', urls: shownLinks, active: false },
    () => {
      progFill.style.width = '100%';
      setTimeout(() => { progBar.style.display = 'none'; progFill.style.width = '0%'; }, 600);
      showToast(`🚀 Opened ${shownLinks.length} tabs!`);
    }
  );
});

// ── OPEN SELECTED ──────────────────────────────────────
openSelBtn.addEventListener('click', () => {
  const checked = linksList.querySelectorAll('.link-chk:checked');
  if (!checked.length) { showToast('⚠ Select links first!'); return; }
  const urls = Array.from(checked).map(cb => decodeURIComponent(cb.closest('.link-item').dataset.url));
  chrome.runtime.sendMessage(
    { action: 'openTabs', urls, active: false },
    () => showToast(`🚀 Opened ${urls.length} tab${urls.length !== 1 ? 's' : ''}!`)
  );
});

// ── COPY ALL ───────────────────────────────────────────
copyAllBtn.addEventListener('click', () => {
  if (!shownLinks.length) { showToast('⚠ Nothing to copy!'); return; }
  navigator.clipboard.writeText(shownLinks.join('\n'))
    .then(() => showToast(`📋 Copied ${shownLinks.length} links!`));
});

// ── EXPORT TXT ─────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  if (!shownLinks.length) { showToast('⚠ Nothing to export!'); return; }

  const ts      = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const content = `Link Parser Ultra Export · ${ts}\n${'─'.repeat(50)}\n${shownLinks.join('\n')}`;
  const blob    = new Blob([content], { type: 'text/plain' });
  const url     = URL.createObjectURL(blob);
  const a       = Object.assign(document.createElement('a'), { href: url, download: `links_${ts}.txt` });
  a.click();
  URL.revokeObjectURL(url);
  showToast(`📥 Exported ${shownLinks.length} links!`);
});

// ── SETTINGS ───────────────────────────────────────────
settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('open');
});

// Persist settings
const SETTINGS_KEY = 'lp_settings';

function saveSettings() {
  chrome.storage.local.set({
    [SETTINGS_KEY]: {
      dedup:       dedupToggle.checked,
      bgTab:       bgTabToggle.checked,
      twitterOnly: twitterOnlyToggle.checked,
    }
  });
}

function loadSettings() {
  chrome.storage.local.get(SETTINGS_KEY, data => {
    const s = data[SETTINGS_KEY];
    if (!s) return;
    dedupToggle.checked       = s.dedup       ?? true;
    bgTabToggle.checked       = s.bgTab       ?? false;
    twitterOnlyToggle.checked = s.twitterOnly ?? false;
  });
}

[dedupToggle, bgTabToggle, twitterOnlyToggle].forEach(t => t.addEventListener('change', saveSettings));

// ── MISC CONTROLS ──────────────────────────────────────
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputBox.value = text;
    charCount.textContent = text.length.toLocaleString() + ' chars';
    showToast('📋 Pasted from clipboard!');
  } catch {
    showToast('⚠ Use Ctrl+V to paste manually.');
  }
});

clearTxtBtn.addEventListener('click', () => {
  inputBox.value = '';
  charCount.textContent = '0 chars';
  inputBox.focus();
});

clearHistBtn.addEventListener('click', () => {
  if (!confirm('Clear all history?')) return;
  localStorage.removeItem(LS_KEY);
  if (activeTabId === 'history') loadHistory();
  showToast('🗑 History cleared!');
});

tgLink.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://t.me/igfrostt' });
});

// ── INIT ───────────────────────────────────────────────
loadSettings();
window.addEventListener('load', () => moveIndicator(document.querySelector('.tab.active')));
moveIndicator(document.querySelector('.tab.active'));
