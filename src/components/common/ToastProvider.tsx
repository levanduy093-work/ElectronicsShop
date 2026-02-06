import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from './Toast';
import i18n from '../../i18n';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ERROR_CODE_MAP: Record<string, string> = {
  login_required: 'login_required',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  invalid_token: 'invalid_token',
  token_expired: 'token_expired',
  session_expired: 'sessionExpired',
  invalid_credentials: 'invalid_credentials',
  user_not_found: 'user_not_found',
  product_not_found: 'product_not_found',
  out_of_stock: 'out_of_stock',
  not_enough_stock: 'not_enough_stock',
  cannot_connect_server: 'cannotConnectServer',
  server_unavailable: 'serverUnavailable',
  request_timeout: 'requestTimeout',
  network_error: 'network_error',
  not_found: 'not_found',
  bad_request: 'bad_request',
  service_unavailable: 'service_unavailable',
};

const resolveToastMessage = (message: string) => {
  if (!message) return message;
  const trimmed = message.trim();
  if (!trimmed) return message;

  if (i18n.exists(trimmed)) return i18n.t(trimmed);

  const lowered = trimmed.toLowerCase();
  if (i18n.exists(lowered)) return i18n.t(lowered);

  const mappedKey = ERROR_CODE_MAP[lowered];
  if (mappedKey && i18n.exists(mappedKey)) return i18n.t(mappedKey);

  return message;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
    duration: number;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 2000) => {
    const resolvedMessage = resolveToastMessage(message);
    setToast({ message: resolvedMessage, type, visible: true, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => prev ? { ...prev, visible: false } : null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          visible={toast.visible}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
