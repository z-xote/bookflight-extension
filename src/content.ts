// Content script that injects iframe into every page
(function() {
  'use strict';
  
  const IFRAME_ID = 'bfg-extension-iframe';
  const CONTAINER_ID = 'bfg-extension-container';
  const TOGGLE_ID = 'bfg-extension-toggle';
  
  let isVisible = false;
  
  // Check if already injected
  if (document.getElementById(CONTAINER_ID)) {
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.innerHTML = `
  <button id="${TOGGLE_ID}" title="Toggle Bookflight Guide">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  </button>
  <iframe 
    id="${IFRAME_ID}" 
    src="${chrome.runtime.getURL('extension.html')}"
    style="display: none;"
  ></iframe>
`;
  
  document.body.appendChild(container);
  
  // Toggle functionality
  const toggle = document.getElementById(TOGGLE_ID);
  const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement;
  
  toggle?.addEventListener('click', () => {
    isVisible = !isVisible;
    if (iframe) {
      iframe.style.display = isVisible ? 'block' : 'none';
    }
    if (toggle) {
      toggle.classList.toggle('active', isVisible);
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isVisible) {
      isVisible = false;
      if (iframe) iframe.style.display = 'none';
      if (toggle) toggle.classList.remove('active');
    }
  });
})();