import { io, Socket } from 'socket.io-client';
import { NativeModules, Platform } from 'react-native';
import { API_BASE_URL as ENV_API_URL, API_DEVICE_HOST, SOCKET_URL as ENV_SOCKET_URL } from '@env';

const resolveHost = () => {
  const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL as string | undefined;
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

const isLocalHost = (url?: string) => !!url && /localhost|127\.0\.0\.1/.test(url);
const envSocket = cleanHost(ENV_SOCKET_URL);
const envApi = cleanHost(ENV_API_URL);
const deviceHost = cleanHost(API_DEVICE_HOST);
const fallbackHost = resolveHost();

const pickSocketUrl = () => {
  // 1) Explicit socket URL if not local
  if (envSocket && !isLocalHost(envSocket.origin)) return envSocket.origin;

  // 2) API URL if not local
  if (envApi && !isLocalHost(envApi.origin)) return envApi.origin;

  // 3) Device host override (default port 3000 if missing)
  if (deviceHost) return deviceHost.port ? deviceHost.origin : `${deviceHost.origin}:3000`;

  // 4) If explicit socket URL is local, fall back to resolved host
  if (envSocket && isLocalHost(envSocket.origin)) return `http://${fallbackHost}:3000`;

  // 5) Default to resolved host
  return `http://${fallbackHost}:3000`;
};

const SOCKET_URL = pickSocketUrl();

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Thêm polling để fallback nếu websocket lỗi
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  getId() {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
