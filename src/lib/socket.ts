import { io, Socket } from 'socket.io-client';
import { NativeModules, Platform } from 'react-native';

const resolveHost = () => {
  const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL as string | undefined;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)(?::\d+)?/);
    if (match?.[1]) return match[1];
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

// Use deployed backend in production; keep local host for development/testing.
const SOCKET_URL = __DEV__
  ? `http://${resolveHost()}:3000`
  : 'https://electronics-backend-69bpr.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'], // Bắt buộc dùng websocket để ổn định trên React Native
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
