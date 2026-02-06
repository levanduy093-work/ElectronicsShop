import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ============================================================================
// Root Stack Param List - Contains ALL detail screens outside tab navigator
// ============================================================================

export type RootStackParamList = {
    MainTabs: NavigatorScreenParams<RootTabParamList>;
    // Shared detail screens
    ProductDetail: { productId: string };
    Search: { initialQuery?: string };
    Filter: { type?: 'global' | 'catalog' };
    Notifications: undefined;
    // Cart flow
    Checkout: undefined;
    OrderDetail: { orderId: string };
    // Profile flow
    Auth: { mode?: 'login' | 'register' };
    Settings: undefined;
    OrderHistory: undefined;
    AddressBook: undefined;
    Wishlist: undefined;
    SupportCenter: undefined;
    ChangePassword: undefined;
    LanguageSelection: undefined;
    AdminAddProduct: undefined;
};

// ============================================================================
// Stack Param Lists - Now only contain ROOT screens for each tab
// ============================================================================

export type HomeStackParamList = {
    Home: undefined;
};

export type CatalogStackParamList = {
    Catalog: { category?: string };
};

export type AIStackParamList = {
    AIChat: undefined;
};

export type CartStackParamList = {
    Cart: undefined;
};

export type ProfileStackParamList = {
    Profile: undefined;
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

// Root screens in tabs
export type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type CatalogScreenProps = NativeStackScreenProps<CatalogStackParamList, 'Catalog'>;
export type AIChatScreenProps = NativeStackScreenProps<AIStackParamList, 'AIChat'>;
export type CartScreenProps = NativeStackScreenProps<CartStackParamList, 'Cart'>;
export type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

// Detail screens at root level
export type ProductDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
export type FilterScreenProps = NativeStackScreenProps<RootStackParamList, 'Filter'>;
export type NotificationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;
export type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;
export type OrderDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;
export type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Auth'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type OrderHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderHistory'>;
export type AddressBookScreenProps = NativeStackScreenProps<RootStackParamList, 'AddressBook'>;
export type WishlistScreenProps = NativeStackScreenProps<RootStackParamList, 'Wishlist'>;
export type SupportCenterScreenProps = NativeStackScreenProps<RootStackParamList, 'SupportCenter'>;
export type ChangePasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;
export type LanguageSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'LanguageSelection'>;
