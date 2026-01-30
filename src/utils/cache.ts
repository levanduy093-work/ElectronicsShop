import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.hydrateFromStorage();
  }

  // Load essential keys from storage to memory on startup
  private async hydrateFromStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith('electronicsshop/cache/'));
      if (appKeys.length > 0) {
        const stores = await AsyncStorage.multiGet(appKeys);
        stores.forEach(([key, value]) => {
          if (value) {
            try {
              const parsed = JSON.parse(value);
              this.memoryCache.set(key, parsed);
            } catch (e) {
              console.warn(`Failed to parse cache for ${key}`, e);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate cache', error);
    }
  }

  /**
   * Set data in cache (Memory + Persisted)
   */
  async set<T>(key: string, data: T, ttl: number = this.defaultTTL): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    const storageKey = `electronicsshop/cache/${key}`;

    // Update memory
    this.memoryCache.set(storageKey, entry);

    // Persist
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Failed to persist cache for ${key}`, error);
    }
  }

  /**
   * Get data from cache. Returns null if missing or expired.
   */
  async get<T>(key: string): Promise<T | null> {
    const storageKey = `electronicsshop/cache/${key}`;

    // Check memory first
    let entry = this.memoryCache.get(storageKey);

    if (!entry) {
      // Try fetching purely from storage if check fails (double safety)
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          entry = JSON.parse(stored);
          this.memoryCache.set(storageKey, entry!);
        }
      } catch (e) {
        return null;
      }
    }

    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      // Expired - clean up
      this.remove(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Remove item from cache
   */
  async remove(key: string): Promise<void> {
    const storageKey = `electronicsshop/cache/${key}`;
    this.memoryCache.delete(storageKey);
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (e) {
      console.warn(`Failed to remove cache ${key}`, e);
    }
  }

  /**
   * Helper for caching legacy Banners/Products keys
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith('electronicsshop/cache/'));
      await AsyncStorage.multiRemove(appKeys);
    } catch (e) {
      console.warn('Failed to clear cache', e);
    }
  }
}

export const cacheManager = new CacheManager();

// Keep legacy exports for backward compatibility if needed, 
// using the new manager under the hood
export const CACHE_KEYS = {
  BANNERS: 'banners',
  PRODUCTS: 'products',
};

export async function cacheBanners(banners: any[]): Promise<void> {
  await cacheManager.set(CACHE_KEYS.BANNERS, banners);
}

export async function getCachedBanners(): Promise<any[] | null> {
  return await cacheManager.get(CACHE_KEYS.BANNERS);
}

export async function cacheProducts(products: any[]): Promise<void> {
  await cacheManager.set(CACHE_KEYS.PRODUCTS, products);
}

export async function getCachedProducts(): Promise<any[] | null> {
  return await cacheManager.get(CACHE_KEYS.PRODUCTS);
}
