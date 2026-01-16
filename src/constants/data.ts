import { Category, Product, Voucher, ChatMessage } from '../types/models';

// Categories should be fetched from API or extracted from products dynamically
export const CATEGORIES: Category[] = [];

// Products should be loaded from the backend; keep empty to avoid showing fake placeholders
export const PRODUCTS: Product[] = [];

// Vouchers should be fetched from API
export const AVAILABLE_VOUCHERS: Voucher[] = [];

// Chat messages should start empty and be populated from API
export const MOCK_CHATS: ChatMessage[] = [];
