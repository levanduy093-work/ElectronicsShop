# Database Schema (MongoDB) — ElectroAI Mobile

Mục tiêu: bám sát các màn hình hiện có (mua sắm, thanh toán, voucher, wishlist, thông báo, AI chat, hỗ trợ) và khắc phục thiếu sót của bản schema ban đầu (bảo mật thanh toán, voucher riêng, tracking đơn hàng, wishlist/notifications, chat message types).

## Collections đề xuất

### users
- `_id` objectId
- `name` string
- `email` string **unique**
- `passwordHash` string
- `avatar` string (URL)
- `role` enum: customer | admin
- `phone` string
- `emailVerified` bool
- `provider` enum: password | google | apple
- `preferences` object { `theme`: light|dark, `notifications`: bool }
- `createdAt` date, `updatedAt` date

### addresses
- `_id` objectId
- `userId` objectId (ref users)
- `name` string
- `phone` string
- `addressLine` string
- `ward` string
- `district` string
- `city` string
- `type` enum: home | office
- `isDefault` bool
- `createdAt` date, `updatedAt` date

### payment_methods
- `_id` objectId
- `userId` objectId (ref users)
- `type` enum: card | wallet | cod
- `provider` string (e.g., momo, zalopay, visa, mastercard)
- `token` string (được vault/từ cổng thanh toán, không lưu thô)
- `brand` string, `last4` string, `expiryMonth` int, `expiryYear` int
- `isDefault` bool
- `createdAt` date, `updatedAt` date

### categories
- `_id` objectId
- `name` string
- `slug` string
- `icon` string (trùng icon RN)
- `type` enum: active | passive | tools | other
- `createdAt` date, `updatedAt` date

### products
- `_id` objectId
- `name` string
- `categoryId` objectId (ref categories)
- `brand` string
- `description` string
- `images` string[]
- `specs` array<{ `key`: string, `value`: string }> // linh hoạt hơn các trường cố định
- `price` object { `original`: int, `sale`: int, `currency`: string, `saleStart` date?, `saleEnd` date? }
- `stock` object { `quantity`: int, `status`: enum in_stock | low | out }
- `tags` string[]
- `averageRating` decimal, `reviewCount` int, `saleCount` int
- `datasheet` string (URL)
- `code` string (SKU)
- `createdAt` date, `updatedAt` date

### vouchers
- `code` string **unique**
- `description` string
- `type` enum: fixed | percent | shipping
- `discountValue` int (đ hoặc %, tùy theo type)
- `minTotal` int
- `maxDiscount` int?
- `appliesTo` object { `productIds` objectId[]?, `categoryIds` objectId[]?, `all`: bool }
- `startAt` date, `endAt` date
- `usageLimit` int, `perUserLimit` int
- `isActive` bool
- `createdAt` date, `updatedAt` date

### carts
- `_id` objectId
- `userId` objectId
- `items` array<{
  - `_id` objectId
  - `productId` objectId
  - `name` string
  - `image` string
  - `price` int
  - `quantity` int
}>
- `voucherCode` string?
- `shippingMethodId` objectId?
- `createdAt` date, `updatedAt` date

### orders
- `_id` objectId
- `userId` objectId
- `status` enum: processing | shipping | completed | cancelled
- `statusTimeline` array<{ `code`: string, `timestamp`: date }>
- `isCancelled` bool, `cancelReason` string?
- `shippingMethod` object { `id`: objectId?, `name`: string, `fee`: int, `etaDays`: int }
- `shippingAddress` snapshot object { `name`, `phone`, `city`, `district`, `ward`, `street` }
- `voucher` snapshot object { `code`, `type`, `discountValue`, `minTotal` }
- `items` array<{
  - `_id` objectId // dùng cho review mapping
  - `productId` objectId
  - `sku` string?
  - `name` string
  - `image` string
  - `price` int
  - `quantity` int
  - `subTotal` int
}>
- `totals` object { `subTotal`: int, `shippingFee`: int, `discount`: int, `total`: int }
- `payment` object { `method`: string, `status`: enum pending | paid | failed | refunded, `transactionId`: string?, `providerMeta`: object }
- `createdAt` date, `updatedAt` date, `deliveredAt` date?, `cancelledAt` date?

### reviews
- `_id` objectId
- `productId` objectId
- `userId` objectId
- `orderItemId` objectId // xác thực đã mua
- `rating` int (1-5)
- `comment` string
- `images` string[]
- `createdAt` date, `updatedAt` date

### wishlists
- `_id` objectId
- `userId` objectId
- `productId` objectId
- `createdAt` date

### notifications
- `_id` objectId
- `userId` objectId
- `type` enum: order | promo | system | support
- `title` string
- `message` string
- `data` object (payload để điều hướng: orderId, productId, route…)
- `readAt` date?
- `createdAt` date

### chat_sessions
- `_id` objectId
- `userId` objectId
- `context` string? (topic/support ticket)
- `createdAt` date, `updatedAt` date

### chat_messages
- `_id` objectId
- `sessionId` objectId (ref chat_sessions)
- `userId` objectId? (null cho AI)
- `role` enum: user | ai | system
- `type` enum: text | image | pdf | bom
- `content` string
- `attachments` array<{ `url`: string, `mime`: string, `size`: int }>
- `aiMeta` object { `model`: string?, `status`: enum pending | answered | failed }
- `createdAt` date

## Chỉ mục gợi ý
- `users.email` unique.
- `categories.slug` unique.
- `vouchers.code` unique; TTL/cron disable theo `endAt`.
- `products`: index `categoryId`, `tags`, `name` text/search; `stock.status`.
- `orders`: index `userId`, `status`, `createdAt`, `items.productId`.
- `reviews`: compound index (`productId`, `createdAt`); index `orderItemId`.
- `wishlists`: unique compound (`userId`, `productId`).
- `notifications`: index `userId`, `readAt`, `createdAt`.
- `chat_messages`: index `sessionId`, `createdAt`.

## Mapping nhanh sang tính năng UI
- Auth/ChangePassword/OTP: dùng `users` + có thể thêm `password_resets`/`email_verifications` (nếu cần).
- AddressBook/Checkout: `addresses`, snapshot vào `orders.shippingAddress`.
- PaymentMethods: `payment_methods`; snapshot + trạng thái thanh toán trong `orders.payment`.
- Catalog/Filter/Search: `products` + `categories` + chỉ mục text/tag/price.
- Voucher/Discount/Shipping Fee: `vouchers`, `orders.totals`, `orders.voucher`, `shippingMethod`.
- Cart/Wishlist: `carts`, `wishlists`.
- OrderHistory/OrderDetail: `orders` với `statusTimeline`, `deliveredAt/cancelledAt`.
- Reviews: `reviews` liên kết `orderItemId` để đảm bảo verified purchase.
- Notifications: `notifications` với `data` payload để điều hướng.
- AI Chat/Support: `chat_sessions`, `chat_messages` với `type` và `attachments`.
