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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
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