# Tóm tắt các thay đổi - Chức năng Speech-to-Text

## 📋 Tổng quan
Đã triển khai chức năng nhận diện giọng nói (Speech-to-Text) trên cả Android và iOS cho ứng dụng ElectronicsShop. Người dùng có thể nhấn nút microphone để gửi yêu cầu bằng giọng nói thay vì phải gõ text.

## 📦 Dependencies được cài đặt
- `@react-native-voice/voice` (v3.2.4) - Library chính cho nhận diện giọng nói

## 📝 Files được tạo/sửa

### 1. **src/hooks/useSpeechToText.ts** (NEW)
   - Custom React hook để quản lý logic nhận diện giọng nói
   - Tính năng:
     - Khởi động/dừng ghi âm
     - Xử lý kết quả nhận diện
     - Xử lý lỗi
     - Hỗ trợ tiếng Việt trên cả Android (vi_VN) và iOS (vi-VN)

### 2. **src/lib/permissions.ts** (NEW)
   - Xử lý quyền truy cập microphone
   - Tính năng:
     - Request quyền RECORD_AUDIO trên Android
     - iOS tự động request từ Info.plist

### 3. **src/screens/AIChat.tsx** (UPDATED)
   - Thêm import `useSpeechToText` hook
   - Thêm state cho nhận diện giọng nói:
     - `isListening` - trạng thái đang ghi âm
     - `recognizedText` - text nhận diện được
     - `error` - message lỗi
   - Cập nhật nút microphone:
     - Sáng lên khi đang ghi
     - Tắt microphone khi nhấn lại
   - Thêm UI indicator "Đang lắng nghe" khi ghi âm
   - Thêm error handling với Toast notifications
   - Tự động gán text nhận diện vào input field

### 4. **android/app/src/main/AndroidManifest.xml** (UPDATED)
   - Thêm permissions:
     ```xml
     <uses-permission android:name="android.permission.RECORD_AUDIO" />
     <uses-permission android:name="android.permission.VIBRATE" />
     ```

### 5. **ios/ElectronicsShop/Info.plist** (UPDATED)
   - Thêm keys:
     ```xml
     <key>NSMicrophoneUsageDescription</key>
     <string>Cần quyền truy cập microphone để sử dụng tính năng nhận diện giọng nói</string>
     <key>NSSpeechRecognitionUsageDescription</key>
     <string>Cần quyền nhận diện giọng nói để sử dụng trợ lý AI</string>
     ```

### 6. **SPEECH_TO_TEXT_GUIDE.md** (NEW)
   - Tài liệu hướng dẫn sử dụng chi tiết cho người dùng

## 🎨 UI Changes

### Nút Microphone
- **Trạng thái bình thường**: Hiển thị icon mic màu xám
- **Trạng thái ghi**: Nút sáng lên màu xanh (primary color)
- **Size**: 40x40px (vừa với các nút khác)

### Listening Indicator
- Hiển thị khi đang ghi
- Hiện thị text đang nhận diện hoặc "Đang lắng nghe..."
- Có chấm đỏ chỉ thị trạng thái ghi âm

## 🔧 Cấu hình Pod iOS
- Chạy `pod install --repo-update` để cài CocoaPods dependencies
- Tự động integrate `react-native-voice` library

## ⚡ Tính năng chính

### 1. Nhận diện Tiếng Việt
- Hỗ trợ locale `vi-VN` (iOS) và `vi_VN` (Android)

### 2. Xử lý lỗi thông minh
- "Không nghe thấy giọng nói" → Toast info
- Lỗi khác → Toast error
- Hiển thị message thân thiện bằng Tiếng Việt

### 3. UX tốt
- Tự động gán text vào input field
- Nút microphone disable khi đang upload ảnh hoặc gửi message
- Visual feedback rõ ràng

## 🧪 Testing Checklist

- [ ] Test trên Android
  - [ ] Kiểm tra request permission
  - [ ] Ghi âm và nhận diện giọng nói
  - [ ] Xử lý lỗi khi từ chối permission
  
- [ ] Test trên iOS
  - [ ] Permission prompt
  - [ ] Ghi âm và nhận diện
  - [ ] UI visual feedback

## 🚀 Cách sử dụng

1. Mở màn hình AI Chat
2. Để ô input trống
3. Nhấn nút microphone (bên phải)
4. Nói rõ yêu cầu
5. Nhấn lại nút hoặc chờ tự động dừng
6. Text được nhận diện tự động xuất hiện trong input
7. Nhấn "send" để gửi

## 📌 Notes

- Hook `useSpeechToText` có thể tái sử dụng ở các screen khác
- Permission handling tự động, người dùng sẽ được hỏi lần đầu tiên
- Error messages hiển thị bằng Toast notifications
- Library `@react-native-voice/voice` có maintained tốt

---

**Date**: 14 tháng 1, 2026  
**Status**: ✅ Hoàn thành
