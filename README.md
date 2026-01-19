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
- **Thông báo**: Xem các thông báo từ hệ thống
- **Trung tâm hỗ trợ**: Liên hệ và nhận hỗ trợ từ đội ngũ
- **Đổi mật khẩu**: Thay đổi mật khẩu tài khoản

## 🏗️ Kiến trúc dự án

### Cấu trúc thư mục

```
ElectronicsShop/
├── src/
│   ├── components/          # Các component tái sử dụng
│   │   ├── address/         # Form quản lý địa chỉ
│   │   │   └── AddressForm.tsx
│   │   ├── ai/              # Component AI chat
│   │   │   └── MessageBubble.tsx
│   │   ├── common/          # Component chung
│   │   │   ├── Icon.tsx              # Icon wrapper cho react-native-vector-icons
│   │   │   ├── ImageWithFallback.tsx # Image component với fallback
│   │   │   ├── Toast.tsx              # Toast notification component
│   │   │   └── ToastProvider.tsx     # Toast context provider
│   │   ├── layout/          # Layout components
│   │   │   ├── TopBar.tsx    # Top navigation bar với search và filter
│   │   │   └── BottomNav.tsx # Bottom navigation với 5 tabs
│   │   └── ui/              # UI components
│   │       └── ProductCard.tsx # Card hiển thị sản phẩm
│   ├── lib/                 # Utilities và data
│   │   ├── address.ts       # Types và utilities cho địa chỉ
│   │   ├── data.ts          # Dữ liệu mock (sản phẩm, danh mục, vouchers, orders)
│   │   ├── theme.ts         # Theme system (dark/light mode) với Context API
│   │   └── utils.ts         # Utility functions (formatPrice, cn)
│   └── screens/             # Các màn hình chính
│       ├── Home.tsx         # Trang chủ
│       ├── Catalog.tsx      # Danh mục sản phẩm
│       ├── ProductDetail.tsx # Chi tiết sản phẩm
│       ├── Cart.tsx         # Giỏ hàng
│       ├── Checkout.tsx     # Thanh toán
│       ├── AIChat.tsx       # Chat với AI
│       ├── Profile.tsx       # Hồ sơ người dùng
│       ├── OrderHistory.tsx # Lịch sử đơn hàng
│       ├── OrderDetail.tsx  # Chi tiết đơn hàng
│       ├── Wishlist.tsx     # Danh sách yêu thích
│       ├── AddressBook.tsx  # Sổ địa chỉ
│       ├── PaymentMethods.tsx # Phương thức thanh toán
│       ├── Settings.tsx     # Cài đặt
│       ├── SearchScreen.tsx # Tìm kiếm
│       ├── FilterScreen.tsx # Lọc sản phẩm
│       ├── Auth.tsx         # Đăng nhập/Đăng ký
│       ├── Notifications.tsx # Thông báo
│       ├── SupportCenter.tsx # Trung tâm hỗ trợ
│       └── ChangePassword.tsx # Đổi mật khẩu
├── android/                 # Native Android code
├── ios/                     # Native iOS code
├── App.tsx                  # Entry point của ứng dụng
├── package.json             # Dependencies và scripts
└── ElectroAI_App_Development/ # Web version (React + Vite)
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
- **react-native-safe-area-context** (^5.5.2): Quản lý safe area cho các thiết bị
- **react-native-vector-icons** (^10.3.0): Icons (MaterialCommunityIcons)
- **react-native-svg** (^15.15.1): Render SVG graphics
- **react-native-image-picker** (^8.2.1): Chọn và upload hình ảnh
- **@react-native-community/slider** (^5.1.1): Slider component cho filter giá

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

### Testing với API

Để test ứng dụng, bạn cần:
1. Khởi động backend API (xem hướng dẫn trong `electronics-backend/README.md`)
2. Cấu hình API endpoint trong `.env` file:
   ```
   API_URL=http://localhost:3000
   ```
3. Chạy ứng dụng và đảm bảo backend API đang hoạt động
4. Dữ liệu sẽ được load từ API thay vì từ mock data

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
- Ứng dụng đã được tích hợp đầy đủ với backend API (NestJS + MongoDB)
- Tất cả các tính năng chính đã được kết nối với backend:
  - Authentication với JWT (access token + refresh token)
  - OTP verification cho đăng ký và reset password
  - CRUD đầy đủ cho Products, Orders, Carts, Users, Reviews
  - AI Chat integration với Gemini API
  - Payment gateway (VNPay)
  - Image upload với Cloudinary
  - Firebase Cloud Messaging (FCM) cho notifications
  - Socket.io cho real-time features
- Để triển khai production, cần:
  - Cấu hình environment variables đầy đủ
  - Setup MongoDB database
  - Cấu hình Cloudinary cho image storage
  - Cấu hình VNPay cho payment gateway
  - Cấu hình Firebase cho push notifications
  - Cấu hình Gemini API cho AI features

## 📝 Scripts có sẵn

- `npm start`: Khởi động Metro bundler (hoặc `react-native start`)
- `npm run android`: Chạy ứng dụng trên Android (hoặc `react-native run-android`)
- `npm run ios`: Chạy ứng dụng trên iOS (hoặc `react-native run-ios`)
- `npm run lint`: Kiểm tra code với ESLint
- `npm test`: Chạy tests với Jest

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

### Format Functions (`src/lib/utils.ts`)
- `formatPrice(price: number)`: Format giá tiền theo định dạng Việt Nam (ví dụ: 150000 → "150.000₫")
- `cn(...classes)`: Utility để combine class names (tương tự clsx)

### Address Utilities (`src/lib/address.ts`)
- `buildFullAddress()`: Xây dựng địa chỉ đầy đủ từ các thành phần
- Types: `Address`, `AddressFormValues`, `AddressType`

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

## 📞 Liên hệ

Để biết thêm thông tin về dự án, vui lòng liên hệ qua Support Center trong ứng dụng.

---
