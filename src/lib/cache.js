/**
 * Multi-layer caching system with in-memory and sessionStorage
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
  }

  /**
   * Generate cache key from URL and params
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return `${url}${sortedParams ? `?${sortedParams}` : ""}`;
  }

  /**
   * Get cached data
   */
  get(key) {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data;
    }

    // Try sessionStorage
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const entry = JSON.parse(stored);
        if (entry.expiresAt > Date.now()) {
          // Restore to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Expired, remove it
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }

    return null;
  }

  /**
   * Set cached data
   */
  set(key, data, ttlMs = 60000) {
    const entry = {
      data,
      expiresAt: Date.now() + ttlMs,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in sessionStorage
    try {
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded
      console.warn("Cache write error:", error);
      this.clearOldest();
      try {
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // If still fails, just use memory cache
      }
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();

    // Clear memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }

    // Clear sessionStorage
    try {
      const keys = Object.keys(sessionStorage);
      for (const key of keys) {
        try {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            if (entry.expiresAt && entry.expiresAt <= now) {
              sessionStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid entry, remove it
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("Cache cleanup error:", error);
    }
  }

  /**
   * Clear oldest entries when quota exceeded
   */
  clearOldest() {
    try {
      const entries = [];
      const keys = Object.keys(sessionStorage);

      for (const key of keys) {
        try {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            if (entry.expiresAt) {
              entries.push({ key, expiresAt: entry.expiresAt });
            }
          }
        } catch {
          // Invalid entry
        }
      }

      // Sort by expiration time and remove oldest 25%
      entries.sort((a, b) => a.expiresAt - b.expiresAt);
      const toRemove = Math.ceil(entries.length * 0.25);

      for (let i = 0; i < toRemove; i++) {
        sessionStorage.removeItem(entries[i].key);
      }
    } catch (error) {
      console.warn("Cache cleanup error:", error);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("Cache clear error:", error);
    }
  }
}

export const cache = new CacheManager();

// Clear expired entries every 5 minutes
setInterval(() => cache.clearExpired(), 5 * 60 * 1000);
