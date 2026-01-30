import React, { useMemo, useState } from 'react';
import { Image, View, ImageProps, Text } from 'react-native';

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
      <View className="bg-[#F5F5F5] justify-center items-center" style={style}>
        {fallbackComponent || (
          <View className="w-full h-full justify-center items-center">
            <Text className="text-5xl opacity-30">📷</Text>
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
