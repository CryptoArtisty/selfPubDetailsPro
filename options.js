// options.js
document.getElementById('save').addEventListener('click', () => {
  const maxPages = document.getElementById('maxPages').value;
  const autosuggestRate = document.getElementById('autosuggestRate').value;
  chrome.storage.sync.set({
    maxPages: parseInt(maxPages),
    autosuggestRate: parseInt(autosuggestRate)
  }, () => {
    alert('Settings saved!');
  });
});

// Load saved settings
chrome.storage.sync.get(['maxPages', 'autosuggestRate'], (data) => {
  document.getElementById('maxPages').value = data.maxPages || 1;
  document.getElementById('autosuggestRate').value = data.autosuggestRate || 5;
});
