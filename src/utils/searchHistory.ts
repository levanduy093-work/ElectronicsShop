import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSearchHistory, saveSearchHistory, clearSearchHistory as apiClearSearchHistory } from '../services/api';

const SEARCH_HISTORY_KEY_PREFIX = 'electronicsshop/search_history';
const MAX_HISTORY_ITEMS = 20; // Giới hạn số lượng lịch sử tìm kiếm

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

/**
 * Lấy key để lưu lịch sử tìm kiếm cho user
 */
const getSearchHistoryKey = (userId: string | null): string => {
  if (userId) {
    return `${SEARCH_HISTORY_KEY_PREFIX}/user/${userId}`;
  }
  return `${SEARCH_HISTORY_KEY_PREFIX}/guest`;
};

/**
 * Migrate guest history sang user history khi user đăng nhập
 */
const migrateGuestHistory = async (): Promise<string[]> => {
  try {
    const guestKey = getSearchHistoryKey(null);
    const guestStored = await AsyncStorage.getItem(guestKey);
    if (!guestStored) return [];

    const guestHistory: SearchHistoryItem[] = JSON.parse(guestStored);
    const queries = guestHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.query)
      .slice(0, MAX_HISTORY_ITEMS);

    // Xóa guest history sau khi migrate
    await AsyncStorage.removeItem(guestKey);

    return queries;
  } catch (error) {
    console.warn('Failed to migrate guest history', error);
    return [];
  }
};

/**
 * Sync local history lên API (khi user đăng nhập hoặc khi API empty)
 */
export const syncLocalToApi = async (
  userId: string | null,
  accessToken: string
): Promise<void> => {
  if (!userId || !accessToken) return;

  try {
    // Load user history
    let localHistory = await loadFromLocalStorage(userId);

    // Nếu user history rỗng, thử migrate từ guest history
    if (!localHistory || localHistory.length === 0) {
      const guestHistory = await migrateGuestHistory();
      if (guestHistory.length > 0) {
        localHistory = guestHistory;
        await saveToLocalStorage(guestHistory, userId);
      }
    }

    if (localHistory && localHistory.length > 0) {
      try {
        await saveSearchHistory(localHistory, accessToken);
        console.log('Synced local search history to API');
      } catch (error: any) {
        // Ignore nếu endpoint chưa tồn tại (404)
        const is404 = error?.response?.status === 404 || error?.status === 404;
        if (!is404) {
          console.warn('Failed to sync local history to API', error?.message || error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to sync local to API', error);
  }
};

/**
 * Load lịch sử tìm kiếm từ AsyncStorage hoặc API (nếu user đã đăng nhập)
 */
export const loadSearchHistory = async (
  userId: string | null,
  accessToken?: string | null
): Promise<string[]> => {
  try {
    // Nếu user đã đăng nhập và có token, load từ API
    if (userId && accessToken) {
      try {
        const apiHistory = await getSearchHistory(accessToken);
        // Load local history để merge
        let localHistory = await loadFromLocalStorage(userId);

        if (apiHistory && apiHistory.length > 0) {
          // API có data: merge với local và sync
          const merged = mergeHistories(apiHistory, localHistory);
          // Lưu merged vào local để cache
          await saveToLocalStorage(merged, userId);
          // Sync merged lên API nếu có thay đổi
          if (merged.length > apiHistory.length || JSON.stringify(merged) !== JSON.stringify(apiHistory)) {
            try {
              await saveSearchHistory(merged, accessToken);
            } catch (syncError) {
              console.warn('Failed to sync merged history to API', syncError);
            }
          }
          return merged.slice(0, MAX_HISTORY_ITEMS);
        } else {
          // API trả về empty hoặc không có data
          // Nếu local history rỗng, thử migrate từ guest history
          if (!localHistory || localHistory.length === 0) {
            const guestHistory = await migrateGuestHistory();
            if (guestHistory.length > 0) {
              localHistory = guestHistory;
              await saveToLocalStorage(guestHistory, userId);
            }
          }

          if (localHistory && localHistory.length > 0) {
            // Local có data: sync local lên API
            try {
              await saveSearchHistory(localHistory, accessToken);
              console.log('Synced local search history to API (API was empty)');
            } catch (syncError: any) {
              // Ignore nếu endpoint chưa tồn tại (404) hoặc lỗi khác
              const is404 = syncError?.response?.status === 404 || syncError?.status === 404;
              if (!is404) {
                console.warn('Failed to sync local history to API', syncError?.message || syncError);
              }
            }
            return localHistory.slice(0, MAX_HISTORY_ITEMS);
          } else {
            // Cả API và local đều empty
            return [];
          }
        }
      } catch (apiError: any) {
        // Nếu API fail (404, 500, etc.), fallback về local storage
        const is404 = apiError?.response?.status === 404 || apiError?.status === 404;
        if (!is404) {
          console.warn('Failed to load search history from API, using local storage', apiError?.message || apiError);
        }
        const localHistory = await loadFromLocalStorage(userId);
        // Nếu local có data và API fail, thử sync lên API (có thể endpoint chưa tồn tại)
        if (localHistory && localHistory.length > 0) {
          try {
            await saveSearchHistory(localHistory, accessToken);
            console.log('Synced local search history to API after API error');
          } catch (syncError: any) {
            // Ignore sync error nếu endpoint chưa tồn tại (404)
            const syncIs404 = syncError?.response?.status === 404 || syncError?.status === 404;
            if (!syncIs404) {
              console.warn('Failed to sync local history to API', syncError?.message || syncError);
            }
          }
        }
        return localHistory;
      }
    }

    // Load từ local storage (cho guest)
    return await loadFromLocalStorage(userId);
  } catch (error) {
    console.warn('Failed to load search history', error);
    return [];
  }
};

/**
 * Load từ local storage
 */
const loadFromLocalStorage = async (userId: string | null): Promise<string[]> => {
  try {
    const key = getSearchHistoryKey(userId);
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return [];

    const history: SearchHistoryItem[] = JSON.parse(stored);
    // Sắp xếp theo timestamp mới nhất trước, và chỉ lấy query strings
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.query)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch (error) {
    console.warn('Failed to load from local storage', error);
    return [];
  }
};

/**
 * Lưu vào local storage
 */
const saveToLocalStorage = async (queries: string[], userId: string | null): Promise<void> => {
  try {
    const key = getSearchHistoryKey(userId);
    const history: SearchHistoryItem[] = queries.map((query, index) => ({
      query,
      timestamp: Date.now() - index * 1000, // Giả lập timestamp để giữ thứ tự
    }));
    await AsyncStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save to local storage', error);
  }
};

/**
 * Merge histories từ API và local, loại bỏ duplicate
 */
const mergeHistories = (apiHistory: string[], localHistory: string[]): string[] => {
  const seen = new Set<string>();
  const merged: string[] = [];

  // Ưu tiên API history trước
  for (const query of apiHistory) {
    const lower = query.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      merged.push(query);
    }
  }

  // Thêm local history chưa có trong API
  for (const query of localHistory) {
    const lower = query.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      merged.push(query);
    }
  }

  return merged;
};

/**
 * Lưu một query mới vào lịch sử tìm kiếm (local và sync với API nếu có)
 */
export const saveSearchQuery = async (
  query: string,
  userId: string | null,
  accessToken?: string | null
): Promise<void> => {
  if (!query || !query.trim()) return;

  try {
    const trimmedQuery = query.trim();

    // Load history hiện tại
    const currentHistory = await loadSearchHistory(userId, accessToken);

    // Loại bỏ query trùng lặp (case-insensitive) và thêm mới vào đầu
    const updatedHistory = [
      trimmedQuery,
      ...currentHistory.filter(q => q.toLowerCase() !== trimmedQuery.toLowerCase())
    ].slice(0, MAX_HISTORY_ITEMS);

    // Lưu vào local storage
    await saveToLocalStorage(updatedHistory, userId);

    // Sync với API nếu user đã đăng nhập
    if (userId && accessToken) {
      try {
        await saveSearchHistory(updatedHistory, accessToken);
      } catch (apiError) {
        // Nếu API fail, vẫn giữ local storage
        console.warn('Failed to sync search history to API, saved locally only', apiError);
      }
    }
  } catch (error) {
    console.warn('Failed to save search query', error);
  }
};

/**
 * Xóa toàn bộ lịch sử tìm kiếm của user (local và API)
 */
export const clearSearchHistory = async (
  userId: string | null,
  accessToken?: string | null
): Promise<void> => {
  try {
    // Xóa local storage
    const key = getSearchHistoryKey(userId);
    await AsyncStorage.removeItem(key);

    // Xóa trên API nếu user đã đăng nhập
    if (userId && accessToken) {
      try {
        await apiClearSearchHistory(accessToken);
      } catch (apiError) {
        console.warn('Failed to clear search history on API', apiError);
      }
    }
  } catch (error) {
    console.warn('Failed to clear search history', error);
  }
};

/**
 * Xóa một query cụ thể khỏi lịch sử
 */
export const removeSearchQuery = async (query: string, userId: string | null): Promise<void> => {
  try {
    const key = getSearchHistoryKey(userId);
    const existing = await AsyncStorage.getItem(key);
    if (!existing) return;

    let history: SearchHistoryItem[] = JSON.parse(existing);
    history = history.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    );

    await AsyncStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to remove search query', error);
  }
};
