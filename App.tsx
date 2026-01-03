/**
 * ElectronicsShop App
 * React Native version converted from Figma design
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
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
import { ChangePassword } from './src/screens/ChangePassword';
import { BottomNav } from './src/components/layout/BottomNav';
import { TopBar } from './src/components/layout/TopBar';
import { Product, CartItem, Order, PRODUCTS } from './src/lib/data';
import { Address, DEFAULT_ADDRESSES } from './src/lib/address';
import { darkTheme, lightTheme, ThemeProvider } from './src/lib/theme';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';
type Screen = NavTab | 'product-detail' | 'checkout' | 'order-history' | 'order-detail' | 'auth' | 'notifications' | 'search' | 'filter' | 'address-book' | 'payment-methods' | 'settings' | 'support' | 'wishlist' | 'change-password';

// Mock orders với các trạng thái khác nhau
const getMockOrders = (): Order[] => {
    const now = new Date();
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    return [
      // Đơn hàng đang xử lý
      {
        id: 'ORD-2026-815295',
        date: formatDate(now),
        status: 'processing',
        statusText: 'Đang xử lý',
        items: [
          {
            id: 'p1',
            name: 'Arduino Uno R3 ATmega328P',
            price: 150000,
            quantity: 1,
            image: PRODUCTS[0].image,
          },
          {
            id: 'p4',
            name: 'Mỏ hàn điều chỉnh nhiệt độ 60W',
            price: 180000,
            quantity: 1,
            image: PRODUCTS[3].image,
          },
        ],
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0987 654 321',
          address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        },
        payment: {
          method: 'Ví điện tử MoMo',
          subtotal: 330000,
          shippingFee: 30000,
          discount: 0,
          total: 360000,
        },
        timeline: [
          { time: formatDate(now), title: 'Đặt hàng thành công', active: true },
          { time: '', title: 'Đã xác nhận đơn hàng', active: false },
          { time: '', title: 'Đang đóng gói', active: false },
          { time: '', title: 'Đang giao hàng', active: false },
          { time: '', title: 'Giao hàng thành công', active: false },
        ],
      },
      // Đơn hàng đang vận chuyển
      {
        id: 'ORD-2026-812456',
        date: formatDate(yesterday),
        status: 'shipping',
        statusText: 'Đang giao',
        items: [
          {
            id: 'p2',
            name: 'Module ESP32-WROOM-32',
            price: 110000,
            quantity: 2,
            image: PRODUCTS[1].image,
          },
          {
            id: 'p3',
            name: 'Cảm biến siêu âm HC-SR04',
            price: 25000,
            quantity: 3,
            image: PRODUCTS[2].image,
          },
        ],
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0987 654 321',
          address: 'Số 123, Nguyễn Trãi, Thanh Xuân, Hà Nội',
        },
        payment: {
          method: 'Thanh toán khi nhận hàng (COD)',
          subtotal: 295000,
          shippingFee: 30000,
          discount: 30000,
          total: 295000,
        },
        timeline: [
          { time: formatDate(yesterday), title: 'Đặt hàng thành công', active: true },
          { time: formatDate(yesterday), title: 'Đã xác nhận đơn hàng', active: true },
          { time: formatDate(yesterday), title: 'Đang đóng gói', active: true },
          { time: formatDate(now), title: 'Đang giao hàng', active: true },
          { time: '', title: 'Giao hàng thành công', active: false },
        ],
      },
      // Đơn hàng đã giao hàng
      {
        id: 'ORD-2026-809123',
        date: formatDate(threeDaysAgo),
        status: 'completed',
        statusText: 'Hoàn thành',
        items: [
          {
            id: 'p1',
            name: 'Arduino Uno R3 ATmega328P',
            price: 150000,
            quantity: 2,
            image: PRODUCTS[0].image,
          },
        ],
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0987 654 321',
          address: 'Số 45, Láng Hạ, Đống Đa, Hà Nội',
        },
        payment: {
          method: 'Thẻ ATM / Internet Banking',
          subtotal: 300000,
          shippingFee: 30000,
          discount: 50000,
          total: 280000,
        },
        timeline: [
          { time: formatDate(threeDaysAgo), title: 'Đặt hàng thành công', active: true },
          { time: formatDate(threeDaysAgo), title: 'Đã xác nhận đơn hàng', active: true },
          { time: formatDate(yesterday), title: 'Đang đóng gói', active: true },
          { time: formatDate(yesterday), title: 'Đang giao hàng', active: true },
          { time: formatDate(now), title: 'Giao hàng thành công', active: true },
        ],
      },
      // Đơn hàng đã giao hàng (cũ hơn)
      {
        id: 'ORD-2026-805789',
        date: formatDate(fiveDaysAgo),
        status: 'completed',
        statusText: 'Hoàn thành',
        items: [
          {
            id: 'p4',
            name: 'Mỏ hàn điều chỉnh nhiệt độ 60W',
            price: 180000,
            quantity: 1,
            image: PRODUCTS[3].image,
          },
          {
            id: 'p3',
            name: 'Cảm biến siêu âm HC-SR04',
            price: 25000,
            quantity: 2,
            image: PRODUCTS[2].image,
          },
        ],
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0987 654 321',
          address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        },
        payment: {
          method: 'Ví điện tử MoMo',
          subtotal: 230000,
          shippingFee: 30000,
          discount: 0,
          total: 260000,
        },
        timeline: [
          { time: formatDate(fiveDaysAgo), title: 'Đặt hàng thành công', active: true },
          { time: formatDate(fiveDaysAgo), title: 'Đã xác nhận đơn hàng', active: true },
          { time: formatDate(threeDaysAgo), title: 'Đang đóng gói', active: true },
          { time: formatDate(threeDaysAgo), title: 'Đang giao hàng', active: true },
          { time: formatDate(yesterday), title: 'Giao hàng thành công', active: true },
        ],
      },
    ];
};

function App(): React.JSX.Element {
  const systemDarkMode = useColorScheme() === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(systemDarkMode);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Khởi tạo mock orders khi component mount
  useEffect(() => {
    const mockOrders = getMockOrders();
    console.log('App.tsx - Initializing orders:', mockOrders.length);
    setOrders(mockOrders);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenva@example.com",
    avatar: ""
  });

  const handleUpdateProfile = (data: Partial<typeof userProfile>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const theme = isDarkMode ? darkTheme : lightTheme;

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

  const createOrder = (orderId: string, items: CartItem[], totalAmount: number) => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const paymentMethods = [
      'Ví điện tử MoMo',
      'Thanh toán khi nhận hàng (COD)',
      'Thẻ ATM / Internet Banking'
    ];

    const newOrder: Order = {
      id: orderId,
      date: dateStr,
      status: 'processing',
      statusText: 'Đang xử lý',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: {
        name: userProfile.name,
        phone: '0987 654 321',
        address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      },
      payment: {
        method: paymentMethods[0], // Default to first payment method
        subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shippingFee: 30000,
        discount: 0,
        total: totalAmount,
      },
      timeline: [
        { time: dateStr, title: 'Đặt hàng thành công', active: true },
        { time: '', title: 'Đã xác nhận đơn hàng', active: false },
        { time: '', title: 'Đang đóng gói', active: false },
        { time: '', title: 'Đang giao hàng', active: false },
        { time: '', title: 'Giao hàng thành công', active: false },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
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
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} onProductClick={navigateToProduct} theme={theme} />;
      case 'catalog':
        return <Catalog onFilterClick={openFilter} onProductClick={navigateToProduct} theme={theme} />;
      case 'ai':
        return <AIChat theme={theme} onNotificationClick={() => setCurrentScreen('notifications')} />;
      case 'cart':
        return (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onExplore={() => handleTabChange('catalog')}
            onCheckout={navigateToCheckout}
            theme={theme}
          />
        );
      case 'profile':
        if (!isLoggedIn) return <Auth onBack={() => handleTabChange('home')} onLoginSuccess={handleLoginSuccess} theme={theme} />;
        return (
          <Profile
            onNavigateToOrders={navigateToOrderHistory}
            orderCount={orders.length}
            onNavigateToAddress={() => setCurrentScreen('address-book')}
            onNavigateToPayment={() => setCurrentScreen('payment-methods')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onNavigateToSupport={() => setCurrentScreen('support')}
            onNavigateToWishlist={() => setCurrentScreen('wishlist')}
            onLogout={() => setIsLoggedIn(false)}
            userProfile={userProfile}
            onUpdateProfile={(data) => setUserProfile(prev => ({ ...prev, ...data }))}
            theme={theme}
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
            theme={theme}
          />
        ) : null;

      case 'checkout':
        return (
          <Checkout
            onBack={() => handleTabChange('cart')}
            onSuccess={(orderId) => {
              createOrder(orderId, cartItems, cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 30000);
              setCartItems([]);
              handleTabChange('home');
            }}
            totalAmount={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 30000}
            cartItems={cartItems}
            theme={theme}
            addresses={addresses}
            onUpdateAddresses={setAddresses}
          />
        );

      case 'order-history':
        console.log('App.tsx - Rendering OrderHistory with orders count:', orders.length);
        return <OrderHistory onBack={() => handleTabChange('profile')} onViewDetail={navigateToOrderDetail} orders={orders} theme={theme} />;

      case 'order-detail':
        return selectedOrderId ? (
          <OrderDetail 
            orderId={selectedOrderId} 
            onBack={navigateToOrderHistory} 
            order={orders.find(o => o.id === selectedOrderId)}
            theme={theme}
          />
        ) : null;

      case 'auth':
        return <Auth onBack={() => handleTabChange(currentTab)} onLoginSuccess={handleLoginSuccess} theme={theme} />;

      case 'notifications':
        return <Notifications onBack={() => handleTabChange(currentTab)} theme={theme} />;

      case 'search':
        return (
          <SearchScreen
            onBack={() => handleTabChange(currentTab)}
            onProductClick={navigateToProduct}
            onFilterClick={openFilter}
            initialQuery={searchQuery}
            onQueryChange={setSearchQuery}
            theme={theme}
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
            theme={theme}
          />
        );

      case 'address-book':
        return (
          <AddressBook
            onBack={() => handleTabChange('profile')}
            theme={theme}
            addresses={addresses}
            onUpdateAddresses={setAddresses}
          />
        );

      case 'payment-methods':
        return <PaymentMethods onBack={() => handleTabChange('profile')} theme={theme} />;

      case 'settings':
        return (
          <Settings
            onBack={() => handleTabChange('profile')}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onChangePassword={() => setCurrentScreen('change-password')}
            theme={theme}
          />
        );

      case 'support':
        return <SupportCenter onBack={() => handleTabChange('profile')} theme={theme} />;

      case 'wishlist':
        return (
          <Wishlist
            items={wishlist}
            onBack={() => handleTabChange('profile')}
            onRemove={(id) => setWishlist(prev => prev.filter(p => p.id !== id))}
            onProductClick={navigateToProduct}
            theme={theme}
          />
        );

      case 'change-password':
        return (
          <ChangePassword
            onBack={() => setCurrentScreen('settings')}
            theme={theme}
            email={userProfile.email}
            onSuccess={() => setCurrentScreen('settings')}
          />
        );

      default:
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} onProductClick={navigateToProduct} />;
    }
  };

  const isFullScreen = ['product-detail', 'checkout', 'order-history', 'order-detail', 'auth', 'notifications', 'search', 'filter', 'address-book', 'payment-methods', 'settings', 'support', 'wishlist', 'change-password'].includes(currentScreen);
  const showTopBar = !isFullScreen && currentScreen !== 'ai' && currentScreen !== 'profile';

  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ theme, isDarkMode }}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.surface}
          translucent={true}
        />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {showTopBar && (
            <TopBar
              title={currentScreen === 'cart' ? 'Giỏ hàng' : 'ElectroAI'}
              showSearch={currentScreen === 'home'}
              onSearchClick={() => setCurrentScreen('search')}
              onFilterClick={openFilter}
              onNotificationClick={() => setCurrentScreen('notifications')}
              theme={theme}
            />
          )}

          <View style={[styles.content, { backgroundColor: theme.background }]}>
            {renderContent()}
          </View>

          {!isFullScreen && (
            <BottomNav
              currentTab={currentTab}
              onTabChange={handleTabChange}
              cartCount={cartCount}
              theme={theme}
            />
          )}
        </View>
      </ThemeProvider>
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
