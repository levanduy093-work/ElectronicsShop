# ElectroAI - Ứng dụng Mua Sắm Linh Kiện Điện Tử

## 📱 Tổng quan

ElectroAI là một ứng dụng di động React Native hiện đại chuyên biệt cho việc mua sắm và quản lý linh kiện điện tử. Ứng dụng kết hợp trải nghiệm thương mại điện tử mượt mà với sức mạnh của trí tuệ nhân tạo (AI) để hỗ trợ kỹ sư và người yêu thích điện tử trong việc lựa chọn linh kiện và phân tích mạch điện.

## ✨ Chức năng chi tiết

### 1. Trợ lý ảo AI (AI Engineer)
Tính năng nổi bật nhất của ứng dụng, giúp người dùng tương tác thông minh:
- **Chat tư vấn trực tiếp**: Trò chuyện với AI để tìm kiếm linh kiện, hỏi đáp về kỹ thuật.
- **Phân tích hình ảnh**: Hỗ trợ upload ảnh (sơ đồ mạch, linh kiện) từ thư viện để AI phân tích.
- **Tương tác ngữ cảnh**: AI có thể trả về các "thẻ sản phẩm" (Product Cards) cho phép người dùng xem chi tiết hoặc thêm vào giỏ hàng ngay trong khung chat.
- **Hành động tự động**: Hỗ trợ các tác vụ như thêm vào giỏ hàng tự động thông qua xác nhận với AI.

### 2. Mua sắm & Danh mục sản phẩm
- **Catalog thông minh**:
  - Hiển thị sản phẩm dạng lưới (Grid).
  - **Bộ lọc đa dạng**: Lọc theo danh mục (Vi điều khiển, Cảm biến, IC số, v.v.), khoảng giá, đánh giá (rating) và tình trạng tồn kho.
  - **Tìm kiếm**: Tìm kiếm sản phẩm theo tên với từ khóa.
  - **Danh mục tự động**: Hệ thống tự động chuẩn hóa các tên danh mục khác nhau về chuẩn chung.
- **Chi tiết sản phẩm**: Xem thông tin chi tiết, hình ảnh, giá bán và các thông số kỹ thuật.

### 3. Giỏ hàng & Thanh toán (Checkout)
Quy trình thanh toán được thiết kế tối ưu qua 3 bước:
- **Bước 1: Địa chỉ**: Chọn địa chỉ giao hàng từ sổ địa chỉ hoặc thêm mới.
- **Bước 2: Vận chuyển**: Tùy chọn phương thức vận chuyển (Nhanh/Tiêu chuẩn) với mức phí rõ ràng.
- **Bước 3: Thanh toán**:
  - **VNPAY**: Tích hợp cổng thanh toán VNPAY, mở trực tiếp ứng dụng ngân hàng hoặc web để thanh toán, tự động kiểm tra trạng thái giao dịch.
  - **COD**: Thanh toán khi nhận hàng.
- **Mã giảm giá (Voucher)**: Áp dụng voucher giảm giá trực tiếp hoặc miễn phí vận chuyển.

### 4. Quản lý Đơn hàng
- **Lịch sử đơn hàng**: Theo dõi danh sách đơn hàng với trạng thái chi tiết (Đang xử lý, Đang giao, Hoàn thành, Đã hủy).
- **Trạng thái trực quan**: Hiển thị trạng thái đơn hàng với màu sắc và badge tương ứng (ví dụ: Đang giao hàng - màu xanh, Đã hủy - màu đỏ).
- **Chi tiết đơn hàng**: Xem lại thông tin sản phẩm, tổng tiền, phí vận chuyển và phương thức thanh toán của từng đơn hàng.

### 5. Tài khoản & Cá nhân hóa
- **Hồ sơ người dùng**: Quản lý thông tin cá nhân, cập nhật ảnh đại diện (Avatar).
- **Sổ địa chỉ**: Lưu trữ và quản lý nhiều địa chỉ giao hàng, thiết lập địa chỉ mặc định.
- **Ví Voucher**: Xem và quản lý danh sách mã giảm giá cá nhân.
- **Thống kê**: Xem nhanh số lượng đơn hàng đã đặt và số voucher đang có.

### 6. Tính năng khác
- **Đa ngôn ngữ**: Hỗ trợ chuyển đổi ngôn ngữ (Tiếng Việt/Tiếng Anh) sử dụng `i18next`.
- **Giao diện**: Hỗ trợ Dark Mode/Light Mode tùy theo cài đặt hệ thống hoặc người dùng.
- **Thông báo**: Tích hợp Firebase Cloud Messaging để nhận thông báo về đơn hàng và khuyến mãi.
- **Real-time**: Sử dụng Socket.io để cập nhật trạng thái đơn hàng thời gian thực.

## 🛠️ Công nghệ sử dụng

### Core
- **React Native**: 0.83.1
- **React**: 19.2.0
- **TypeScript**: 5.8.3
- **Node.js**: >= 20

### Libraries chính
- **UI/UX**: `react-native-vector-icons`, `react-native-svg`, `react-native-safe-area-context`, `react-native-community/slider`.
- **Networking & Data**: `socket.io-client` (Real-time), `react-native-firebase` (Push Notification), `@react-native-async-storage/async-storage` (Local Storage).
- **Media**: `react-native-image-picker` (Upload ảnh).
- **Payment**: Tích hợp VNPAY.

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
**Lưu ý**: Cần thêm file GoogleService-Info.plis từ firebase vào ElectronicsShop/ios/ để build không phát sinh lỗi, hiện dự án được phát triển bởi tài khoản Apple Personal Developer nên chưa cấu hình được thông báo đẩy trên ios, chỉ mới chạy được trên android.

```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy iOS app
npm run ios
```

## 📞 Liên hệ & Hỗ trợ

Để nhận file cấu hình môi trường **`.env`** (chứa API Keys, Firebase Config, Payment Gateway credentials) để chạy thử nghiệm đầy đủ các tính năng của dự án, vui lòng liên hệ:

- **Zalo**: 0827733475
- **Email**: levanduy.work@gmail.com

---
© 2024 ElectroAI Project.
