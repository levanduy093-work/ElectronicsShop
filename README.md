# ElectroAI - Ứng dụng Mua Sắm Linh Kiện Điện Tử & Trợ Lý AI

## 📱 Tổng quan (Overview)

**ElectroAI** là nền tảng thương mại điện tử thế hệ mới dành riêng cho lĩnh vực linh kiện điện tử, được tích hợp sâu Trí tuệ nhân tạo (AI) để hỗ trợ kỹ sư, sinh viên và người đam mê công nghệ.

Khác với các ứng dụng mua sắm thông thường, ElectroAI sở hữu một **"Kỹ sư AI" ảo**, có khả năng tư vấn kỹ thuật, phân tích sơ đồ mạch qua hình ảnh và tự động đề xuất linh kiện phù hợp, giúp rút ngắn thời gian từ ý tưởng đến thực thi.

## ✨ Tính năng Nổi bật (Key Features)

### 1. 🤖 Trợ lý Kỹ thuật AI (AI Engineer Assistant)
Đây là "trái tim" của ứng dụng, mang lại trải nghiệm vượt trội:
- **Tư vấn thông minh**: Chat bot hiểu ngữ cảnh kỹ thuật, giúp giải đáp thắc mắc về datasheet, thông số linh kiện.
- **Phân tích hình ảnh (Vision)**: Upload ảnh sơ đồ mạch hoặc bo mạch thực tế, AI sẽ nhận diện các linh kiện và đề xuất danh sách mua hàng tương ứng.
- **Thẻ sản phẩm trong Chat**: AI trả về trực tiếp các Product Card tương tác được, cho phép xem nhanh giá, tồn kho và thêm vào giỏ ngay trong cuộc hội thoại.
- **Hành động tự động**: AI có thể thực hiện "Add to Cart" (Thêm vào giỏ) thay người dùng sau khi được xác nhận.

### 2. 🔐 Xác thực & Bảo mật (Authentication)
Hệ thống tài khoản bảo mật cao:
- **Đăng ký/Đăng nhập**: Hỗ trợ đăng ký tài khoản mới với quy trình xác thực OTP qua Email (SendGrid/SMTP).
- **Quản lý mật khẩu**: Tính năng "Quên mật khẩu" và "Đổi mật khẩu" an toàn với mã xác minh OTP.
- **Token Management**: Cơ chế tự động làm mới phiên đăng nhập (Refresh Token) giúp trải nghiệm người dùng không bị gián đoạn.
- **Khóa Ứng dụng (Biometric Lock)**: Bảo vệ quyền riêng tư bằng Face ID / Touch ID mỗi khi mở app hoặc quay lại từ nền (Background). Kích hoạt trong phần Cài đặt.

### 3. 🛍️ Trải nghiệm Mua sắm (Shopping Experience)
- **Danh mục đa dạng**: Hệ thống phân loại thông minh (Vi điều khiển, Cảm biến, IC, Dây cáp, v.v...) với khả năng tự động chuẩn hóa tên gọi.
- **Tìm kiếm nâng cao**:
  - Hỗ trợ tìm kiếm mờ (Fuzzy Search) thông minh.
  - **Lịch sử tìm kiếm**: Lưu lại các từ khóa đã tìm giúp truy cập nhanh.
- **Bộ lọc chuyên sâu (Filter)**: Lọc sản phẩm theo khoảng giá, đánh giá (sao), tình trạng tồn kho và danh mục.
- **Chi tiết sản phẩm**:
  - Thông số kỹ thuật (Specs) chi tiết.
  - Xem Datasheet sản phẩm.
  - **Sản phẩm liên quan**: Gợi ý các sản phẩm bổ trợ.
  - **Đánh giá & Bình luận**: Xem và viết đánh giá, hỗ trợ đính kèm hình ảnh thực tế sản phẩm.

### 4. ❤️ Tiện ích Cá nhân (User Utilities)
- **Danh sách yêu thích (Wishlist)**: Lưu lại các linh kiện quan tâm để mua sau.
- **Sổ địa chỉ**: Quản lý nhiều địa chỉ giao hàng, dễ dàng chuyển đổi địa chỉ mặc định.
- **Ví Voucher**: Lưu trữ và áp dụng mã giảm giá.
- **Trung tâm hỗ trợ (Support Center)**: Kênh hỗ trợ khách hàng tích hợp sẵn.

### 5. 🛒 Giỏ hàng & Thanh toán (Checkout)
Quy trình "Checkout" 3 bước tối ưu hóa tỷ lệ chuyển đổi:
- **Giỏ hàng**: Tự động đồng bộ giỏ hàng giữa các thiết bị (nếu đăng nhập).
- **Vận chuyển & Voucher**: Chọn phương thức vận chuyển và áp mã giảm giá trực quan.
- **Thanh toán đa kênh**:
  - **COD**: Thanh toán khi nhận hàng.
  - **VNPAY**: Tích hợp cổng thanh toán VNPAY an toàn, hỗ trợ quét QR, thẻ ATM/Visa nội địa và quốc tế.

### 6. 📦 Quản lý Đơn hàng (Order Management)
- **Theo dõi thời gian thực (Real-time Tracking)**: Cập nhật trạng thái đơn hàng (Mới đặt, Đang xử lý, Đang giao, Thành công) ngay lập tức qua Socket.io.
- **Lịch sử chi tiết**: Xem lại đầy đủ thông tin đơn hàng cũ, bao gồm cả timeline xử lý.

### 7. 🔔 Thông báo & Đa ngôn ngữ
- **Push Notifications**: Thông báo đẩy qua Firebase Cloud Messaging (FCM) về trạng thái đơn hàng, khuyến mãi mới.
- **Đa ngôn ngữ (i18n)**: Chuyển đổi linh hoạt giữa Tiếng Việt và Tiếng Anh.
- **Giao diện**: Hỗ trợ Dark Mode / Light Mode.

---

## ⚡ Hiệu suất & Tối ưu hóa (Performance) (New Update)
Ứng dụng đã được tối ưu hóa sâu để đạt tốc độ khởi động "Zero-Wait" (tức thì):

### 1. Zero-Wait Startup
- Loại bỏ hoàn toàn màn hình chờ (Splash Loading).
- App hiển thị ngay lập tức màn hình Home với dữ liệu mặc định/cache, sau đó cập nhật ngầm (Background Update).

### 2. Parallel Data Loading
- Sử dụng `Promise.all` để tải song song 5 luồng dữ liệu quan trọng (Auth, Cart, Theme, Onboarding, Push Settings) thay vì tuần tự.
- Giảm thời gian khôi phục trạng thái xuống mức mili-giây.

### 3. Strict Cache Strategy
- Cơ chế **Cache-First**: Luôn ưu tiên hiển thị dữ liệu sản phẩm từ bộ nhớ đệm (AsyncStorage) trong lần mở đầu tiên.
- **Background Fetch**: Dữ liệu mới nhất sẽ được tải ngầm và cập nhật UI mượt mà không gây gián đoạn.

### 4. Code Splitting & Lazy Loading
- Áp dụng `React.lazy` và `Suspense` để chia nhỏ bundle.
- Chỉ tải các module cần thiết (Home) khi khởi động. Các màn hình phụ (Cart, Profile, Settings...) chỉ được tải vào bộ nhớ khi người dùng thực sự truy cập.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Mobile App (Client)
- **Framework**: React Native 0.83.1
- **Ngôn ngữ**: TypeScript 5.8
- **State & Logic**: React Hooks, Context API.
- **UI Kit**: Custom Design System, `react-native-vector-icons`, `react-native-svg`.
- **Navigation**: React Navigation (Stack/Tab).

### Kết nối & Tích hợp
- **Real-time**: Socket.io Client.
- **API**: RESTful API (Axios/Fetch).
- **Notification**: Firebase Cloud Messaging (FCM).
- **Storage**: AsyncStorage (Lưu cache, token, settings).
- **Payment**: VNPAY SDK/Webview integration.
- **AI Integration**: Kết nối tới module AI Backend xử lý NLP và Vision.

---

## 📂 Cấu trúc Dự án (Project Structure)

Dự án được tổ chức theo cấu trúc module hóa, giúp dễ dàng mở rộng và bảo trì:

```
src/
├── assets/          # Tài nguyên tĩnh (images, fonts, animations)
├── components/      # Các component tái sử dụng, chia theo chức năng (auth, cart, product...)
│   ├── ai/          # Components liên quan đến AI (Chat bubble, AI products)
│   ├── common/      # Components chung (Button, Input, Header...)
│   └── ...
├── constants/       # Các hằng số, config chung
├── hooks/           # Custom React Hooks
├── i18n/            # Cấu hình đa ngôn ngữ (locales)
├── screens/         # Các màn hình chính của ứng dụng
├── services/        # Xử lý API, storage, socket, authentication
├── theme/           # Cấu hình giao diện (Colors, Fonts, Metrics)
├── types/           # Định nghĩa TypeScript Types & Interfaces
└── utils/           # Các hàm tiện ích bổ trợ
```

---

## 📜 Các Scripts có sẵn

Trong thư mục dự án, bạn có thể chạy các lệnh sau:

### `npm start`
Khởi chạy Metro Bundler để phục vụ ứng dụng cho máy ảo hoặc thiết bị thật.

### `npm run android`
Build và chạy ứng dụng trên Android Emulator hoặc thiết bị kết nối qua USB.

### `npm run ios`
Build và chạy ứng dụng trên iOS Simulator (chỉ trên macOS).

### `npm run lint`
Kiểm tra lỗi cú pháp và style code bằng ESLint.

### `npm test`
Chạy bộ kiểm thử unit test với Jest.

---

## �🚀 Cài đặt và chạy ứng dụng

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
pod install
cd ..
```

**Lưu ý**: React Native khuyến nghị sử dụng `npm run ios` hoặc `yarn ios` thay vì chạy `pod install` trực tiếp. Lệnh này sẽ tự động cài đặt pods khi cần thiết.

### 4. Chạy ứng dụng

#### Android
**Lưu ý**: Cần thêm file google-services.json từ firebase vào ElectronicsShop/android/app/ để thực hiện được chức năng gửi thông báo và tránh lỗi khi build.

```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy Android app
npm run android
```

#### iOS (chỉ trên macOS)
**Lưu ý**: Cần thêm file GoogleService-Info.plist từ firebase vào ElectronicsShop/ios/ để build không phát sinh lỗi, hiện dự án được phát triển bởi tài khoản Apple Personal Developer nên chưa cấu hình được thông báo đẩy trên ios, chỉ mới chạy được trên android.

```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy iOS app
npm run ios
```

---

## 📞 Liên hệ & Hỗ trợ

Để nhận file cấu hình môi trường **`.env`** (chứa API Keys, Firebase Config, Payment Gateway credentials) để chạy thử nghiệm đầy đủ các tính năng của dự án, vui lòng liên hệ:

- **Zalo**: 0827733475
- **Email**: levanduy.work@gmail.com

---
© 2026 ElectroAI Project.
