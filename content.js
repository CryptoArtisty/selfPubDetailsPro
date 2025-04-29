// content.js
// RateLimiter is loaded via manifest.json content_scripts

const pageLimiter = new RateLimiter(1, 1000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCRAPE_PAGE') {
    scrapePage();
    sendResponse({ status: 'Scraping initiated' });
  }
});

async function scrapePage() {
  await pageLimiter.removeToken();
  console.warn('TOS reminder: Only publicly visible data is scraped.');

  // JSON-LD
  let bookData = {};
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      bookData = JSON.parse(ld.textContent);
    } catch (e) {
      console.error('Error parsing JSON-LD:', e);
    }
  }

  // Meta keywords
  const metaKW = document.querySelector('meta[name="keywords"]');
  const backendKeywords = metaKW ? metaKW.content.split(',').map(s => s.trim()) : [];

  // BSR (Best Sellers Rank)
  const bsrEl = [
    ...document.querySelectorAll('#detailBulletsWrapper li, #productDetails_detailBullets_sections1 tr')
  ].find(el => el.textContent.includes('Best Sellers Rank'));
  const bsr = bsrEl ? bsrEl.textContent.match(/#[\d,]+/)?.[0] || bsrEl.textContent.trim() : '';

  // Price, Rating, Reviews
  const price = document.querySelector('.a-price .a-offscreen')?.textContent || '';
  const rating = document.querySelector('span.a-icon-alt')?.textContent || '';
  const reviews = document.querySelector('#acrCustomerReviewText')?.textContent || '';

  const payload = { bookData, backendKeywords, bsr, price, rating, reviews };
  console.log('Scraped data:', payload); // Debug log

  chrome.runtime.sendMessage({
    type: 'BOOK_INFO',
    payload
  });
}
