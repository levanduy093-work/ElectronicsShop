import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ============================================================================
// Stack Param Lists
// ============================================================================

export type HomeStackParamList = {
    Home: undefined;
    ProductDetail: { productId: string };
    Search: { initialQuery?: string };
    Notifications: undefined;
    OrderDetail: { orderId: string };
    Filter: undefined;
};

export type CatalogStackParamList = {
    Catalog: { category?: string };
    ProductDetail: { productId: string };
    Filter: undefined;
    Search: { initialQuery?: string };
    Notifications: undefined;
};

export type AIStackParamList = {
    AIChat: undefined;
    ProductDetail: { productId: string };
    Notifications: undefined;
};

export type CartStackParamList = {
    Cart: undefined;
    Checkout: undefined;
    ProductDetail: { productId: string };
    OrderDetail: { orderId: string };
    Notifications: undefined;
};

export type ProfileStackParamList = {
    Profile: undefined;
    Auth: { mode?: 'login' | 'register' };
    Settings: undefined;
    OrderHistory: undefined;
    OrderDetail: { orderId: string };
    AddressBook: undefined;
    Wishlist: undefined;
    SupportCenter: undefined;
    ChangePassword: undefined;
    LanguageSelection: undefined;
};

// ============================================================================
// Root Tab Param List
// ============================================================================

export type RootTabParamList = {
    HomeTab: NavigatorScreenParams<HomeStackParamList>;
    CatalogTab: NavigatorScreenParams<CatalogStackParamList>;
    AITab: NavigatorScreenParams<AIStackParamList>;
    CartTab: NavigatorScreenParams<CartStackParamList>;
    ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ============================================================================
// Screen Props Types
// ============================================================================

// Home Stack
export type HomeScreenProps = CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, 'Home'>,
    BottomTabScreenProps<RootTabParamList>
>;

export type HomeProductDetailScreenProps = CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>,
    BottomTabScreenProps<RootTabParamList>
>;

// Catalog Stack
export type CatalogScreenProps = CompositeScreenProps<
    NativeStackScreenProps<CatalogStackParamList, 'Catalog'>,
    BottomTabScreenProps<RootTabParamList>
>;

// AI Stack
export type AIChatScreenProps = CompositeScreenProps<
    NativeStackScreenProps<AIStackParamList, 'AIChat'>,
    BottomTabScreenProps<RootTabParamList>
>;

// Cart Stack
export type CartScreenProps = CompositeScreenProps<
    NativeStackScreenProps<CartStackParamList, 'Cart'>,
    BottomTabScreenProps<RootTabParamList>
>;

export type CheckoutScreenProps = CompositeScreenProps<
    NativeStackScreenProps<CartStackParamList, 'Checkout'>,
    BottomTabScreenProps<RootTabParamList>
>;

// Profile Stack
export type ProfileScreenProps = CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, 'Profile'>,
    BottomTabScreenProps<RootTabParamList>
>;

export type AuthScreenProps = CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, 'Auth'>,
    BottomTabScreenProps<RootTabParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, 'Settings'>,
    BottomTabScreenProps<RootTabParamList>
>;

// Generic props for shared screens
export type ProductDetailScreenProps<T extends { ProductDetail: { productId: string } }> =
    NativeStackScreenProps<T, 'ProductDetail'>;

export type OrderDetailScreenProps<T extends { OrderDetail: { orderId: string } }> =
    NativeStackScreenProps<T, 'OrderDetail'>;

export type SearchScreenProps<T extends { Search: { initialQuery?: string } }> =
    NativeStackScreenProps<T, 'Search'>;
