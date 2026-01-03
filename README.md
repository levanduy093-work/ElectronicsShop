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
│   │   ├── ai/              # Component AI chat
│   │   ├── common/          # Component chung (Icon, ImageWithFallback)
│   │   ├── layout/          # Layout components (TopBar, BottomNav)
│   │   └── ui/              # UI components (ProductCard)
│   ├── lib/                 # Utilities và data
│   │   ├── address.ts       # Quản lý địa chỉ
│   │   ├── data.ts          # Dữ liệu mock (sản phẩm, danh mục, đơn hàng)
│   │   ├── theme.ts         # Theme system (dark/light mode)
│   │   └── utils.ts         # Utility functions
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
- **Full Screen Screens**: Các màn hình như ProductDetail, Checkout, OrderDetail
- **Modal Screens**: Filter, Search, Settings, etc.

## 🛠️ Công nghệ sử dụng

### Core
- **React Native**: 0.83.1
- **React**: 19.2.0
- **TypeScript**: 5.8.3

### Dependencies chính
- **react-native-safe-area-context**: Quản lý safe area cho các thiết bị
- **react-native-vector-icons**: Icons (MaterialCommunityIcons)
- **react-native-svg**: Render SVG graphics
- **react-native-image-picker**: Chọn và upload hình ảnh
- **@react-native-community/slider**: Slider component

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Metro**: JavaScript bundler

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
- Hiển thị tất cả sản phẩm
- Lọc theo danh mục
- Grid layout với ProductCard

### 3. AI Chat
- Giao diện chat với AI
- Gợi ý câu hỏi nhanh
- Hỗ trợ upload hình ảnh/PDF để scan sơ đồ mạch

### 4. Giỏ hàng (Cart)
- Danh sách sản phẩm đã thêm
- Cập nhật số lượng
- Xóa sản phẩm
- Tính tổng tiền và phí vận chuyển

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

Ứng dụng hỗ trợ Dark Mode và Light Mode:

### Light Theme
- Background: #F5F7FA
- Surface: #FFFFFF
- Primary: #2563EB
- Text: #111827

### Dark Theme
- Background: #121212
- Surface: #18181B
- Primary: #3B82F6
- Text: #F5F5F5

Theme được quản lý thông qua `ThemeProvider` và `useTheme` hook.

## 📦 Dữ liệu Mock

Ứng dụng sử dụng dữ liệu mock trong `src/lib/data.ts`:

- **PRODUCTS**: Danh sách sản phẩm mẫu (Arduino, ESP32, Raspberry Pi, etc.)
- **CATEGORIES**: 6 danh mục chính
- **AVAILABLE_VOUCHERS**: Các mã giảm giá
- **MOCK_CHATS**: Tin nhắn chat mẫu
- **DEFAULT_ADDRESSES**: Địa chỉ mẫu

## 🔄 State Management

Ứng dụng sử dụng React hooks để quản lý state:
- `useState` cho local state
- State được nâng lên App.tsx cho các state global:
  - `cartItems`: Giỏ hàng
  - `wishlist`: Danh sách yêu thích
  - `orders`: Đơn hàng
  - `addresses`: Địa chỉ giao hàng
  - `isLoggedIn`: Trạng thái đăng nhập
  - `isDarkMode`: Chế độ tối/sáng

## 🧪 Testing

```bash
npm test
```

Tests được viết bằng Jest và React Test Renderer.

## 📝 Scripts có sẵn

- `npm start`: Khởi động Metro bundler
- `npm run android`: Chạy ứng dụng trên Android
- `npm run ios`: Chạy ứng dụng trên iOS
- `npm run lint`: Kiểm tra code với ESLint
- `npm test`: Chạy tests

## 🌐 Web Version

Dự án cũng bao gồm một phiên bản web trong thư mục `ElectroAI_App_Development`:
- **Framework**: React + Vite
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

Để chạy web version:

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

**Lưu ý**: Đây là một ứng dụng demo với dữ liệu mock. Để triển khai production, cần tích hợp với backend API thực tế.
