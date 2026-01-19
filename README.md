# ElectroAI - Ứng dụng Mua Sắm Linh Kiện Điện Tử

## 📱 Tổng quan

ElectroAI là một ứng dụng di động React Native được thiết kế để mua sắm và quản lý linh kiện điện tử. Ứng dụng được chuyển đổi từ thiết kế Figma và cung cấp trải nghiệm mua sắm hoàn chỉnh với tính năng AI hỗ trợ tư vấn linh kiện và scan sơ đồ mạch.

## ✨ Tính năng chính

### 🛍️ Mua sắm
- **Trang chủ**: Hiển thị banner sản phẩm mới, danh mục nhanh, sản phẩm nổi bật
- **Danh mục sản phẩm**: Duyệt theo các danh mục như Vi điều khiển, Cảm biến, Nguồn & Pin, Dây & Cáp, Dụng cụ, IC số
- **Chi tiết sản phẩm**: Xem thông tin chi tiết, thông số kỹ thuật, đánh giá và thêm vào giỏ hàng
- **Tìm kiếm & Lọc**: Tìm kiếm sản phẩm và lọc theo nhiều tiêu chí
- **Giỏ hàng**: Quản lý sản phẩm, cập nhật số lượng, xóa sản phẩm

### 🤖 AI Assistant
- **Chat với AI**: Tư vấn linh kiện điện tử phù hợp với nhu cầu
- **Scan sơ đồ mạch**: Tải lên hình ảnh hoặc PDF để AI phân tích và tạo BOM list
- **Gợi ý thông minh**: AI đưa ra các gợi ý sản phẩm dựa trên yêu cầu

### 👤 Quản lý tài khoản
- **Đăng nhập/Đăng ký**: Xác thực người dùng
- **Hồ sơ cá nhân**: Quản lý thông tin cá nhân, avatar
- **Danh sách yêu thích**: Lưu sản phẩm yêu thích để mua sau
- **Lịch sử đơn hàng**: Xem tất cả đơn hàng đã đặt với các trạng thái khác nhau
- **Chi tiết đơn hàng**: Theo dõi tiến trình đơn hàng với timeline chi tiết

### 📦 Đặt hàng & Thanh toán
- **Thanh toán**: Hỗ trợ nhiều phương thức thanh toán:
  - Ví điện tử MoMo
  - Thanh toán khi nhận hàng (COD)
  - Thẻ ATM / Internet Banking
- **Sổ địa chỉ**: Quản lý nhiều địa chỉ giao hàng (Nhà riêng, Văn phòng)
- **Mã giảm giá**: Áp dụng voucher giảm giá và miễn phí vận chuyển
- **Theo dõi đơn hàng**: Xem trạng thái đơn hàng (Đang xử lý, Đang giao, Hoàn thành)

### ⚙️ Cài đặt & Hỗ trợ
- **Chế độ tối/Sáng**: Chuyển đổi giữa dark mode và light mode
- **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt và English với i18next
- **Thông báo**: Xem các thông báo từ hệ thống với Firebase Cloud Messaging
- **Trung tâm hỗ trợ**: Liên hệ và nhận hỗ trợ từ đội ngũ
- **Đổi mật khẩu**: Thay đổi mật khẩu tài khoản
- **Onboarding**: Màn hình hướng dẫn cho người dùng mới

### 🌐 Tính năng Nâng cao
- **Offline Support**: Cache dữ liệu để sử dụng khi không có internet
- **Search History**: Lưu lịch sử tìm kiếm và đồng bộ với backend
- **Real-time Updates**: Socket.io cho cập nhật thời gian thực
- **Image Upload**: Upload ảnh đại diện và hình ảnh sản phẩm với Cloudinary
- **Push Notifications**: Nhận thông báo đẩy với Firebase Cloud Messaging
- **Deep Linking**: Hỗ trợ deep links để điều hướng trực tiếp đến sản phẩm/đơn hàng

## 🏗️ Kiến trúc dự án

### Cấu trúc thư mục

```
ElectronicsShop/
├── src/
│   ├── assets/              # Tài nguyên tĩnh
│   │   └── images/          # Hình ảnh (logo, icons)
│   ├── components/          # Các component tái sử dụng
│   │   ├── address/         # Form quản lý địa chỉ
│   │   │   ├── AddressForm.tsx
│   │   │   ├── AddressItem.tsx
│   │   │   ├── LocationFields.tsx
│   │   │   └── LocationSelectModal.tsx
│   │   ├── ai/              # Component AI chat
│   │   │   └── MessageBubble.tsx
│   │   ├── auth/            # Component xác thực
│   │   │   ├── AuthForm.tsx
│   │   │   ├── ForgotPasswordView.tsx
│   │   │   └── VerifyEmailView.tsx
│   │   ├── cart/            # Component giỏ hàng
│   │   │   ├── CartEmptyState.tsx
│   │   │   ├── CartItemRow.tsx
│   │   │   ├── CartOptionModal.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartVoucherModal.tsx
│   │   ├── checkout/        # Component thanh toán
│   │   │   ├── AddressSection.tsx
│   │   │   ├── CheckoutSuccessView.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   ├── PaymentMethodSection.tsx
│   │   │   └── PaymentWaitingView.tsx
│   │   ├── common/          # Component chung
│   │   │   ├── Icon.tsx              # Icon wrapper cho react-native-vector-icons
│   │   │   ├── ImageWithFallback.tsx # Image component với fallback
│   │   │   ├── OfflineBanner.tsx     # Banner hiển thị khi offline
│   │   │   ├── Toast.tsx              # Toast notification component
│   │   │   └── ToastProvider.tsx     # Toast context provider
│   │   ├── home/            # Component trang chủ
│   │   │   ├── AIRecommendationsCard.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── FeaturedProductsSection.tsx
│   │   │   └── HomeBannerSection.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── TopBar.tsx    # Top navigation bar với search và filter
│   │   │   └── BottomNav.tsx # Bottom navigation với 5 tabs
│   │   ├── order/           # Component đơn hàng
│   │   │   ├── OrderActions.tsx
│   │   │   ├── OrderAddress.tsx
│   │   │   ├── OrderPaymentInfo.tsx
│   │   │   ├── OrderProductList.tsx
│   │   │   ├── OrderSupportModal.tsx
│   │   │   └── OrderTimeline.tsx
│   │   ├── profile/        # Component hồ sơ
│   │   │   ├── EditProfileModal.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileMenu.tsx
│   │   │   ├── ProfileStats.tsx
│   │   │   └── VoucherListModal.tsx
│   │   ├── support/         # Component hỗ trợ
│   │   │   ├── ContactOptions.tsx
│   │   │   ├── FAQList.tsx
│   │   │   └── SupportModal.tsx
│   │   └── ui/              # UI components
│   │       └── ProductCard.tsx # Card hiển thị sản phẩm
│   ├── constants/           # Constants và dữ liệu mặc định
│   │   ├── data.ts          # Dữ liệu mock (fallback)
│   │   ├── defaults.ts     # Giá trị mặc định
│   │   └── locations.json  # Dữ liệu địa điểm Việt Nam
│   ├── i18n/                # Internationalization
│   │   ├── index.ts         # Cấu hình i18next
│   │   └── locales/         # File ngôn ngữ
│   │       ├── en.json      # English translations
│   │       └── vi.json      # Tiếng Việt translations
│   ├── services/            # Services và API
│   │   ├── api.ts           # API client và endpoints
│   │   ├── fcm.ts           # Firebase Cloud Messaging
│   │   ├── locations.ts     # Service địa điểm
│   │   └── socket.ts        # Socket.io client
│   ├── theme/               # Theme system
│   │   └── index.ts         # Theme configuration
│   ├── types/               # TypeScript types
│   │   ├── env.d.ts         # Environment variables types
│   │   ├── index.ts         # Main types
│   │   ├── json.d.ts        # JSON module types
│   │   └── models.ts        # Data models
│   ├── utils/               # Utility functions
│   │   ├── address.ts       # Address utilities
│   │   ├── cache.ts         # Cache management
│   │   ├── index.ts         # Utility exports
│   │   ├── mappers.ts       # Data mappers
│   │   ├── network.ts       # Network status utilities
│   │   ├── permissions.ts   # Permission utilities
│   │   ├── product.ts       # Product utilities
│   │   └── searchHistory.ts # Search history management
│   └── screens/             # Các màn hình chính
│       ├── AddressBook.tsx
│       ├── AIChat.tsx
│       ├── Auth.tsx
│       ├── Cart.tsx
│       ├── Catalog.tsx
│       ├── ChangePassword.tsx
│       ├── Checkout.tsx
│       ├── FilterScreen.tsx
│       ├── Home.tsx
│       ├── LanguageSelection.tsx
│       ├── Notifications.tsx
│       ├── Onboarding.tsx
│       ├── OrderDetail.tsx
│       ├── OrderHistory.tsx
│       ├── PaymentMethods.tsx
│       ├── ProductDetail.tsx
│       ├── Profile.tsx
│       ├── SearchScreen.tsx
│       ├── Settings.tsx
│       ├── SupportCenter.tsx
│       └── Wishlist.tsx
├── android/                 # Native Android code
├── ios/                     # Native iOS code
├── App.tsx                  # Entry point của ứng dụng
├── package.json             # Dependencies và scripts
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
└── .env.example            # Environment variables template
```

### Luồng điều hướng

Ứng dụng sử dụng state management đơn giản với React hooks:
- **Bottom Navigation**: 5 tab chính (Home, Catalog, AI, Cart, Profile)
- **Full Screen Screens**: Các màn hình như ProductDetail, Checkout, OrderDetail, OrderHistory, Auth, Notifications, Search, Filter, AddressBook, PaymentMethods, Settings, SupportCenter, Wishlist, ChangePassword
- **Navigation Flow**: 
  - Từ Home/Catalog → ProductDetail → Add to Cart → Cart → Checkout → OrderHistory → OrderDetail
  - Profile → OrderHistory/AddressBook/PaymentMethods/Wishlist/Settings/SupportCenter
  - Search và Filter có thể được mở từ nhiều màn hình khác nhau

## 🛠️ Công nghệ sử dụng

### Core
- **React Native**: 0.83.1
- **React**: 19.2.0
- **TypeScript**: 5.8.3
- **Node.js**: >= 20

### Dependencies chính
- **@react-native-async-storage/async-storage** (^2.2.0): Local storage cho cache và user preferences
- **@react-native-community/netinfo** (^11.4.1): Kiểm tra trạng thái mạng
- **@react-native-community/slider** (^5.1.1): Slider component cho filter giá
- **@react-native-firebase/app** (^23.8.2): Firebase SDK
- **@react-native-firebase/messaging** (^23.8.2): Firebase Cloud Messaging cho push notifications
- **@react-native-clipboard/clipboard** (^1.16.3): Clipboard utilities
- **react-native-image-picker** (^8.2.1): Chọn và upload hình ảnh
- **react-native-safe-area-context** (^5.5.2): Quản lý safe area cho các thiết bị
- **react-native-svg** (^15.15.1): Render SVG graphics
- **react-native-vector-icons** (^10.3.0): Icons (MaterialCommunityIcons)
- **i18next** (^25.7.4): Internationalization framework
- **react-i18next** (^16.5.3): React bindings cho i18next
- **socket.io-client** (^4.8.3): WebSocket client cho real-time features
- **react-native-dotenv** (^3.4.11): Environment variables support

### Development Tools
- **@react-native-community/cli** (20.0.0): React Native CLI
- **@babel/core** (^7.25.2): Babel transpiler
- **ESLint** (^8.19.0): Code linting với @react-native/eslint-config
- **Prettier** (2.8.8): Code formatting
- **Jest** (^29.6.3): Testing framework
- **Metro**: JavaScript bundler (built-in với React Native)
- **TypeScript** (^5.8.3): Type checking

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 20
- **npm** hoặc **yarn**
- **React Native CLI**: 20.0.0
- **Android Studio** (cho Android development)
- **Xcode** (cho iOS development, chỉ trên macOS)

## 🚀 Cài đặt và chạy ứng dụng

### 1. Clone repository

```bash
git clone <repository-url>
cd ElectronicsShop
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cài đặt dependencies cho iOS (chỉ trên macOS)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

**Lưu ý**: React Native khuyến nghị sử dụng `npm run ios` hoặc `yarn ios` thay vì chạy `pod install` trực tiếp. Lệnh này sẽ tự động cài đặt pods khi cần thiết.

### 4. Chạy ứng dụng

#### Android

```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy Android app
npm run android
```

#### iOS (chỉ trên macOS)

```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy iOS app
npm run ios
```

## 📱 Các màn hình chính

### 1. Trang chủ (Home)
- Banner sản phẩm mới
- Danh mục nhanh với icons
- Sản phẩm nổi bật
- Card AI Engineer để truy cập tính năng AI

### 2. Danh mục (Catalog)
- Hiển thị tất cả sản phẩm với grid layout
- Lọc sản phẩm theo nhiều tiêu chí:
  - Khoảng giá (slider)
  - Danh mục (multi-select)
  - Đánh giá (rating)
  - Tình trạng tồn kho
- ProductCard hiển thị hình ảnh, tên, giá, rating

### 3. AI Chat
- Giao diện chat với AI Engineer
- Gợi ý câu hỏi nhanh để bắt đầu cuộc trò chuyện
- Hỗ trợ upload hình ảnh/PDF để scan sơ đồ mạch
- Phân tích và tạo BOM (Bill of Materials) list từ sơ đồ
- Tư vấn linh kiện điện tử phù hợp với nhu cầu

### 4. Giỏ hàng (Cart)
- Danh sách sản phẩm đã thêm vào giỏ
- Cập nhật số lượng (tăng/giảm)
- Xóa sản phẩm khỏi giỏ hàng
- Tính tổng tiền và phí vận chuyển (30,000₫)
- Hiển thị badge số lượng sản phẩm trên icon giỏ hàng
- Nút "Khám phá thêm" để quay về Catalog khi giỏ hàng trống

### 5. Hồ sơ (Profile)
- Thông tin người dùng
- Menu điều hướng đến các tính năng:
  - Đơn hàng của tôi
  - Sổ địa chỉ
  - Phương thức thanh toán
  - Danh sách yêu thích
  - Cài đặt
  - Trung tâm hỗ trợ
  - Đăng xuất

## 🎨 Theme System

Ứng dụng hỗ trợ Dark Mode và Light Mode với tự động phát hiện theo hệ thống:

### Light Theme
- Background: #F5F7FA
- Surface: #FFFFFF
- Primary: #2563EB
- Text: #111827
- Muted: #6B7280
- Border: #E5E7EB
- Card: #FFFFFF
- Tab Active: #2563EB
- Tab Inactive: #9CA3AF
- Badge: #EF4444

### Dark Theme
- Background: #121212
- Surface: #18181B
- Primary: #3B82F6
- Text: #F5F5F5
- Muted: #A1A1AA
- Border: #262626
- Card: #18181B
- Tab Active: #3B82F6
- Tab Inactive: #9CA3AF
- Badge: #F97316

### Implementation
- Theme được quản lý thông qua `ThemeProvider` context trong `src/lib/theme.ts`
- Sử dụng `useTheme()` hook để truy cập theme trong components
- Tự động phát hiện chế độ tối/sáng của hệ thống khi khởi động
- Có thể chuyển đổi thủ công trong Settings

## 📦 Dữ liệu

Ứng dụng load dữ liệu từ backend API. Các constants trong `src/constants/data.ts` và `src/constants/defaults.ts` 
chỉ là fallback values (empty arrays) khi API chưa load dữ liệu.

### Cấu trúc dữ liệu

#### Products (Sản phẩm)
- **Endpoint:** `GET /products` hoặc `GET /products/:id`
- **Fallback:** `PRODUCTS` constant (empty array `[]`)
- **Mô tả:** Load từ backend API khi app khởi động hoặc khi cần refresh

#### Categories (Danh mục)
- **Endpoint:** Extract từ products hoặc load từ API
- **Fallback:** `CATEGORIES` constant (empty array `[]`)
- **Mô tả:** Có thể được extract từ danh sách products hoặc load trực tiếp từ API

#### Vouchers (Mã giảm giá)
- **Endpoint:** `GET /vouchers` hoặc `GET /vouchers/user/:userId`
- **Fallback:** `AVAILABLE_VOUCHERS` constant (empty array `[]`)
- **Mô tả:** Load từ backend API khi user xem giỏ hàng hoặc checkout

#### Addresses (Địa chỉ)
- **Endpoint:** Load từ user profile `GET /users/me`
- **Fallback:** `DEFAULT_ADDRESSES` constant (empty array `[]`)
- **Mô tả:** Load từ user profile, có thể thêm/sửa/xóa địa chỉ

#### Orders (Đơn hàng)
- **Endpoint:** `GET /orders` (cho user hiện tại) hoặc `GET /orders/:id`
- **Fallback:** Không có (sử dụng empty array khi chưa load)
- **Mô tả:** Load từ backend API khi user xem lịch sử đơn hàng

### Cấu hình Environment Variables

Tạo file `.env` từ `.env.example` và cấu hình các biến sau:

```env
# API Configuration
API_BASE_URL=http://localhost:3000
API_DEVICE_HOST=10.0.2.2  # Android emulator: 10.0.2.2, iOS simulator: localhost

# Socket.io Configuration (optional, defaults to API_BASE_URL)
SOCKET_URL=http://localhost:3000

# Deep Linking (optional)
APP_LINK_SCHEME=electronicshop
APP_LINK_DOMAIN=electronicshop.app
```

**Lưu ý:**
- Đối với Android emulator, sử dụng `10.0.2.2` thay vì `localhost`
- Đối với iOS simulator, sử dụng `localhost` hoặc IP máy tính của bạn
- Đối với thiết bị thật, sử dụng IP máy tính trên cùng mạng LAN

### Testing với API

Để test ứng dụng, bạn cần:
1. Khởi động backend API (xem hướng dẫn trong `electronics-backend/README.md`)
2. Tạo file `.env` và cấu hình các biến môi trường như trên
3. Chạy ứng dụng và đảm bảo backend API đang hoạt động
4. Dữ liệu sẽ được load từ API thay vì từ mock data
5. Ứng dụng sẽ tự động cache dữ liệu để sử dụng khi offline

## 🔄 State Management

Ứng dụng sử dụng React hooks để quản lý state:

### Global State (App.tsx)
- `cartItems`: Giỏ hàng (CartItem[])
- `wishlist`: Danh sách yêu thích (Product[])
- `orders`: Đơn hàng (Order[])
- `addresses`: Địa chỉ giao hàng (Address[])
- `isLoggedIn`: Trạng thái đăng nhập (boolean)
- `isDarkMode`: Chế độ tối/sáng (boolean)
- `userProfile`: Thông tin người dùng (name, email, avatar)
- `currentTab`: Tab hiện tại trong bottom navigation
- `currentScreen`: Màn hình hiện tại
- `selectedProduct`: Sản phẩm đang được xem chi tiết
- `selectedOrderId`: ID đơn hàng đang được xem chi tiết
- `searchQuery`: Từ khóa tìm kiếm
- `filters`: Bộ lọc sản phẩm (priceRange, categories, rating, onlyInStock)

### Local State
- Mỗi screen component sử dụng `useState` cho state cục bộ
- Theme được quản lý thông qua `ThemeProvider` context

## 🧪 Testing

```bash
npm test
```

Tests được viết bằng Jest và React Test Renderer. File test mẫu có sẵn tại `__tests__/App.test.tsx`.

## ⚠️ Lưu ý quan trọng

### iOS Development
- **Pod Install Deprecation**: React Native khuyến nghị sử dụng `npm run ios` hoặc `yarn ios` thay vì chạy `pod install` trực tiếp. Lệnh này sẽ tự động cài đặt pods khi cần thiết.
- **Hermes Engine**: Có thể có script phase được thêm bởi hermes-engine. Kiểm tra trước khi build.

### Development

#### Backend Integration
Ứng dụng đã được tích hợp đầy đủ với backend API (NestJS + MongoDB):
- **Authentication**: JWT với access token và refresh token
- **OTP Verification**: Xác thực email và reset password
- **CRUD Operations**: Products, Orders, Carts, Users, Reviews, Addresses, Vouchers
- **AI Chat**: Tích hợp với Gemini API
- **Payment**: VNPay gateway cho thanh toán online
- **Image Upload**: Cloudinary cho lưu trữ hình ảnh
- **Push Notifications**: Firebase Cloud Messaging
- **Real-time**: Socket.io cho cập nhật thời gian thực

#### Production Deployment Checklist
Để triển khai production, cần:

1. **Environment Variables**
   - Cấu hình đầy đủ các biến trong `.env`
   - Sử dụng production API URLs
   - Cấu hình Firebase credentials

2. **Backend Setup**
   - Deploy NestJS backend lên server
   - Setup MongoDB database
   - Cấu hình CORS và security headers

3. **Third-party Services**
   - Cloudinary: Cấu hình cloud storage cho images
   - VNPay: Setup payment gateway credentials
   - Firebase: Cấu hình FCM cho push notifications
   - Gemini API: Cấu hình API key cho AI features

4. **Mobile App Build**
   - Android: Tạo release keystore và cấu hình signing
   - iOS: Setup App Store Connect và certificates
   - Cấu hình deep linking cho production domain
   - Test push notifications trên thiết bị thật

5. **Security**
   - Review và harden API endpoints
   - Implement rate limiting
   - Setup SSL/TLS certificates
   - Review và fix security vulnerabilities

## 📝 Scripts có sẵn

- `npm start`: Khởi động Metro bundler (hoặc `react-native start`)
- `npm run android`: Chạy ứng dụng trên Android (hoặc `react-native run-android`)
- `npm run ios`: Chạy ứng dụng trên iOS (hoặc `react-native run-ios`)
- `npm run lint`: Kiểm tra code với ESLint
- `npm test`: Chạy tests với Jest

### Debugging Tips

#### Android
```bash
# Xem logs
adb logcat *:S ReactNative:V ReactNativeJS:V

# Reload app
adb shell input keyevent 82  # Mở dev menu
# Hoặc nhấn R+R trên keyboard khi Metro bundler đang chạy
```

#### iOS
```bash
# Xem logs trong Xcode Console
# Hoặc sử dụng:
npx react-native log-ios

# Reload app
# Nhấn Cmd+R trong simulator
```

#### Metro Bundler
```bash
# Clear cache và restart
npm start -- --reset-cache
```

## 🔍 Tính năng Tìm kiếm & Lọc

### Tìm kiếm (SearchScreen)
- Tìm kiếm sản phẩm theo tên
- Kết hợp với bộ lọc để thu hẹp kết quả
- Hiển thị số lượng kết quả tìm được

### Lọc sản phẩm (FilterScreen)
- **Khoảng giá**: Slider để chọn giá từ - đến (0 - 10,000,000₫)
- **Danh mục**: Multi-select các danh mục sản phẩm
- **Đánh giá**: Lọc theo rating (từ 1-5 sao)
- **Tình trạng tồn kho**: Chỉ hiển thị sản phẩm còn hàng
- Hiển thị số lượng sản phẩm phù hợp với bộ lọc
- Có thể reset về mặc định

## 🛒 Tính năng Giỏ hàng & Thanh toán

### Giỏ hàng
- Thêm sản phẩm từ ProductDetail hoặc Catalog
- Cập nhật số lượng (tối thiểu 1)
- Xóa sản phẩm
- Tính tổng tự động: Subtotal + Shipping Fee (30,000₫)

### Thanh toán (Checkout)
- Chọn địa chỉ giao hàng từ AddressBook
- Chọn phương thức thanh toán (MoMo, COD, ATM/Internet Banking)
- Áp dụng mã giảm giá (voucher)
- Tính toán tổng tiền cuối cùng
- Tạo đơn hàng mới và chuyển đến OrderHistory

## 📋 Quản lý Đơn hàng

### Lịch sử đơn hàng (OrderHistory)
- Hiển thị tất cả đơn hàng với các trạng thái:
  - **Đang xử lý** (processing)
  - **Đang giao** (shipping)
  - **Hoàn thành** (completed)
- Sắp xếp theo thời gian (mới nhất trước)
- Hiển thị tổng tiền và số lượng sản phẩm

### Chi tiết đơn hàng (OrderDetail)
- Thông tin đầy đủ về đơn hàng
- Timeline theo dõi tiến trình:
  - Đặt hàng thành công
  - Đã xác nhận đơn hàng
  - Đang đóng gói
  - Đang giao hàng
  - Giao hàng thành công
- Thông tin địa chỉ giao hàng
- Chi tiết thanh toán (phương thức, subtotal, shipping, discount, total)

## 🎯 Utilities & Helpers

### Format Functions (`src/utils/index.ts`)
- `formatPrice(price: number)`: Format giá tiền theo định dạng Việt Nam (ví dụ: 150000 → "150.000₫")
- `cn(...classes)`: Utility để combine class names (tương tự clsx)

### Address Utilities (`src/utils/address.ts`)
- `buildFullAddress()`: Xây dựng địa chỉ đầy đủ từ các thành phần
- Types: `Address`, `AddressFormValues`, `AddressType`

### Cache Management (`src/utils/cache.ts`)
- `cacheBanners(banners)`: Cache danh sách banners (24 giờ)
- `getCachedBanners()`: Lấy banners từ cache
- `cacheProducts(products)`: Cache danh sách sản phẩm (24 giờ)
- `getCachedProducts()`: Lấy sản phẩm từ cache
- `clearCache()`: Xóa toàn bộ cache

### Network Utilities (`src/utils/network.ts`)
- `useNetworkStatus()`: Hook để theo dõi trạng thái mạng
- `getCurrentNetworkStatus()`: Lấy trạng thái mạng hiện tại
- Tự động phát hiện khi mất kết nối và hiển thị offline banner

### Search History (`src/utils/searchHistory.ts`)
- Lưu lịch sử tìm kiếm local với AsyncStorage
- Đồng bộ với backend API khi user đăng nhập
- Tự động migrate lịch sử từ guest sang user khi đăng nhập
- Giới hạn tối đa 20 mục trong lịch sử

### Product Utilities (`src/utils/product.ts`)
- `extractCategoriesFromProducts()`: Trích xuất danh mục từ danh sách sản phẩm
- Các hàm helper để xử lý và filter sản phẩm

### Data Mappers (`src/utils/mappers.ts`)
- Chuyển đổi dữ liệu từ API format sang app format
- Map các object từ backend sang frontend models

## 📱 Native Platform Support

### Android
- Minimum SDK: Được cấu hình trong `android/app/build.gradle`
- Build tool: Gradle
- Keystore: Có sẵn debug keystore tại `android/app/debug.keystore`

### iOS
- Minimum iOS version: Được cấu hình trong `ios/ElectronicsShop/Info.plist`
- Build tool: Xcode với CocoaPods
- Pods: 84 dependencies từ Podfile, 83 pods được cài đặt
- Hermes Engine: Được sử dụng cho JavaScript engine

## 🌐 Internationalization (i18n)

Ứng dụng hỗ trợ đa ngôn ngữ với i18next:

### Ngôn ngữ được hỗ trợ
- **Tiếng Việt** (vi) - Mặc định
- **English** (en)

### Cấu hình
- File ngôn ngữ được lưu trong `src/i18n/locales/`
- Ngôn ngữ được lưu trong AsyncStorage và tự động load khi app khởi động
- Có thể thay đổi ngôn ngữ trong Settings → Language Selection

### Sử dụng trong code
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('welcome')}</Text>;
}
```

## 📡 Real-time Features

### Socket.io Integration
- Kết nối tự động khi app khởi động
- Hỗ trợ cả polling và websocket transports
- Tự động fallback khi websocket không khả dụng
- Sử dụng cho:
  - Real-time order updates
  - Live notifications
  - Chat với AI (nếu backend hỗ trợ)

### Firebase Cloud Messaging (FCM)
- Push notifications cho Android và iOS
- Tự động đăng ký token khi user đăng nhập
- Xử lý notifications khi app đang mở hoặc đóng
- Deep linking từ notifications

## 💾 Offline Support

Ứng dụng hỗ trợ offline mode với các tính năng:

### Cache Strategy
- **Banners**: Cache 24 giờ, tự động refresh khi online
- **Products**: Cache 24 giờ, có thể xem khi offline
- **Search History**: Lưu local, sync khi online

### Offline Indicators
- Hiển thị banner khi mất kết nối
- Tự động retry khi kết nối được khôi phục
- Sử dụng cached data khi không có internet

## 🔗 Deep Linking

Ứng dụng hỗ trợ deep linking để:
- Mở trực tiếp đến sản phẩm cụ thể
- Điều hướng đến đơn hàng từ notifications
- Chia sẻ link sản phẩm với người dùng khác

Cấu hình trong `.env`:
```env
APP_LINK_SCHEME=electronicshop
APP_LINK_DOMAIN=electronicshop.app
```

## 🌐 Web Version (Optional)

Dự án có thể bao gồm một phiên bản web trong thư mục `ElectroAI_App_Development` (nếu có):
- **Framework**: React + Vite
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

Để chạy web version (nếu có):

```bash
cd ElectroAI_App_Development
npm install
npm run dev
```

## 📄 License

Private project - All rights reserved

## 👥 Đóng góp

Dự án này được phát triển như một phần của khóa học Mobile Development.

## 🔧 Troubleshooting

### Common Issues

#### Metro Bundler không khởi động
```bash
# Clear cache và restart
npm start -- --reset-cache
# Hoặc
watchman watch-del-all  # Nếu có cài watchman
```

#### iOS Build Errors
```bash
# Clean và reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### Android Build Errors
```bash
# Clean gradle cache
cd android
./gradlew clean
cd ..
```

#### Network Connection Issues
- **Android Emulator**: Đảm bảo sử dụng `10.0.2.2` thay vì `localhost` trong `.env`
- **iOS Simulator**: Sử dụng `localhost` hoặc IP máy tính của bạn
- **Physical Device**: Sử dụng IP máy tính trên cùng mạng LAN

#### Module Not Found Errors
```bash
# Reinstall node_modules
rm -rf node_modules
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server trong IDE
# Hoặc check tsconfig.json configuration
```

### Performance Tips

1. **Enable Hermes**: Đã được enable mặc định trong React Native 0.83+
2. **Image Optimization**: Sử dụng `ImageWithFallback` component để optimize images
3. **Cache Management**: Cache được tự động quản lý, có thể clear cache trong Settings nếu cần
4. **Network Requests**: Sử dụng cache để giảm số lượng API calls

## 📚 Tài liệu tham khảo

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [i18next Documentation](https://www.i18next.com/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)

## 📞 Liên hệ

Để biết thêm thông tin về dự án, vui lòng liên hệ qua Support Center trong ứng dụng.

## 📄 License

Private project - All rights reserved

---
*Last updated: 2024*
