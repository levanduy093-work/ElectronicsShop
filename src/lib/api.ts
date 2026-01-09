import { Platform } from 'react-native';

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

export type ApiReview = {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt?: string;
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

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

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

async function requestJson<TResponse>(
  path: string,
  options: RequestOptions,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
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

    const fallbackMessage = response.status === 401
      ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      : 'Đã xảy ra lỗi. Vui lòng thử lại.';
    const message =
      (Array.isArray(data?.message) && data?.message[0]) ||
      data?.message ||
      fallbackMessage;
    throw new Error(message);
  }

  return data as TResponse;
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

export function getProducts() {
  return getJson<ApiProduct[]>('/products');
}

export function getProductById(id: string) {
  return getJson<ApiProduct>(`/products/${id}`);
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

export function createOrder(data: Record<string, unknown>, token: string) {
  return postJson<ApiOrder>('/orders', data, { token });
}

export function getOrders(token: string) {
  return getJson<ApiOrder[]>('/orders', { token });
}

export function getOrderById(id: string, token: string) {
  return getJson<ApiOrder>(`/orders/${id}`, { token });
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
    type: addr.type,
    isDefault: addr.isDefault,
  };
}

// Convert frontend address to backend format
function frontendToBackendAddress(addr: Partial<FrontendAddress>): Partial<BackendAddress> {
  return {
    name: addr.name,
    phone: addr.phone,
    city: addr.city,
    district: addr.district,
    ward: addr.ward,
    street: addr.detailedAddress,
    type: addr.type,
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
