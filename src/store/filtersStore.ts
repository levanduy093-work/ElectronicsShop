import { useSyncExternalStore } from 'react';

export type FilterState = {
    priceRange: [number, number];
    categories: string[];
    rating: number | null;
    onlyInStock: boolean;
};

export type FiltersState = {
    filters: FilterState;
    searchQuery: string;
    catalogFilters: FilterState;
    catalogSearchQuery: string;
};

const createDefaultFilterState = (): FilterState => ({
    priceRange: [0, 10000000],
    categories: [],
    rating: null,
    onlyInStock: false,
});

let state: FiltersState = {
    filters: createDefaultFilterState(),
    searchQuery: '',
    catalogFilters: createDefaultFilterState(),
    catalogSearchQuery: '',
};

const listeners = new Set<() => void>();

function emitChange() {
    listeners.forEach((listener) => listener());
}

export function getFiltersState() {
    return state;
}

export function subscribeFilters(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function setFiltersState(partial: Partial<FiltersState>) {
    state = { ...state, ...partial };
    emitChange();
}

export function useFiltersStore<T>(selector: (state: FiltersState) => T) {
    return useSyncExternalStore(
        subscribeFilters,
        () => selector(state),
        () => selector(state),
    );
}

export function setFilters(filters: FilterState) {
    setFiltersState({ filters });
}

export function setSearchQuery(searchQuery: string) {
    setFiltersState({ searchQuery });
}

export function setCatalogFilters(catalogFilters: FilterState) {
    setFiltersState({ catalogFilters });
}

export function setCatalogSearchQuery(catalogSearchQuery: string) {
    setFiltersState({ catalogSearchQuery });
}
