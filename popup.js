// popup.js
document.getElementById('toggle').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].id) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'SCRAPE_PAGE' },
      response => {
        if (chrome.runtime.lastError) {
          console.warn('Content script not found on this page:', chrome.runtime.lastError.message);
        } else {
          console.log('SCRAPE_PAGE message sent successfully:', response);
        }
      }
    );
  });
});

document.getElementById('export').addEventListener('click', () => {
  chrome.runtime.sendMessage(
    { type: 'EXPORT_CSV' },
    response => {
      if (chrome.runtime.lastError) {
        console.warn('Export failed:', chrome.runtime.lastError.message);
      } else {
        console.log('EXPORT_CSV message sent successfully.');
      }
    }
  );
});
