import React, { useMemo, useState } from 'react';
import { Image, View, StyleSheet, ImageProps, Text } from 'react-native';

interface ImageWithFallbackProps extends ImageProps {
  fallbackComponent?: React.ReactNode;
}

export function ImageWithFallback({ 
  source, 
  style, 
  fallbackComponent,
  ...props 
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isUsingProxy, setIsUsingProxy] = useState(false);

  const resolvedSource = useMemo(() => {
    if (!isUsingProxy) return source;
    const uri = (source as any)?.uri as string | undefined;
    if (!uri) return source;
    // Proxy qua weserv để tránh lỗi SSL/hotlink trên một số domain
    const stripped = uri.replace(/^https?:\/\//, '');
    return { uri: `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}` };
  }, [isUsingProxy, source]);

  if (hasError) {
    return (
      <View style={[styles.fallback, style]}>
        {fallbackComponent || (
          <View style={styles.errorContainer}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <Image
      {...props}
      source={resolvedSource}
      style={style}
      onError={() => {
        const uri = (source as any)?.uri as string | undefined;
        if (uri && !isUsingProxy) {
          setIsUsingProxy(true);
          return;
        }
        setHasError(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.3,
  },
});
