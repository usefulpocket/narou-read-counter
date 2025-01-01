import './lib/browser-polyfill.min.js';

document.addEventListener('DOMContentLoaded', function() {
  browser.runtime.openOptionsPage();
  window.close();
});