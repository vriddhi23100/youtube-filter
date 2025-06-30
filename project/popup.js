document.addEventListener('DOMContentLoaded', async () => {
  // Load settings from storage
  const settings = await chrome.storage.sync.get([
    'blockShorts',
    'filterKeywords', 
    'keywords',
    'blockedCount'
  ]);
  
  // UI elements
  const blockShortsToggle = document.getElementById('blockShorts');
  const filterKeywordsToggle = document.getElementById('filterKeywords');
  const keywordsSection = document.getElementById('keywordsSection');
  const keywordInput = document.getElementById('keywordInput');
  const addKeywordBtn = document.getElementById('addKeyword');
  const keywordsList = document.getElementById('keywordsList');
  const blockedCountEl = document.getElementById('blockedCount');
  const resetStatsBtn = document.getElementById('resetStats');
  
  // Set initial UI state
  blockShortsToggle.checked = settings.blockShorts !== false;
  filterKeywordsToggle.checked = settings.filterKeywords === true;
  keywordsSection.style.display = settings.filterKeywords ? 'block' : 'none';
  blockedCountEl.textContent = settings.blockedCount || 0;
  
  // Render keywords
  const keywords = settings.keywords || [];
  renderKeywords(keywords);
  
  // Toggle listeners
  blockShortsToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockShorts: e.target.checked });
    updateContentScript();
    animateToggle(e.target);
  });
  
  filterKeywordsToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ filterKeywords: e.target.checked });
    keywordsSection.style.display = e.target.checked ? 'block' : 'none';
    updateContentScript();
    animateToggle(e.target);
  });
  
  addKeywordBtn.addEventListener('click', addKeyword);
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeyword();
  });
  
  resetStatsBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({ blockedCount: 0 });
    blockedCountEl.textContent = '0';
    resetStatsBtn.classList.add('animate-pulse');
    setTimeout(() => resetStatsBtn.classList.remove('animate-pulse'), 1000);
  });
  
  async function addKeyword() {
    const keyword = keywordInput.value.trim().toLowerCase();
    if (!keyword) return;
    const currentKeywords = (await chrome.storage.sync.get('keywords')).keywords || [];
    if (!currentKeywords.includes(keyword)) {
      const newKeywords = [...currentKeywords, keyword];
      await chrome.storage.sync.set({ keywords: newKeywords });
      renderKeywords(newKeywords);
      updateContentScript();
    }
    keywordInput.value = '';
    addKeywordBtn.classList.add('animate-pulse');
    setTimeout(() => addKeywordBtn.classList.remove('animate-pulse'), 500);
  }
  
  function renderKeywords(keywords) {
    keywordsList.innerHTML = keywords.map(keyword => `
      <span class="keyword-tag">
        ${keyword}
        <span class="remove" data-keyword="${keyword}">×</span>
      </span>
    `).join('');
    // Remove keyword listeners
    keywordsList.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const keyword = e.target.getAttribute('data-keyword');
        const currentKeywords = (await chrome.storage.sync.get('keywords')).keywords || [];
        const newKeywords = currentKeywords.filter(k => k !== keyword);
        await chrome.storage.sync.set({ keywords: newKeywords });
        renderKeywords(newKeywords);
        updateContentScript();
      });
    });
  }
  
  function animateToggle(toggle) {
    toggle.parentElement.classList.add('animate-pulse');
    setTimeout(() => toggle.parentElement.classList.remove('animate-pulse'), 500);
  }
  
  async function updateContentScript() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url.includes('youtube.com')) {
      chrome.tabs.sendMessage(tab.id, { action: 'updateSettings' });
    }
  }
  
  // Update blocked count live
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockedCount) {
      blockedCountEl.textContent = changes.blockedCount.newValue || 0;
    }
  });
});