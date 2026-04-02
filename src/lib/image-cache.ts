/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// In-memory cache to bypass sessionStorage quota limits
const memoryCache = new Map<string, string>();

export const imageCache = {
  get: (key: string): string | null => {
    // Try memory cache first
    if (memoryCache.has(key)) {
      return memoryCache.get(key)!;
    }
    
    // Fallback to sessionStorage
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        memoryCache.set(key, cached);
        return cached;
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    return null;
  },
  
  set: (key: string, value: string): void => {
    // Always set in memory
    memoryCache.set(key, value);
    
    // Try setting in sessionStorage, but catch quota errors
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      // If quota exceeded, we just rely on memory cache for this session
      console.warn(`Storage quota exceeded for key: ${key}. Using memory cache only.`);
    }
  }
};
