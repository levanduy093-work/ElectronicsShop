import { useQuery } from '@tanstack/react-query';
import type { Product, HomeBanner } from '../types';
import { getProducts, getPublicBanners } from '../services/api';
import { cacheProducts, getCachedProducts, cacheBanners, getCachedBanners } from '../utils/cache';
import { mapApiProductToUi, mapApiBannerToUi } from '../utils/mappers';

export function useProductsQuery(initialData?: Product[]) {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            try {
                const result = await getProducts();
                await cacheProducts(result);
                return result.map(mapApiProductToUi);
            } catch (error) {
                const cached = await getCachedProducts();
                if (cached && cached.length > 0) {
                    return cached.map(mapApiProductToUi);
                }
                throw error;
            }
        },
        initialData: initialData && initialData.length > 0 ? initialData : undefined,
        staleTime: 60_000,
    });
}

export function useBannersQuery(initialData?: HomeBanner[]) {
    return useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            try {
                const result = await getPublicBanners();
                await cacheBanners(result);
                return result.map(mapApiBannerToUi);
            } catch (error) {
                const cached = await getCachedBanners();
                if (cached && cached.length > 0) {
                    return cached.map(mapApiBannerToUi);
                }
                throw error;
            }
        },
        initialData: initialData && initialData.length > 0 ? initialData : undefined,
        staleTime: 120_000,
    });
}
