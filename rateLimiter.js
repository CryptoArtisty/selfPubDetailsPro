// rateLimiter.js
class RateLimiter {
  constructor(tokens, refillIntervalMs) {
    this.tokens = tokens;
    this.capacity = tokens;
    setInterval(() => {
      this.tokens = Math.min(this.capacity, this.tokens + 1);
    }, refillIntervalMs);
  }

  removeToken() {
    return new Promise(resolve => {
      const attempt = () => {
        if (this.tokens > 0) {
          this.tokens--;
          resolve(true);
        } else {
          setTimeout(attempt, 100);
        }
      };
      attempt();
    });
  }
}

// Expose globally
self.RateLimiter = RateLimiter;
