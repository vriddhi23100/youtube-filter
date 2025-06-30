// Background service worker for the extension
chrome.runtime.onInstalled.addListener(async () => {
  // Set up default extension settings on install
  const settings = await chrome.storage.sync.get(['blockShorts', 'filterKeywords', 'keywords', 'blockedCount']);
  if (settings.blockShorts === undefined) {
    await chrome.storage.sync.set({ blockShorts: true });
  }
  if (settings.filterKeywords === undefined) {
    await chrome.storage.sync.set({ filterKeywords: false });
  }
  if (!settings.keywords) {
    await chrome.storage.sync.set({ keywords: [] });
  }
  if (settings.blockedCount === undefined) {
    await chrome.storage.sync.set({ blockedCount: 0 });
  }
});

// Update badge with blocked count
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedCount) {
    const count = changes.blockedCount.newValue || 0;
    const badgeText = count > 999 ? '999+' : count.toString();
    chrome.action.setBadgeText({
      text: count > 0 ? badgeText : ''
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#EF4444'
    });
  }
});

// Re-inject content script if needed on YouTube tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }).catch(() => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
    });
  }
});