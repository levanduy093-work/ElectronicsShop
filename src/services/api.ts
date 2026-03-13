import { NativeModules, Platform } from 'react-native';
import { API_BASE_URL as ENV_API_URL, API_DEVICE_HOST } from '@env';
import { getCurrentNetworkStatus } from '../utils/network';

import i18n from '../i18n';
import { normalizeAddressType, toAddressTypeValue, toBackendAddressType } from '../utils/addressType';

export type AuthResponse = {
  user: any;
  accessToken: string;
  refreshToken: string;
};

export type ApiProduct = {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  images?: string[];
  specs?: Record<string, string>;
  options?: string[];
  classifications?: string[];
  price: {
    originalPrice: number;
    salePrice: number;
  };
  averageRating?: number;
  reviewCount?: number;
  saleCount?: number;
  stock?: number;
  datasheet?: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProductInput = {
  name: string;
  code?: string;
  category?: string;
  description?: string;
  images?: string[];
  specs?: Record<string, string>;
  options?: string[];
  classifications?: string[];
  price: {
    originalPrice: number;
    salePrice: number;
  };
  averageRating?: number;
  reviewCount?: number;
  saleCount?: number;
  stock?: number;
  datasheet?: string;
};

export type ApiReview = {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
};

export type ApiOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
  shippingFee?: number;
  discount?: number;
  totalPrice: number;
  selectedOption?: string;
  selectedClassification?: string;
};

export type ApiOrder = {
  _id: string;
  code: string;
  userId: string;
  status?: {
    ordered?: string;
    confirmed?: string;
    packaged?: string;
    shipped?: string;
  };
  isCancelled?: boolean;
  shippingAddress?: {
    name?: string;
    phone?: string;
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
  items: ApiOrderItem[];
  voucher?: string;
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;
  payment?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiVnpayPaymentResponse = {
  paymentUrl: string;
  order: ApiOrder;
  transactionId?: string;
  paymentCode?: string;
};

export type ApiVoucher = {
  _id: string;
  code: string;
  description?: string;
  type?: 'fixed' | 'shipping' | 'percentage';
  discountPrice: number;
  discountRate?: number;
  maxDiscountPrice?: number;
  minTotal: number;
  expire?: string;
};

export type ApiNotification = {
  id?: string;
  _id?: string;
  title: string;
  body: string;
  type?: string;
  metadata?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
  sendAt?: string;
  expiresAt?: string;
  isRead?: boolean;
  readAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiBanner = {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaLink?: string;
  productId?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type UploadImageFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type ApiCartItem = {
  productId: string;
  name?: string;
  category?: string;
  image?: string;
  price: number;
  quantity: number;
  selectedOption?: string;
  selectedClassification?: string;
};

export type ApiCart = {
  _id: string;
  userId?: string;
  items: ApiCartItem[];
  voucher?: string;
  totalItem?: number;
  subTotal?: number;
  shippingFee?: number;
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AiProductCard = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  code?: string;
};

export type AiOrderCard = {
  orderId: string;
  code: string;
  total: number;
  payment?: string;
  paymentStatus?: string;
  orderedAt?: string;
  itemCount?: number;
  itemPreviewNames?: string[];
  shipped: boolean;
  isCancelled?: boolean;
};

export type AiAddressCard = {
  name: string;
  phone: string;
  line1: string;
  type?: string;
  isDefault?: boolean;
};

export type AiAction =
  | {
    type: 'ADD_TO_CART';
    payload: { productId: string; quantity: number };
    requiresConfirmation: boolean;
    confirmationId?: string;
    note?: string;
  }
  | {
    type: 'CONTACT_CALL' | 'CONTACT_ZALO' | 'CONTACT_EMAIL';
    payload?: { value?: string };
    note?: string;
  };

export type AiChatResponse = {
  reply: string;
  cards?: AiProductCard[];
  orderCards?: AiOrderCard[];
  addressCards?: AiAddressCard[];
  actions?: AiAction[];
};

// Derive API host from Metro bundler URL so it works on simulator & real device.
const resolveApiHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)(?::\d+)?/);
    if (match?.[1]) return match[1];
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const cleanHost = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    const url = new URL(withScheme);
    return { origin: url.origin, host: url.hostname, port: url.port };
  } catch {
    return undefined;
  }
};

// Allow build-time override; but if env points to localhost/127.0.0.1, prefer a device-resolvable host instead.
const isLocalHost = (url?: string) => !!url && /localhost|127\.0\.0\.1/.test(url);
const envHost = cleanHost(ENV_API_URL);
const deviceHost = cleanHost(API_DEVICE_HOST);
const fallbackHost = resolveApiHost();
const isSimulatorHost = (host?: string) =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host === '10.0.2.2' ||
  host === '10.0.3.2';
const runningOnSimulator = isSimulatorHost(fallbackHost);

const pickBaseUrl = () => {
  // 1) Use non-local env URL if provided
  if (envHost && !isLocalHost(envHost.origin)) return envHost.origin;

  // 2) If env is local or missing, and device host override is set, use it for real devices only
  if (deviceHost && !runningOnSimulator) {
    return deviceHost.port ? deviceHost.origin : `${deviceHost.origin}:3000`;
  }

  // 3) If env is local and no override, fall back to resolved host with default port
  return `http://${fallbackHost}:3000`;
};

const API_BASE_URL = pickBaseUrl();

type RequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string;
  skipAuthRefresh?: boolean;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type ApiAuthHandlers = {
  getTokens: () => AuthTokens | null;
  onTokensRefreshed?: (tokens: AuthTokens, user?: any) => void;
  onAuthFailure?: () => void;
};

let apiAuthHandlers: ApiAuthHandlers | null = null;

export function configureApiAuth(handlers: ApiAuthHandlers | null) {
  apiAuthHandlers = handlers;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!apiAuthHandlers?.getTokens) return null;

  const tokens = apiAuthHandlers.getTokens();
  if (!tokens?.refreshToken) return null;

  try {
    const result = await postJson<AuthResponse>(
      '/auth/refresh',
      { refreshToken: tokens.refreshToken },
      { skipAuthRefresh: true },
    );
    const newTokens = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
    apiAuthHandlers.onTokensRefreshed?.(newTokens, (result as any)?.user);
    return result.accessToken;
  } catch {
    apiAuthHandlers?.onAuthFailure?.();
    return null;
  }
}

const DEFAULT_TIMEOUT = 20000; // 20 seconds

async function requestJson<TResponse>(
  path: string,
  options: RequestOptions,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  // Check network status before making request
  const networkStatus = getCurrentNetworkStatus();
  if (networkStatus.isConnected === false) {
    const errorMessage =
      (typeof i18n?.t === 'function' && i18n.t('noNetworkConnection')) ||
      'Không có kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
    console.warn(`API request failed (offline): ${path} - ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  let response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutMsg =
        (typeof i18n?.t === 'function' && i18n.t('requestTimeout')) ||
        'Kết nối không ổn định. Vui lòng thử lại.';
      console.warn(`API request timeout: ${path}`);
      throw new Error(timeoutMsg);
    }

    const networkStatusAfterError = getCurrentNetworkStatus();
    if (networkStatusAfterError.isConnected === false) {
      const errorMessage =
        (typeof i18n?.t === 'function' && i18n.t('noNetworkConnection')) ||
        'Không có kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
      console.warn(`API request failed (offline after error): ${path} - ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const errorMsg =
      (typeof i18n?.t === 'function' && i18n.t('cannotConnectServer')) ||
      'Không thể kết nối tới máy chủ';
    console.warn(
      `API request failed (network error): ${path} - ${error?.message || errorMsg}`,
    );
    throw new Error(errorMsg);
  } finally {
    clearTimeout(timeoutId);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && options.token && !options.skipAuthRefresh) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return requestJson<TResponse>(path, {
          ...options,
          token: refreshedToken,
          skipAuthRefresh: true,
        });
      }
    }

    const fallbackMessage =
      response.status === 401
        ? (typeof i18n?.t === 'function'
          ? i18n.t('sessionExpired')
          : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        : response.status >= 500
          ? (typeof i18n?.t === 'function'
            ? i18n.t('serverUnavailable')
            : 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.')
          : (typeof i18n?.t === 'function'
            ? i18n.t('errorOccurred')
            : 'Đã xảy ra lỗi. Vui lòng thử lại.');
    const message =
      (Array.isArray(data?.message) && data?.message[0]) ||
      data?.message ||
      fallbackMessage;
    console.warn(`API request failed (${response.status}): ${path} - ${message}`);
    throw new Error(message);
  }

  return data as TResponse;
}

async function uploadImageRequest(
  file: UploadImageFile,
  options?: { token?: string; skipAuthRefresh?: boolean; folder?: string },
): Promise<any> {
  const url = `${API_BASE_URL}/upload/image${options?.folder ? `?folder=${encodeURIComponent(options.folder)}` : ''}`;
  const buildFormData = () => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'image.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    return formData;
  };

  const execute = async (token?: string, skipAuthRefresh?: boolean): Promise<any> => {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: buildFormData(),
      });
    } catch (error: any) {
      throw new Error(error?.message || 'Không thể kết nối tới máy chủ');
    }

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401 && token && !skipAuthRefresh) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          return execute(refreshedToken, true);
        }
      }

      const message =
        (Array.isArray(data?.message) && data?.message[0]) ||
        data?.message ||
        'Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.';
      throw new Error(message);
    }

    return data;
  };

  return execute(options?.token, options?.skipAuthRefresh);
}

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  options?: { token?: string; skipAuthRefresh?: boolean },
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: 'POST',
    body,
    token: options?.token,
    skipAuthRefresh: options?.skipAuthRefresh,
  });
}

async function getJson<TResponse>(
  path: string,
  options?: { token?: string; skipAuthRefresh?: boolean },
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: 'GET',
    token: options?.token,
    skipAuthRefresh: options?.skipAuthRefresh,
  });
}

async function patchJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  options?: { token?: string; skipAuthRefresh?: boolean },
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: 'PATCH',
    body,
    token: options?.token,
    skipAuthRefresh: options?.skipAuthRefresh,
  });
}

async function deleteJson<TResponse>(
  path: string,
  options?: { token?: string; skipAuthRefresh?: boolean },
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: 'DELETE',
    token: options?.token,
    skipAuthRefresh: options?.skipAuthRefresh,
  });
}

export function getProducts(params?: { limit?: number; skip?: number }) {
  const query = params
    ? `?${new URLSearchParams({
      ...(params.limit ? { limit: String(params.limit) } : {}),
      ...(params.skip ? { skip: String(params.skip) } : {}),
    }).toString()}`
    : '';
  return getJson<ApiProduct[]>(`/products${query}`);
}

export function getProductById(id: string) {
  return getJson<ApiProduct>(`/products/${id}`);
}

export function getPublicBanners() {
  return getJson<ApiBanner[]>('/banners/public');
}



export function getRelatedProducts(id: string) {
  return getJson<ApiProduct[]>(`/products/${id}/related`).catch(err => {
    // If backend doesn't support related endpoint or product not found, fail soft
    console.warn('getRelatedProducts fallback:', err?.message || err);
    return [];
  });
}

export function createProduct(data: CreateProductInput, token: string) {
  return postJson<ApiProduct>('/products', data, { token });
}

export function getFavorites(token: string) {
  return getJson<ApiProduct[]>('/users/me/favorites', { token });
}

export function addFavorite(productId: string, token: string) {
  return postJson<ApiProduct[]>(`/users/me/favorites/${productId}`, {}, { token });
}

export function removeFavorite(productId: string, token: string) {
  return deleteJson<ApiProduct[]>(`/users/me/favorites/${productId}`, { token });
}

// Search History API types
export type ApiSearchHistory = {
  queries: string[];
  updatedAt?: string;
};

export type ApiAiChatHistoryMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  type?: string;
  metadata?: any;
  cards?: AiProductCard[];
  orderCards?: AiOrderCard[];
  addressCards?: AiAddressCard[];
  actions?: AiAction[];
};

export type ApiAiChatHistory = {
  messages: ApiAiChatHistoryMessage[];
  updatedAt?: string;
};

export type ApiAiChatArchive = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ApiAiChatHistoryMessage[];
};

export type ApiAiChatArchives = {
  archives: ApiAiChatArchive[];
  updatedAt?: string;
};

// Search History API functions
export function getSearchHistory(token: string): Promise<string[]> {
  return getJson<ApiSearchHistory>('/users/me/search-history', { token }).then(
    (response) => response?.queries || []
  );
}

export function saveSearchHistory(queries: string[], token: string): Promise<string[]> {
  return postJson<ApiSearchHistory>('/users/me/search-history', { queries }, { token }).then(
    (response) => response?.queries || queries
  );
}

export function clearSearchHistory(token: string): Promise<void> {
  return deleteJson<void>('/users/me/search-history', { token });
}

export function getAiChatHistory(token: string): Promise<ApiAiChatHistory> {
  return getJson<ApiAiChatHistory>('/users/me/ai-chat-history', { token });
}

export function saveAiChatHistory(
  messages: ApiAiChatHistoryMessage[],
  token: string,
): Promise<ApiAiChatHistory> {
  return postJson<ApiAiChatHistory>('/users/me/ai-chat-history', { messages }, { token });
}

export function clearAiChatHistory(token: string): Promise<void> {
  return deleteJson<void>('/users/me/ai-chat-history', { token });
}

export function getAiChatArchives(token: string): Promise<ApiAiChatArchives> {
  return getJson<ApiAiChatArchives>('/users/me/ai-chat-archives', { token });
}

export function saveAiChatArchives(
  archives: ApiAiChatArchive[],
  token: string,
): Promise<ApiAiChatArchives> {
  return postJson<ApiAiChatArchives>('/users/me/ai-chat-archives', { archives }, { token });
}

export function clearAiChatArchives(token: string): Promise<void> {
  return deleteJson<void>('/users/me/ai-chat-archives', { token });
}

export function getPopularSearches(): Promise<string[]> {
  return getJson<string[]>('/users/popular-searches'); // Public endpoint
}

// Search Trends API - dedicated endpoint for search trends
export function getSearchTrends(limit: number = 10): Promise<string[]> {
  return getJson<string[]>(`/search-trends?limit=${limit}`); // Public endpoint
}

// Increment search trend - called when user clicks on a product from search results
// This is a fire-and-forget endpoint, no auth required
export function incrementSearchTrend(keyword: string): Promise<{ success: boolean }> {
  return postJson<{ success: boolean }>('/search-trends/increment', { keyword });
}

export function getMyVouchers(token: string) {
  return getJson<ApiVoucher[]>('/vouchers/my', { token });
}

export function getCurrentUser(token: string) {
  return getJson<{ _id: string; name: string; email: string; avatar?: string }>('/users/me', { token });
}

export function updateProfile(data: { name?: string; avatar?: string; email?: string }, token: string) {
  return patchJson<{ user: any; accessToken?: string; refreshToken?: string }>(
    '/users/me',
    data,
    { token },
  );
}

export function uploadImage(
  file: UploadImageFile,
  options?: { token?: string; skipAuthRefresh?: boolean; folder?: string },
) {
  return uploadImageRequest(file, options);
}

export function getReviews(productId: string) {
  return getJson<ApiReview[]>(`/reviews/product/${productId}`);
}

export function createReview(
  productId: string,
  rating: number,
  comment: string,
  images: string[] | undefined,
  token: string,
) {
  return postJson<ApiReview>('/reviews', { productId, rating, comment, images }, { token });
}

export function login(email: string, password: string) {
  return postJson<AuthResponse>('/auth/login', { email, password });
}

export function socialLogin(idToken: string, provider: 'google' | 'apple') {
  return postJson<AuthResponse>('/auth/social-login', { idToken, provider });
}

export function sendRegisterOtp(
  name: string,
  email: string,
  password: string,
) {
  return postJson<{ message: string }>('/auth/register/send-otp', {
    name,
    email,
    password,
  });
}

export function verifyRegisterOtp(email: string, code: string) {
  return postJson<AuthResponse>('/auth/register/verify-otp', {
    email,
    code,
  });
}

export function sendResetOtp(email: string) {
  return postJson<{ message: string }>('/auth/password/reset/send-otp', { email });
}

export function verifyResetOtp(email: string, code: string) {
  return postJson<{ resetToken: string }>('/auth/password/reset/verify-otp', { email, code });
}

export function resetPassword(email: string, resetToken: string, newPassword: string) {
  return postJson<{ message: string }>('/auth/password/reset', { email, resetToken, newPassword });
}

export function sendChangePasswordOtp(currentPassword: string, token: string) {
  return postJson<{ message: string }>('/auth/password/change/send-otp', { currentPassword }, { token });
}

export function changePassword(currentPassword: string, newPassword: string, code: string, token: string) {
  return postJson<{ message: string }>('/auth/password/change', { currentPassword, newPassword, code }, { token });
}

export function createVnpayPayment(data: Record<string, unknown>, token: string) {
  return postJson<ApiVnpayPaymentResponse>('/payments/vnpay', data, { token });
}

export function createOrder(data: Record<string, unknown>, token: string) {
  return postJson<ApiOrder>('/orders', data, { token });
}

export function getOrders(token: string, options?: { scope?: 'mine' | 'all' }) {
  const scope = options?.scope;
  const path = scope ? `/orders?scope=${scope}` : '/orders';
  return getJson<ApiOrder[]>(path, { token });
}

export function getOrderById(id: string, token: string) {
  return getJson<ApiOrder>(`/orders/${id}`, { token });
}

export function getNotifications(token: string) {
  return getJson<ApiNotification[]>('/notifications', { token });
}

export function markNotificationRead(id: string, token: string) {
  return patchJson<ApiNotification[]>(`/notifications/${id}/read`, {}, { token });
}

export function markAllNotificationsRead(token: string) {
  return patchJson<ApiNotification[]>('/notifications/read-all', {}, { token });
}

// Address API types
export type BackendAddress = {
  name: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  type: string;
  isDefault: boolean;
};

export type FrontendAddress = {
  id: string;
  name: string;
  phone: string;
  detailedAddress: string;
  ward?: string;
  district?: string;
  city?: string;
  address: string;
  type: string;
  isDefault: boolean;
};

// Convert backend address to frontend format
function backendToFrontendAddress(addr: BackendAddress, index: number): FrontendAddress {
  const address = [addr.street, addr.ward, addr.district, addr.city]
    .filter(Boolean)
    .join(', ');

  return {
    id: `addr-${index}`,
    name: addr.name,
    phone: addr.phone,
    detailedAddress: addr.street,
    ward: addr.ward,
    district: addr.district,
    city: addr.city,
    address,
    type: toAddressTypeValue(normalizeAddressType(addr.type)),
    isDefault: addr.isDefault,
  };
}

// Convert frontend address to backend format
function frontendToBackendAddress(addr: Partial<FrontendAddress>): Partial<BackendAddress> {
  const district = addr.district || addr.ward || '';
  const ward = addr.ward || addr.district || '';
  return {
    name: addr.name,
    phone: addr.phone,
    city: addr.city,
    district,
    ward,
    street: addr.detailedAddress,
    type: toBackendAddressType(addr.type),
    isDefault: addr.isDefault,
  };
}

// Address API functions
export function getAddresses(token: string): Promise<FrontendAddress[]> {
  return getJson<BackendAddress[]>('/users/me/addresses', { token }).then(addresses =>
    (addresses || []).map((addr, index) => backendToFrontendAddress(addr, index))
  );
}

function extractAddressesFromResponse(response: any): BackendAddress[] {
  // Backend returns either an array of addresses or a user object with address array
  if (Array.isArray(response)) {
    return response;
  }
  if (response && Array.isArray(response.address)) {
    return response.address;
  }
  return [];
}

export function addAddress(
  address: Partial<FrontendAddress>,
  token: string,
): Promise<FrontendAddress[]> {
  const backendAddr = frontendToBackendAddress(address) as BackendAddress;
  return postJson<any>('/users/me/addresses', backendAddr, { token }).then(response => {
    const addresses = extractAddressesFromResponse(response);
    return addresses.map((addr, index) => backendToFrontendAddress(addr, index));
  });
}

export function updateAddress(
  index: number,
  address: Partial<FrontendAddress>,
  token: string,
): Promise<FrontendAddress[]> {
  const backendAddr = frontendToBackendAddress(address) as BackendAddress;
  return patchJson<any>(`/users/me/addresses/${index}`, backendAddr, { token }).then(response => {
    const addresses = extractAddressesFromResponse(response);
    return addresses.map((addr, idx) => backendToFrontendAddress(addr, idx));
  });
}

export function deleteAddress(index: number, token: string): Promise<FrontendAddress[]> {
  return deleteJson<any>(`/users/me/addresses/${index}`, { token }).then(response => {
    const addresses = extractAddressesFromResponse(response);
    return addresses.map((addr, idx) => backendToFrontendAddress(addr, idx));
  });
}

export function setDefaultAddress(index: number, token: string): Promise<FrontendAddress[]> {
  return patchJson<any>(`/users/me/addresses/${index}/default`, {}, { token }).then(response => {
    const addresses = extractAddressesFromResponse(response);
    return addresses.map((addr, idx) => backendToFrontendAddress(addr, idx));
  });
}

// AI endpoints
export function aiChat(
  data: { message: string; history?: { role: 'user' | 'ai'; content: string }[]; imageUrl?: string },
  token: string,
) {
  return postJson<AiChatResponse>('/ai/chat', data, { token });
}

export function confirmAiAction(confirmationId: string, token: string, quantity?: number, productId?: string) {
  return postJson<{ message: string }>(
    '/ai/confirm',
    { confirmationId, quantity, productId },
    { token },
  );
}

export function updateFcmToken(token: string, authToken: string) {
  return postJson('/users/me/fcm-token', { token }, { token: authToken });
}

export function addCartItem(
  productId: string,
  quantity: number,
  token: string,
  selectedOption?: string,
  selectedClassification?: string,
) {
  return postJson(
    '/carts/items',
    { productId, quantity, selectedOption, selectedClassification },
    { token },
  );
}

export function fetchMyCart(token: string) {
  return getJson<ApiCart[]>('/carts', { token });
}

export function upsertCart(
  items: ApiCartItem[],
  token: string,
  cartId?: string | null,
  extra?: Partial<Pick<ApiCart, 'subTotal' | 'totalItem' | 'shippingFee' | 'totalPrice' | 'voucher'>>,
) {
  const payload = {
    items,
    ...extra,
  };
  if (cartId) {
    return patchJson<ApiCart>(`/carts/${cartId}`, payload, { token });
  }
  return postJson<ApiCart>('/carts', payload, { token });
}
