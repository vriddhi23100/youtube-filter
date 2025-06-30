class YouTubeContentFilter {
  constructor() {
    this.settings = {
      blockShorts: true,
      filterKeywords: false,
      keywords: []
    };
    this.blockedCount = 0;
    this.observer = null;
    this.init();
  }
  
  async init() {
    await this.loadSettings();
    this.startObserver();
    this.filterContent();
    this.listenForMessages();
    this.setupNavigationListener(); // For single-page navigation
  }
  
  async loadSettings() {
    const stored = await chrome.storage.sync.get([
      'blockShorts',
      'filterKeywords', 
      'keywords',
      'blockedCount'
    ]);
    this.settings = {
      blockShorts: stored.blockShorts !== false,
      filterKeywords: stored.filterKeywords === true,
      keywords: stored.keywords || []
    };
    this.blockedCount = stored.blockedCount || 0;
  }
  
  startObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldFilter = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldFilter = true;
        }
      });
      if (shouldFilter) {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => this.filterContent(), 100);
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  filterContent() {
    if (this.settings.blockShorts) {
      this.blockShorts();
    }
    if (this.settings.filterKeywords && this.settings.keywords.length > 0) {
      this.filterByKeywords();
    }
  }
  
  blockShorts() {
    // Hide Shorts by URL
    const allLinks = document.querySelectorAll('a[href*="/shorts/"]');
    allLinks.forEach(link => {
      const containers = [
        'ytd-video-renderer',
        'ytd-compact-video-renderer', 
        'ytd-rich-item-renderer',
        'ytd-grid-video-renderer',
        'ytd-movie-renderer',
        'ytd-playlist-video-renderer',
        'ytd-reel-item-renderer'
      ];
      for (const containerType of containers) {
        const container = link.closest(containerType);
        if (container && !container.hasAttribute('data-filtered')) {
          this.hideElement(container);
          container.setAttribute('data-filtered', 'shorts-url');
          this.incrementBlockedCount();
          break;
        }
      }
    });
    // Hide Shorts using various selectors
    const shortsSelectors = [
      'div[is-shorts]',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-shelf-renderer',
      'ytd-video-renderer[is-shorts]',
      'ytd-compact-video-renderer[is-shorts]',
      'ytd-grid-video-renderer[is-shorts]',
      'ytd-shorts',
      'ytd-reel-video-renderer',
      'ytd-reel-item-renderer',
      '.ytm-shorts-shelf',
      '.shorts-video-cell',
      'ytd-video-renderer:has(a[href*="/shorts/"])',
      'ytd-compact-video-renderer:has(a[href*="/shorts/"])',
      '[aria-label*="Shorts"]',
      '[title*="Shorts"]',
      'a[title="Shorts"]',
      'ytd-guide-entry-renderer:has(a[title="Shorts"])',
      'yt-tab-shape:has([aria-label*="Shorts"])'
    ];
    shortsSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.hasAttribute('data-filtered')) {
            this.hideElement(element);
            element.setAttribute('data-filtered', 'shorts-selector');
            this.incrementBlockedCount();
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
    // Hide Shorts by duration (under 1 minute)
    const durationElements = document.querySelectorAll('span.ytd-thumbnail-overlay-time-status-renderer, .ytd-video-meta-block span');
    durationElements.forEach(durationEl => {
      const durationText = durationEl.textContent.trim();
      if (durationText.match(/^0:[0-5][0-9]$/) || durationText === '1:00') {
        const videoContainer = durationEl.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer');
        if (videoContainer && !videoContainer.hasAttribute('data-filtered')) {
          const hasShortIndicators = videoContainer.querySelector('a[href*="/shorts/"]') || 
                                   videoContainer.hasAttribute('is-shorts') ||
                                   videoContainer.querySelector('[aria-label*="Shorts"]');
          if (hasShortIndicators) {
            this.hideElement(videoContainer);
            videoContainer.setAttribute('data-filtered', 'shorts-duration');
            this.incrementBlockedCount();
          }
        }
      }
    });
  }
  
  filterByKeywords() {
    // Hide videos by keywords in titles
    const titleSelectors = [
      'h3.ytd-video-renderer a',
      'h3.ytd-compact-video-renderer a', 
      'h3.ytd-rich-grid-media a',
      'h3.ytd-grid-video-renderer a',
      'span#video-title',
      'a#video-title-link',
      '#video-title',
      'yt-formatted-string#video-title',
      '.ytd-video-meta-block h3 a',
      '.ytd-compact-video-renderer .ytd-video-meta-block a',
      'a.ytd-playlist-video-renderer span#video-title',
      '.ytd-rich-item-renderer h3 a',
      '.compact-media-item-metadata a',
      'a[aria-describedby*="video-title"]',
      '[role="heading"] a'
    ];
    titleSelectors.forEach(selector => {
      try {
        const titleElements = document.querySelectorAll(selector);
        titleElements.forEach(titleEl => {
          const titleText = (titleEl.textContent || titleEl.innerText || '').toLowerCase().trim();
          if (titleText) {
            const shouldBlock = this.settings.keywords.some(keyword => {
              return titleText.includes(keyword);
            });
            if (shouldBlock) {
              const videoContainer = titleEl.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer');
              if (videoContainer && !videoContainer.hasAttribute('data-filtered')) {
                this.hideElement(videoContainer);
                videoContainer.setAttribute('data-filtered', 'keyword');
                this.incrementBlockedCount();
              }
            }
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
    // Hide by keywords in descriptions and channel names
    const descSelectors = [
      '#description',
      '.ytd-video-meta-block',
      '.metadata-snippet',
      '.ytd-video-renderer .ytd-channel-name',
      '.ytd-compact-video-renderer .ytd-channel-name'
    ];
    descSelectors.forEach(selector => {
      try {
        const descElements = document.querySelectorAll(selector);
        descElements.forEach(el => {
          const descText = (el.textContent || '').toLowerCase().trim();
          if (descText) {
            const shouldBlock = this.settings.keywords.some(keyword => descText.includes(keyword));
            if (shouldBlock) {
              const videoContainer = el.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer');
              if (videoContainer && !videoContainer.hasAttribute('data-filtered')) {
                this.hideElement(videoContainer);
                videoContainer.setAttribute('data-filtered', 'keyword-desc');
                this.incrementBlockedCount();
              }
            }
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
  }
  
  hideElement(element) {
    element.style.display = 'none';
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.margin = '0';
    element.style.padding = '0';
  }
  
  async incrementBlockedCount() {
    this.blockedCount++;
    await chrome.storage.sync.set({ blockedCount: this.blockedCount });
  }
  
  listenForMessages() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'updateSettings') {
        this.loadSettings().then(() => this.filterContent());
      }
      if (msg.action === 'ping') {
        return true;
      }
    });
  }
  
  setupNavigationListener() {
    // Listen for navigation events in YouTube's single-page app
    window.addEventListener('yt-navigate-finish', () => {
      setTimeout(() => this.filterContent(), 300);
    });
    document.addEventListener('yt-page-data-updated', () => {
      setTimeout(() => this.filterContent(), 300);
    });
    document.addEventListener('spfdone', () => {
      setTimeout(() => this.filterContent(), 300);
    });
    document.addEventListener('yt-search-refresh', () => {
      setTimeout(() => this.filterContent(), 300);
    });
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => this.filterContent(), 300);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => this.filterContent(), 300);
      }
    });
  }
}

// Start the filter
new YouTubeContentFilter();