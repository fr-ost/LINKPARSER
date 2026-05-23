# Privacy Policy — Link Parser Ultra

**Effective Date:** May 23, 2026
**Last Updated:** May 23, 2026
**Developer:** Shahriar Ahmed
**Contact:** https://t.me/igfrostt

---

## Overview

Link Parser Ultra is a Chrome browser extension that extracts URLs from text or webpages and opens them in new tabs. This privacy policy explains clearly and completely what data the extension does and does not collect, store, transmit, or share.

**The short version: Link Parser Ultra collects nothing. No data ever leaves your browser.**

---

## 1. Information We Do Not Collect

Link Parser Ultra does not collect, record, transmit, or share any of the following:

- Browsing history or visited URLs
- Text you paste into the extension
- Links you extract, open, copy, or export
- Pages you choose to scan
- Your IP address
- Device identifiers
- Browser fingerprints
- Crash reports or diagnostic data
- Usage statistics or analytics
- Personal information of any kind

There is no analytics system, no telemetry pipeline, no logging infrastructure, and no remote server associated with this extension. The developer has no way to see what you do with the extension because no data channel exists.

---

## 2. Data Stored Locally on Your Device

The extension stores a small amount of data exclusively on your own device using browser-native storage APIs. This data never leaves your browser.

### 2.1 User Preferences — chrome.storage.local

Three settings are saved to `chrome.storage.local` so your preferences persist across sessions:

| Setting | What it stores |
|---|---|
| Remove duplicate links | Boolean (true/false) |
| Open tabs in background | Boolean (true/false) |
| Twitter / X only mode | Boolean (true/false) |

No URLs, no text content, and no personal information are written to `chrome.storage`.

### 2.2 Session History — localStorage

The extension saves the last 25 link-parsing sessions to your browser's `localStorage`. Each saved session contains:

- A timestamp (date and time of the session)
- Up to 100 URLs from that session
- The total link count

This history exists solely to let you restore a previous session if you close the extension and need those links again. It is stored entirely on your device and is never synchronized, uploaded, or transmitted anywhere.

You can delete all history at any time by clicking the trash icon in the extension header.

---

## 3. Permissions Used and Why

The extension requests the following Chrome permissions. Each is used for one specific purpose and nothing else.

### tabs
Used to open new browser tabs when you click "Open All" or "Open Selected." The extension calls `chrome.tabs.create()` with the URLs you have chosen to open. This permission is not used to read, monitor, or access any information about your existing tabs.

### activeTab
Used to access your currently active browser tab when you click "Scan Page Now" in the From Page tab. Access is granted only at the moment of that explicit user action and ends immediately after the scan completes. The extension never accesses any tab passively or without your direct action.

### scripting
Used to inject a one-time read-only function into your active tab when you click "Scan Page Now." The function reads the `href` attributes of all anchor elements on the page and returns the list of URLs to the extension. The function does not read page text, cookies, form data, or any other content. It does not modify the page in any way. It executes once and is gone.

### storage
Used to save and load your three preference settings (described in Section 2.1) via `chrome.storage.local`.

### clipboardWrite
Used when you click "Copy All" or an individual link's copy button. The selected URLs are written to your system clipboard so you can paste them elsewhere. This only activates on your explicit click.

### clipboardRead
Used when you click the "Paste" button in the text input area. The extension reads your clipboard text so you can paste it into the parser without pressing Ctrl+V manually. This only activates on your explicit click.

### host_permissions: \<all_urls\>
Required by Chrome's Manifest V3 specification for `chrome.scripting.executeScript()` to work on websites you choose to scan. Without this permission, the page scanner would only work on a fixed list of hard-coded domains. This permission does not allow the extension to access any page passively. No content script runs on any page you visit during normal browsing. The permission is exercised only when you click "Scan Page Now."

---

## 4. Third-Party Services

The extension makes one external network request: loading website favicons from Google's favicon service.

**Google Favicon Service**
URL pattern: `https://www.google.com/s2/favicons?sz=32&domain_url=[domain]`

When a link is displayed in the results list, the extension requests a 32×32 favicon image from Google using only the domain name of that link (e.g., `github.com`, `youtube.com`). The full URL of the extracted link is never sent. Only the top-level domain is included in the request.

This request is functionally identical to what your browser does when displaying a favicon in any bookmark or tab. Google's handling of this request is governed by [Google's Privacy Policy](https://policies.google.com/privacy).

If you are offline or if Google's service does not have a favicon for a domain, a gray placeholder image is shown. All extension functionality remains unaffected.

No other external network request is made by this extension under any circumstance.

---

## 5. Data Sharing

No data is shared with anyone. There are no third-party analytics integrations, no advertising networks, no data brokers, no affiliate tracking systems, and no business partners receiving any information from this extension. The developer cannot share data that is never collected.

---

## 6. Incognito Mode

The extension does not run in Incognito mode by default. Chrome prevents extensions from accessing Incognito windows unless the user explicitly enables this in the extension's settings page (`chrome://extensions`).

If you enable the extension in Incognito mode, all functionality works identically, with one difference: `localStorage` in Incognito is isolated from your normal session. History saved during an Incognito session is not visible in a normal session and is automatically deleted when the Incognito window closes.

---

## 7. Children's Privacy

This extension is a general-purpose productivity tool with no content targeting children. It does not collect any personal information from any user, including children. It is not directed at children under the age of 13.

---

## 8. Security

Because no user data is transmitted to any server, there is no remote data store to breach. The only data at risk is the session history stored in your browser's `localStorage`, which is protected by your browser's standard same-origin security model. Only the Link Parser Ultra extension can access its own `localStorage` data; no website or other extension can read it.

User preferences stored in `chrome.storage.local` are similarly protected by Chrome's extension storage isolation model.

---

## 9. Data Retention and Deletion

All locally stored data can be deleted at any time:

**Delete session history:** Click the trash icon in the extension header. All 25 saved sessions are immediately and permanently removed from `localStorage`.

**Delete preferences:** Uninstalling the extension removes all `chrome.storage.local` data associated with it automatically. Chrome cleans up extension storage on uninstall.

**Delete everything:** Uninstall the extension from `chrome://extensions`. All extension data — preferences and history — is permanently deleted.

You can also clear the extension's `localStorage` data by clearing your browser's site data in Chrome settings, or by using Chrome's developer tools to manually inspect and clear `localStorage` for the extension origin.

---

## 10. Changes to This Policy

If this privacy policy changes, the updated version will be published at the same location with a revised "Last Updated" date. Because the extension collects no personal data, changes to this policy are unlikely to affect your privacy in any meaningful way. However, any material changes (such as the introduction of an analytics system or external data storage) would be clearly disclosed here before they take effect.

---

## 11. Contact

If you have any questions about this privacy policy or about how the extension handles data, please contact the developer directly.

**Developer:** Shahriar Ahmed
**Telegram:** https://t.me/igfrostt

---

## Summary

| What | Collected? | Stored? | Transmitted? |
|---|---|---|---|
| URLs you extract | No | Locally only (history) | No |
| Text you paste | No | No | No |
| Pages you scan | No | No | No |
| Tabs you open | No | No | No |
| Clipboard content | No | No | No |
| Browsing history | No | No | No |
| Personal information | No | No | No |
| Analytics / usage data | No | No | No |
| Your preferences | No | Locally only | No |

*Link Parser Ultra v4.0 — Private by design.*
*© Shahriar Ahmed · https://t.me/igfrostt*
