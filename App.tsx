/**
 * ElectronicsShop App
 * React Native version converted from Figma design
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home } from './src/screens/Home';
import { Catalog } from './src/screens/Catalog';
import { AIChat } from './src/screens/AIChat';
import { Cart } from './src/screens/Cart';
import { Profile } from './src/screens/Profile';
import { ProductDetail } from './src/screens/ProductDetail';
import { Checkout } from './src/screens/Checkout';
import { OrderHistory } from './src/screens/OrderHistory';
import { OrderDetail } from './src/screens/OrderDetail';
import { Auth } from './src/screens/Auth';
import { SearchScreen } from './src/screens/SearchScreen';
import { FilterScreen } from './src/screens/FilterScreen';
import { Wishlist } from './src/screens/Wishlist';
import { AddressBook } from './src/screens/AddressBook';
import { PaymentMethods } from './src/screens/PaymentMethods';
import { Settings } from './src/screens/Settings';
import { SupportCenter } from './src/screens/SupportCenter';
import { Notifications } from './src/screens/Notifications';
import { BottomNav } from './src/components/layout/BottomNav';
import { TopBar } from './src/components/layout/TopBar';
import { Product, CartItem } from './src/lib/data';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';
type Screen = NavTab | 'product-detail' | 'checkout' | 'order-history' | 'order-detail' | 'auth' | 'notifications' | 'search' | 'filter' | 'address-book' | 'payment-methods' | 'settings' | 'support' | 'wishlist';

function App(): React.JSX.Element {
  const systemDarkMode = useColorScheme() === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(systemDarkMode);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenva@example.com",
    avatar: ""
  });

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    setCurrentScreen(tab);
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product-detail');
  };

  const navigateToCheckout = () => {
    if (!isLoggedIn) {
      setCurrentScreen('auth');
    } else {
      setCurrentScreen('checkout');
    }
  };

  const navigateToOrderHistory = () => {
    setCurrentScreen('order-history');
  };

  const navigateToOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentScreen('order-detail');
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    handleTabChange('cart');
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    if (currentScreen === 'auth') {
      if (previousScreen === 'product-detail') {
        setCurrentScreen('product-detail');
      } else {
        handleTabChange('profile');
      }
    }
  };

  const openFilter = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('filter');
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} onProductClick={navigateToProduct} />;
      case 'catalog':
        return <Catalog onFilterClick={openFilter} onProductClick={navigateToProduct} />;
      case 'ai':
        return <AIChat />;
      case 'cart':
        return (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onExplore={() => handleTabChange('catalog')}
            onCheckout={navigateToCheckout}
          />
        );
      case 'profile':
        if (!isLoggedIn) return <Auth onBack={() => handleTabChange('home')} onLoginSuccess={handleLoginSuccess} />;
        return (
          <Profile
            onNavigateToOrders={navigateToOrderHistory}
            onNavigateToAddress={() => setCurrentScreen('address-book')}
            onNavigateToPayment={() => setCurrentScreen('payment-methods')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onNavigateToSupport={() => setCurrentScreen('support')}
            onNavigateToWishlist={() => setCurrentScreen('wishlist')}
            onLogout={() => setIsLoggedIn(false)}
            userProfile={userProfile}
            onUpdateProfile={(data) => setUserProfile(prev => ({ ...prev, ...data }))}
          />
        );

      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => handleTabChange(currentTab)}
            onAddToCart={handleAddToCart}
            isFavorite={wishlist.some(item => item.id === selectedProduct.id)}
            onToggleFavorite={() => handleToggleWishlist(selectedProduct)}
            isLoggedIn={isLoggedIn}
            onRequireLogin={() => {
              setPreviousScreen('product-detail');
              setCurrentScreen('auth');
            }}
          />
        ) : null;

      case 'checkout':
        return (
          <Checkout
            onBack={() => handleTabChange('cart')}
            onSuccess={() => {
              setCartItems([]);
              handleTabChange('home');
            }}
            totalAmount={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 30000}
          />
        );

      case 'order-history':
        return <OrderHistory onBack={() => handleTabChange('profile')} onViewDetail={navigateToOrderDetail} />;

      case 'order-detail':
        return selectedOrderId ? (
          <OrderDetail orderId={selectedOrderId} onBack={navigateToOrderHistory} />
        ) : null;

      case 'auth':
        return <Auth onBack={() => handleTabChange(currentTab)} onLoginSuccess={handleLoginSuccess} />;

      case 'notifications':
        return <Notifications onBack={() => handleTabChange(currentTab)} />;

      case 'search':
        return (
          <SearchScreen
            onBack={() => handleTabChange(currentTab)}
            onProductClick={navigateToProduct}
            onFilterClick={openFilter}
            initialQuery={searchQuery}
            onQueryChange={setSearchQuery}
          />
        );

      case 'filter':
        return (
          <FilterScreen
            onClose={() => setCurrentScreen(previousScreen)}
            onApply={(filters) => {
              console.log("Filters applied:", filters);
              setCurrentScreen(previousScreen);
            }}
          />
        );

      case 'address-book':
        return <AddressBook onBack={() => handleTabChange('profile')} />;

      case 'payment-methods':
        return <PaymentMethods onBack={() => handleTabChange('profile')} />;

      case 'settings':
        return (
          <Settings
            onBack={() => handleTabChange('profile')}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        );

      case 'support':
        return <SupportCenter onBack={() => handleTabChange('profile')} />;

      case 'wishlist':
        return (
          <Wishlist
            items={wishlist}
            onBack={() => handleTabChange('profile')}
            onRemove={(id) => setWishlist(prev => prev.filter(p => p.id !== id))}
            onProductClick={navigateToProduct}
          />
        );

      default:
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} onProductClick={navigateToProduct} />;
    }
  };

  const isFullScreen = ['product-detail', 'checkout', 'order-history', 'order-detail', 'auth', 'notifications', 'search', 'filter', 'address-book', 'payment-methods', 'settings', 'support', 'wishlist'].includes(currentScreen);
  const showTopBar = !isFullScreen && currentScreen !== 'ai' && currentScreen !== 'profile';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        {showTopBar && (
          <TopBar
            title={currentScreen === 'cart' ? 'Giỏ hàng' : 'ElectroAI'}
            showSearch={currentScreen === 'home'}
            onSearchClick={() => setCurrentScreen('search')}
            onFilterClick={openFilter}
            onNotificationClick={() => setCurrentScreen('notifications')}
          />
        )}

        <View style={styles.content}>
          {renderContent()}
        </View>

        {!isFullScreen && (
          <BottomNav
            currentTab={currentTab}
            onTabChange={handleTabChange}
            cartCount={cartCount}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
});

export default App;
