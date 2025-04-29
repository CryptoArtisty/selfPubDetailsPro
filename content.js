// content.js
console.log('Content script loaded'); // Verify script execution

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCRAPE_PAGE') {
    console.log('Received SCRAPE_PAGE message'); // Confirm message receipt
    scrapePage();
    sendResponse({ status: 'Scraping initiated' });
  }
});

async function scrapePage() {
  // Extract data from JSON-LD (structured data)
  let bookData = {};
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      bookData = JSON.parse(ld.textContent);
      console.log('Parsed JSON-LD:', bookData);
    } catch (e) {
      console.error('Error parsing JSON-LD:', e);
    }
  } else {
    console.warn('No JSON-LD found');
  }

  // Backend Keywords
  const metaKW = document.querySelector('meta[name="keywords"]');
  const backendKeywords = metaKW ? metaKW.content.split(',').map(s => s.trim()) : [];
  console.log('Backend Keywords:', backendKeywords);

  // Best Sellers Rank (BSR)
  const bsrEl = [
    ...document.querySelectorAll('#detailBulletsWrapper li, #productDetails_detailBullets_sections1 tr, #productDetails_db_sections tr')
  ].find(el => el.textContent.includes('Best Sellers Rank'));
  const bsr = bsrEl ? (bsrEl.textContent.match(/#[\d,]+/)?.[0] || '') : '';
  console.log('BSR:', bsr);

  // Price
  const price = document.querySelector('.a-price .a-offscreen, #price_inside_buybox, #kindle-price')?.textContent || '';
  console.log('Price:', price);

  // Rating
  const rating = document.querySelector('span.a-icon-alt, #averageCustomerReviews span')?.textContent || '';
  console.log('Rating:', rating);

  // Reviews
  const reviews = document.querySelector('#acrCustomerReviewText, #reviewsMedley span[data-hook="total-review-count"]')?.textContent || '';
  console.log('Reviews:', reviews);

  // Compile payload
  const payload = { bookData, backendKeywords, bsr, price, rating, reviews };
  console.log('Scraped data payload:', payload);

  // Send to background script
  chrome.runtime.sendMessage({
    type: 'BOOK_INFO',
    payload
  }, response => {
    if (chrome.runtime.lastError) {
      console.error('Error sending BOOK_INFO:', chrome.runtime.lastError);
    } else {
      console.log('BOOK_INFO sent successfully');
    }
  });
}
