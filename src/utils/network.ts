import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
};

let currentStatus: NetworkStatus = {
  isConnected: false,
  isInternetReachable: null,
  type: null,
};

// Initialize network status lazily (don't call at top level)
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

function initializeNetworkStatus() {
  if (isInitialized) return Promise.resolve();
  if (initializationPromise) return initializationPromise;
  
  initializationPromise = NetInfo.fetch()
    .then(state => {
      currentStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type ?? null,
      };
      isInitialized = true;
    })
    .catch(err => {
      console.warn('Failed to initialize network status:', err);
      // Use default values on error
      isInitialized = true;
    });
  
  return initializationPromise;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(currentStatus);

  useEffect(() => {
    // Initialize first
    initializeNetworkStatus().then(() => {
      setStatus(currentStatus);
    });

    // Initial fetch
    NetInfo.fetch()
      .then(state => {
        const newStatus = {
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable ?? null,
          type: state.type ?? null,
        };
        currentStatus = newStatus;
        setStatus(newStatus);
      })
      .catch(err => {
        console.warn('Failed to fetch network status:', err);
      });

    // Listen to changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const newStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type ?? null,
      };
      currentStatus = newStatus;
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}

export function getCurrentNetworkStatus(): NetworkStatus {
  // Try to initialize if not already done
  if (!isInitialized) {
    initializeNetworkStatus().catch(() => {
      // Ignore errors
    });
  }
  return currentStatus;
}
