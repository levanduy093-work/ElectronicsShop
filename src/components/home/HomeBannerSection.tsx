import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated, Dimensions, ViewToken } from 'react-native';
import { HomeBanner } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const sliderWidth = width - 32;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const BannerCard = ({
    item,
    index,
    scrollX,
    onPress
}: {
    item: HomeBanner;
    index: number;
    scrollX: Animated.Value;
    onPress: () => void;
}) => {
    const inputRange = [
        (index - 1) * sliderWidth,
        index * sliderWidth,
        (index + 1) * sliderWidth,
    ];
    const animatedStyle = {
        transform: [
            {
                scale: scrollX.interpolate({
                    inputRange,
                    outputRange: [0.9, 1, 0.9],
                    extrapolate: 'clamp',
                }),
            },
        ],
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{ width: sliderWidth, paddingHorizontal: 4 }}
        >
            <Animated.View
                className="w-full aspect-[2] rounded-2xl overflow-hidden mb-3 shadow-md bg-gray-100" // Added bg-gray-100 as placeholder
                style={[
                    {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                    },
                    animatedStyle
                ]}
            >
                <ImageWithFallback
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 p-6 bg-black/40 justify-end">
                    <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">New Arrival</Text>
                    <Text className="text-white text-2xl font-bold mb-1" numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.subtitle && (
                        <Text className="text-white/80 text-sm mb-4" numberOfLines={1}>
                            {item.subtitle}
                        </Text>
                    )}
                    <View className="bg-white px-4 py-2 rounded-[20px] self-start">
                        <Text className="text-black text-sm font-semibold">
                            {item.ctaLabel || 'Shop Now'}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

interface HomeBannerSectionProps {
    banners: HomeBanner[];
    onBannerPress: (item: HomeBanner) => void;
    fallbackProduct?: any; // Just for fallback logic usage
}

export const HomeBannerSection: React.FC<HomeBannerSectionProps> = ({
    banners,
    onBannerPress,
    fallbackProduct
}) => {
    const { t } = useTranslation();
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const bannerListRef = useRef<FlatList<HomeBanner>>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems?.length && typeof viewableItems[0].index === 'number') {
            setCurrentBannerIndex(viewableItems[0].index);
        }
    }).current;

    const bannerScrollHandler = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
    );

    const sliderBanners: HomeBanner[] = banners.length
        ? banners
        : [
            {
                id: 'fallback-banner',
                title: 'Raspberry Pi 5',
                subtitle: t('banner_fallback_subtitle'),
                imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
                ctaLabel: t('explore_now'),
                ctaProductId: fallbackProduct?.id,
            },
        ];

    useEffect(() => {
        setCurrentBannerIndex(0);
    }, [sliderBanners.length]);

    useEffect(() => {
        if (sliderBanners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => {
                const nextIndex = (prev + 1) % sliderBanners.length;
                try {
                    bannerListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                } catch {
                    // ignore scroll errors when list not ready
                }
                return nextIndex;
            });
        }, 20000);

        return () => clearInterval(timer);
    }, [sliderBanners.length]);

    return (
        <View className="mb-8">
            <AnimatedFlatList
                ref={bannerListRef}
                data={sliderBanners}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                style={{ flexGrow: 0 }}
                showsHorizontalScrollIndicator={false}
                snapToInterval={sliderWidth}
                snapToAlignment="start"
                decelerationRate="fast"
                getItemLayout={(_, index) => ({ length: sliderWidth, offset: sliderWidth * index, index })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                scrollEventThrottle={16}
                onScroll={bannerScrollHandler}
                renderItem={({ item, index }) => (
                    <BannerCard
                        item={item as HomeBanner}
                        index={index}
                        scrollX={scrollX}
                        onPress={() => onBannerPress(item as HomeBanner)}
                    />
                )}
            />
            {sliderBanners.length > 1 && (
                <View className="flex-row justify-center items-center gap-2 mt-2">
                    {sliderBanners.map((item, index) => (
                        <View
                            key={item.id}
                            className={`w-2 h-2 rounded-full ${index === currentBannerIndex ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};
