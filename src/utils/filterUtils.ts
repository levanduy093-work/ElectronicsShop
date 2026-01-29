import { Product } from '../types';

export const normalizeText = (value?: string) =>
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const fuzzyMatch = (haystack: string, needle: string) => {
    const h = normalizeText(haystack);
    const n = normalizeText(needle);
    if (!n) return true;
    if (h.includes(n)) return true;
    const tokens = n.split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const allTokensIncluded = tokens.every(t => h.includes(t));
    if (allTokensIncluded) return true;
    const words = h.split(/\s+/).filter(Boolean);
    return tokens.every(t => words.some(w => w.startsWith(t)));
};

export const categoryAliases: Record<string, string[]> = {
    capacitor: ['tu dien', 'tụ điện', 'tụ điện hóa', 'tudien'],
    resistor: ['dien tro', 'điện trở', 'trở'],
    microcontroller: ['vi dieu khien', 'vi điều khiển', 'controller'],
    controller: ['vi dieu khien', 'vi điều khiển', 'controller'],
    sensor: ['cam bien', 'cảm biến'],
    power: ['nguon', 'nguon & pin', 'nguồn', 'nguồn & pin', 'battery', 'pin'],
    battery: ['pin', 'nguon', 'nguon & pin'],
    cable: ['day cap', 'dây cáp', 'dây & cáp', 'wire'],
    wire: ['day', 'day cap', 'dây', 'cable'],
    tool: ['dung cu', 'dụng cụ', 'tools'],
    ic: ['ic so', 'ic số', 'digital ic'],
};

export interface FilterOptions {
    priceRange?: [number, number];
    categories?: string[];
    rating?: number | null;
    onlyInStock?: boolean;
}

/**
 * Validates if a product matches the search query and filters.
 */
export const isProductMatch = (
    product: Product,
    searchQuery: string,
    filters: FilterOptions
): boolean => {
    const {
        priceRange = [0, 100000000],
        categories = [],
        rating = null,
        onlyInStock = false
    } = filters;

    // 1. Text Search Matching (if query exists)
    if (searchQuery.trim()) {
        const aliases = categoryAliases[normalizeText(product.category)] || [];
        const haystacks = [
            product.name,
            product.code || '',
            product.category || '',
            ...aliases,
            product.description || '',
            Object.entries(product.specs || {})
                .map(([k, v]) => `${k} ${v}`)
                .join(' '),
        ];
        const textMatch = haystacks.some(h => fuzzyMatch(h, searchQuery));
        if (!textMatch) return false;
    }

    // 2. Filter Matching
    const productPrice = product.salePrice ?? product.price ?? 0;
    if (productPrice < priceRange[0] || productPrice > priceRange[1]) return false;

    if (categories.length > 0 && !categories.includes(product.category)) return false;

    const productRating = product.averageRating ?? product.rating ?? 0;
    if (rating !== null && productRating < rating) return false;

    if (onlyInStock) {
        const stockQty = product.stockQuantity ?? 0;
        if (stockQty <= 0 || product.stock === 'Out of Stock') return false;
    }

    return true;
};

/**
 * Filters a list of products based on a search query and filter options.
 */
export const filterProducts = (
    products: Product[],
    searchQuery: string,
    filters: FilterOptions
): Product[] => {
    return products.filter(p => isProductMatch(p, searchQuery, filters));
};
