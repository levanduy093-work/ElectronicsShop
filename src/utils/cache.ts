import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  BANNERS: 'electronicsshop/cache/banners',
  PRODUCTS: 'electronicsshop/cache/products',
  BANNERS_TIMESTAMP: 'electronicsshop/cache/banners_timestamp',
  PRODUCTS_TIMESTAMP: 'electronicsshop/cache/products_timestamp',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface CacheData<T> {
  data: T;
  timestamp: number;
}

export async function cacheBanners(banners: any[]): Promise<void> {
  try {
    const cacheData: CacheData<any[]> = {
      data: banners,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEYS.BANNERS, JSON.stringify(cacheData));
    await AsyncStorage.setItem(CACHE_KEYS.BANNERS_TIMESTAMP, String(cacheData.timestamp));
  } catch (error) {
    console.warn('Failed to cache banners:', error);
  }
}

export async function getCachedBanners(): Promise<any[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.BANNERS);
    const timestampStr = await AsyncStorage.getItem(CACHE_KEYS.BANNERS_TIMESTAMP);
    
    if (!cached || !timestampStr) {
      return null;
    }

    const cacheData: CacheData<any[]> = JSON.parse(cached);
    const timestamp = parseInt(timestampStr, 10);

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_DURATION) {
      // Cache expired, but return it anyway when offline
      return cacheData.data;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('Failed to get cached banners:', error);
    return null;
  }
}

export async function cacheProducts(products: any[]): Promise<void> {
  try {
    const cacheData: CacheData<any[]> = {
      data: products,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(cacheData));
    await AsyncStorage.setItem(CACHE_KEYS.PRODUCTS_TIMESTAMP, String(cacheData.timestamp));
  } catch (error) {
    console.warn('Failed to cache products:', error);
  }
}

export async function getCachedProducts(): Promise<any[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS);
    const timestampStr = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS_TIMESTAMP);
    
    if (!cached || !timestampStr) {
      return null;
    }

    const cacheData: CacheData<any[]> = JSON.parse(cached);
    const timestamp = parseInt(timestampStr, 10);

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_DURATION) {
      // Cache expired, but return it anyway when offline
      return cacheData.data;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('Failed to get cached products:', error);
    return null;
  }
}

export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.BANNERS,
      CACHE_KEYS.PRODUCTS,
      CACHE_KEYS.BANNERS_TIMESTAMP,
      CACHE_KEYS.PRODUCTS_TIMESTAMP,
    ]);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}
