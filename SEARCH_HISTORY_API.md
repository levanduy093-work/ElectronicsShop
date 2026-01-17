# Search History API Implementation Guide

## Overview
Frontend đã được implement để sync lịch sử tìm kiếm với backend. Cần implement các endpoint sau trong backend.

## Required Endpoints

### 1. GET `/users/me/search-history`
Lấy lịch sử tìm kiếm của user hiện tại.

**Response:**
```json
{
  "queries": ["Arduino Uno", "ESP32", "Raspberry Pi"],
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

### 2. POST `/users/me/search-history`
Lưu/cập nhật lịch sử tìm kiếm của user.

**Request Body:**
```json
{
  "queries": ["Arduino Uno", "ESP32", "Raspberry Pi"]
}
```

**Response:**
```json
{
  "queries": ["Arduino Uno", "ESP32", "Raspberry Pi"],
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

### 3. DELETE `/users/me/search-history`
Xóa toàn bộ lịch sử tìm kiếm của user.

**Response:**
```json
{
  "success": true
}
```

## Database Schema

Có thể thêm field `searchHistory` vào User schema:

```typescript
@Prop({ type: [String], default: [] })
searchHistory: string[];
```

Hoặc tạo collection riêng nếu cần lưu thêm metadata (timestamp, etc.)

## Implementation Notes

- Frontend sẽ tự động fallback về local storage nếu API fail
- Frontend sẽ merge local và API history khi load
- Giới hạn: 20 queries mới nhất
- Loại bỏ duplicate (case-insensitive)
