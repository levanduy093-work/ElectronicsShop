import { Platform } from 'react-native';

export type AuthResponse = {
  user: any;
  accessToken: string;
  refreshToken: string;
};

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    const message =
      (Array.isArray(data?.message) && data?.message[0]) ||
      data?.message ||
      'Đã xảy ra lỗi. Vui lòng thử lại.';
    throw new Error(message);
  }

  return data as TResponse;
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
