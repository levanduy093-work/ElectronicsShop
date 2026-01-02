import React, { useState } from 'react';
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
      source={source}
      style={style}
      onError={() => setHasError(true)}
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
