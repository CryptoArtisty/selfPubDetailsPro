importScripts('rateLimiter.js');

const autosuggestLimiter = new RateLimiter(5, 1000);
const fetchLimiter = new RateLimiter(2, 500);
let bookDataArray = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BOOK_INFO') {
    console.log('Received book data:', msg.payload); // Debug log to inspect payload
    bookDataArray.push(msg.payload);
    console.log('Book info received:', msg.payload);
  }

  if (msg.type === 'FETCH_AUTOSUGGEST') {
    autosuggestLimiter.removeToken().then(() => {
      fetch(msg.url)
        .then(r => r.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(err => sendResponse({ success: false, error: err }));
    });
    return true;
  }

  if (msg.type === 'EXPORT_CSV') {
    const csvContent = generateCSV(bookDataArray);
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    chrome.downloads.download({
      filename: 'book_data.csv',
      url: dataUrl
    });
  }
});

function generateCSV(dataArray) {
  const headers = ['Title','Author','Price','Rating','Reviews','BSR','Backend Keywords'];
  const rows = dataArray.map(data => {
    const book = data.bookData || {};
    const author = book.author ? (book.author.name || (Array.isArray(book.author) ? book.author.map(a => a.name).join(', ') : book.author)) : '';
    const keywords = data.backendKeywords && Array.isArray(data.backendKeywords) ? data.backendKeywords.join(', ') : '';
    return [
      `"${(book.name || '').replace(/"/g, '""')}"`, // Escape quotes in title
      `"${(author || '').replace(/"/g, '""')}"`, // Escape quotes in author
      data.price || '',
      data.rating || '',
      data.reviews || '',
      data.bsr || '',
      `"${keywords.replace(/"/g, '""')}"` // Escape quotes in keywords
    ];
  });
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
