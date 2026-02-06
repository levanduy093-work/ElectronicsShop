import { io, Socket } from 'socket.io-client';
import { NativeModules, Platform } from 'react-native';
import { API_BASE_URL as ENV_API_URL, API_DEVICE_HOST } from '@env';

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
const envApi = cleanHost(ENV_API_URL);
const deviceHost = cleanHost(API_DEVICE_HOST);
const fallbackHost = resolveHost();
const isSimulatorHost = (host?: string) =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host === '10.0.2.2' ||
  host === '10.0.3.2';
const runningOnSimulator = isSimulatorHost(fallbackHost);

const pickSocketUrl = () => {
  // 1) Prefer API URL when it is not pointing to localhost
  if (envApi && !isLocalHost(envApi.origin)) return envApi.origin;

  // 2) Device host override (default port 3000 if missing) for real devices only
  if (deviceHost && !runningOnSimulator) {
    return deviceHost.port ? deviceHost.origin : `${deviceHost.origin}:3000`;
  }

  // 3) Use API URL even if local (works on simulators)
  if (envApi) return envApi.origin;

  // 4) Default to resolved host
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
