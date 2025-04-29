// background.js
let bookDataArray = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BOOK_INFO') {
    console.log('Received BOOK_INFO:', msg.payload); // Confirm data receipt
    bookDataArray.push(msg.payload);
    sendResponse({ status: 'Data received' });
  }

  if (msg.type === 'EXPORT_CSV') {
    console.log('Generating CSV with data:', bookDataArray);
    const csvContent = generateCSV(bookDataArray);
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    chrome.downloads.download({
      filename: 'book_data.csv',
      url: dataUrl
    });
    sendResponse({ status: 'CSV exported' });
  }
  return true; // Keep message channel open for async responses
});

function generateCSV(dataArray) {
  const headers = ['Title', 'Author', 'Price', 'Rating', 'Reviews', 'BSR', 'Backend Keywords'];
  const rows = dataArray.map(data => {
    const book = data.bookData || {};
    let author = '';
    if (book.author) {
      if (Array.isArray(book.author)) {
        author = book.author.map(a => a.name || a).join(', ');
      } else if (typeof book.author === 'object') {
        author = book.author.name || '';
      } else {
        author = book.author;
      }
    }
    const keywords = data.backendKeywords && Array.isArray(data.backendKeywords) ? data.backendKeywords.join(', ') : '';
    return [
      `"${(book.name || '').replace(/"/g, '""')}"`, // Escape quotes
      `"${(author || '').replace(/"/g, '""')}"`,
      `"${(data.price || '').replace(/"/g, '""')}"`,
      `"${(data.rating || '').replace(/"/g, '""')}"`,
      `"${(data.reviews || '').replace(/"/g, '""')}"`,
      `"${(data.bsr || '').replace(/"/g, '""')}"`,
      `"${(keywords || '').replace(/"/g, '""')}"`
    ];
  });
  console.log('CSV rows:', rows); // Log rows for debugging
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
