// popup.js
document.getElementById('toggle').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].id) {
      console.error('No active tab found');
      return;
    }
    console.log('Sending SCRAPE_PAGE to tab:', tabs[0].id);
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'SCRAPE_PAGE' },
      response => {
        if (chrome.runtime.lastError) {
          console.warn('Content script error:', chrome.runtime.lastError.message);
        } else {
          console.log('Scrape response:', response);
        }
      }
    );
  });
});

document.getElementById('export').addEventListener('click', () => {
  console.log('Sending EXPORT_CSV message');
  chrome.runtime.sendMessage(
    { type: 'EXPORT_CSV' },
    response => {
      if (chrome.runtime.lastError) {
        console.error('Export error:', chrome.runtime.lastError.message);
      } else {
        console.log('Export response:', response);
      }
    }
  );
});
