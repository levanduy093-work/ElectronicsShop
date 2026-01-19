import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated, Dimensions, StyleSheet, ViewToken } from 'react-native';
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
            <Animated.View style={[styles.bannerContainer, animatedStyle]}>
                <ImageWithFallback
                    source={{ uri: item.imageUrl }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerBadge}>New Arrival</Text>
                    <Text style={styles.bannerTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.subtitle && (
                        <Text style={styles.bannerSubtitle} numberOfLines={1}>
                            {item.subtitle}
                        </Text>
                    )}
                    <View style={styles.bannerButton}>
                        <Text style={styles.bannerButtonText}>
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
        <View style={styles.bannerSection}>
            <AnimatedFlatList
                ref={bannerListRef}
                data={sliderBanners}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                style={styles.bannerList}
                showsHorizontalScrollIndicator={false}
                snapToInterval={sliderWidth}
                snapToAlignment="start"
                decelerationRate="fast"
                getItemLayout={(_, index) => ({ length: sliderWidth, offset: sliderWidth * index, index })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                contentContainerStyle={styles.bannerListContent}
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
                <View style={styles.bannerPager}>
                    {sliderBanners.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                styles.bannerPagerDot,
                                index === currentBannerIndex ? styles.bannerPagerDotActive : undefined,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bannerSection: {
        marginBottom: 32,
    },
    bannerList: {
        flexGrow: 0,
    },
    bannerListContent: {
        paddingHorizontal: 0,
    },
    bannerContainer: {
        width: '100%',
        aspectRatio: 2,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        padding: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    bannerBadge: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    bannerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 16,
    },
    bannerButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '600',
    },
    bannerPager: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    bannerPagerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    bannerPagerDotActive: {
        backgroundColor: '#2563EB',
    },
});
