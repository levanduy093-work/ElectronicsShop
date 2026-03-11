# ElectronicsShop Mobile App

Ứng dụng mobile cho khách hàng của hệ thống ElectronicsShop. Đây là client chính để duyệt sản phẩm, đặt hàng, thanh toán và nhận thông báo realtime.

## Tổng quan kiến trúc
- React Native + React Navigation (stack + tab + custom animated tab bar)
- State: Context Providers (auth, cart, orders, notifications, AI chat)
- Data fetching: TanStack Query
- Realtime: Socket.IO
- Push: Firebase Cloud Messaging
- UI: NativeWind + custom theme

## Cấu trúc thư mục (tóm tắt)
- `src/screens` các màn hình chính
- `src/components` UI components
- `src/navigation` stack/tab, layout, animated tab bar
- `src/context` state quản lý app
- `src/services` API, socket, FCM
- `src/utils` helpers
- `src/theme` theme tokens

## Cấu hình môi trường
Tạo `.env` trong thư mục này:

```env
API_BASE_URL=http://localhost:3000
# Dành cho thiết bị thật: dùng IP LAN của máy chạy backend
API_DEVICE_HOST=http://192.168.1.15:3000
APP_LINK_DOMAIN=electronicsshop.app
APP_LINK_SCHEME=electronicsshop
```

## Cài đặt
```bash
npm install
```

## Chạy ứng dụng
```bash
npm run start

# Android
npm run android

# iOS
npm run ios
```

## Flow tổng thể (App)
```mermaid
flowchart TD
  A[App Start] --> B[Check Onboarding in AsyncStorage]
  B -->|Chưa xem| C[Onboarding]
  C -->|Skip/Login| D[Auth Screen]
  C -->|Done| E[Main Tabs]
  B -->|Đã xem| E
  D -->|Login/Register Success| E
  E --> F[Home/Catalog/AI/Cart/Profile]
```

## Flow điều hướng chính
```mermaid
flowchart LR
  T[Main Tabs] --> H[Home]
  T --> C[Catalog]
  T --> AI[AI Chat]
  T --> CA[Cart]
  T --> P[Profile]

  H --> PD[Product Detail]
  C --> PD
  PD --> CA
  P --> AH[Order History]
  AH --> OD[Order Detail]
  CA --> CO[Checkout]
  CO --> OD
```

## Flow đặt hàng + thanh toán
```mermaid
flowchart TD
  CA[Cart] --> CO[Checkout]
  CO --> V{Payment Method}
  V -->|COD| O1[POST /orders]
  V -->|VNPAY| P1[POST /payments/vnpay]
  P1 --> P2[Redirect to VNPAY]
  P2 --> P3[Return to /payments/vnpay/return]
  P3 --> DL[Deep Link electronicsshop://payment/return]
  O1 --> OD[Order Detail]
  DL --> OD
```

## Flow thông báo (Mobile)
```mermaid
flowchart TD
  A1[FCM Token] --> A2[POST /users/me/fcm-token]
  A3[Admin sends notification] --> B1[Backend pushes FCM]
  B1 --> B2[Mobile receives]
  B2 --> B3[Foreground Toast + Notification Screen]
  B3 --> B4[Mark read -> PATCH /notifications/:id/read]
```

## Liên kết hệ thống
- Backend API: cung cấp dữ liệu sản phẩm, đơn hàng, thanh toán, AI chat
- Admin Web: cập nhật sản phẩm, đơn hàng, banner, notification

## Lưu ý triển khai
- Android emulator gọi backend local: dùng `10.0.2.2` hoặc cấu hình `API_DEVICE_HOST`.
- Sau thay đổi native module: clean & rebuild app.

## Liên quan
- Tổng quan hệ thống: `/Users/levanduy/Nam4/HK2/Mobile/ElectroAI/readme.md`
- Backend: `/Users/levanduy/Nam4/HK2/Mobile/ElectroAI/electronics-backend/README.md`
- Admin: `/Users/levanduy/Nam4/HK2/Mobile/ElectroAI/electronics-admin/README.md`
