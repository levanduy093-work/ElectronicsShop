import React, { useState } from 'react';
import { BottomNav } from './components/layout/BottomNav';
import { TopBar } from './components/layout/TopBar';
import { Home } from './components/pages/Home';
import { Catalog } from './components/pages/Catalog';
import { AIChat } from './components/pages/AIChat';
import { Cart } from './components/pages/Cart';
import { Profile } from './components/pages/Profile';
import { ProductDetail } from './components/pages/ProductDetail';
import { Checkout } from './components/pages/Checkout';
import { OrderHistory } from './components/pages/OrderHistory';
import { Auth } from './components/pages/Auth';
import { Notifications } from './components/pages/Notifications';
import { SearchScreen } from './components/pages/SearchScreen';
import { FilterScreen } from './components/pages/FilterScreen';
import { AddressBook } from './components/pages/AddressBook';
import { PaymentMethods } from './components/pages/PaymentMethods';
import { Settings } from './components/pages/Settings';
import { SupportCenter } from './components/pages/SupportCenter';
import { OrderDetail } from './components/pages/OrderDetail';
import { Wishlist } from './components/pages/Wishlist';
import { Product, CartItem } from './lib/data';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';
type Screen = NavTab | 'product-detail' | 'checkout' | 'order-history' | 'order-detail' | 'auth' | 'notifications' | 'search' | 'filter' | 'address-book' | 'payment-methods' | 'settings' | 'support' | 'wishlist';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home'); // To return correctly from Filter
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to apply dark mode class
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Derived state
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Navigation handlers
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
    // Nếu đang ở trang detail (từ nút tim), giữ nguyên trang detail.
    // Nếu đang ở trang auth (từ tab profile), về profile.
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

  // Render Content Logic
  const renderContent = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} />;
      case 'catalog':
        return <Catalog onFilterClick={openFilter} />;
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
        return <Profile />;
      
      // Full Screen Pages
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
        return selectedOrderId ? <OrderDetail orderId={selectedOrderId} onBack={navigateToOrderHistory} /> : null;

      case 'auth':
        return <Auth onBack={() => handleTabChange(currentTab)} onLoginSuccess={handleLoginSuccess} />;

      case 'notifications':
        return <Notifications onBack={() => handleTabChange(currentTab)} />;

      case 'search':
        return (
          <SearchScreen 
            onBack={() => {
              setSearchQuery(''); // Clear query when going back to main app
              handleTabChange(currentTab);
            }} 
            onProductClick={navigateToProduct} 
            onFilterClick={openFilter}
            initialQuery={searchQuery}
            onQueryChange={setSearchQuery}
          />
        );

      case 'filter':
        return <FilterScreen onClose={() => setCurrentScreen(previousScreen)} onApply={(filters) => {
          console.log("Filters applied:", filters);
          setCurrentScreen(previousScreen);
        }} />;

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
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} />;
    }
  };

  // Check if we should show BottomNav and TopBar
  const isFullScreen = ['product-detail', 'checkout', 'order-history', 'order-detail', 'auth', 'notifications', 'search', 'filter', 'address-book', 'payment-methods', 'settings', 'support', 'wishlist'].includes(currentScreen);
  const showTopBar = !isFullScreen && currentScreen !== 'ai' && currentScreen !== 'profile';

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-950 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        
        {showTopBar && (
          <TopBar 
            title={currentScreen === 'cart' ? 'Giỏ hàng' : 'ElectroAI'} 
            showSearch={currentScreen === 'home'} 
            onSearchClick={() => setCurrentScreen('search')}
            onFilterClick={openFilter}
            onNotificationClick={() => setCurrentScreen('notifications')}
          />
        )}
        
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${!isFullScreen && !showTopBar ? 'pt-0' : ''}`}>
          {/* Inject navigation props */}
          {currentScreen === 'catalog' || currentScreen === 'home' ? (
             React.cloneElement(renderContent() as React.ReactElement, {
               onProductClick: navigateToProduct 
             } as any)
          ) : currentScreen === 'profile' ? (
             React.cloneElement(renderContent() as React.ReactElement, {
                onNavigateToOrders: navigateToOrderHistory,
                onNavigateToAddress: () => setCurrentScreen('address-book'),
                onNavigateToPayment: () => setCurrentScreen('payment-methods'),
                onNavigateToSettings: () => setCurrentScreen('settings'),
                onNavigateToSupport: () => setCurrentScreen('support'),
                onNavigateToWishlist: () => setCurrentScreen('wishlist'),
                onLogout: () => setIsLoggedIn(false),
                userProfile: userProfile,
                onUpdateProfile: (data: any) => setUserProfile(prev => ({ ...prev, ...data }))
             } as any)
          ) : (
             renderContent()
          )}
        </main>

        {!isFullScreen && (
          <BottomNav 
            currentTab={currentTab} 
            onTabChange={handleTabChange} 
            cartCount={cartCount}
          />
        )}
      </div>
    </div>
  );
}