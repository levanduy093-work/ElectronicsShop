# Hướng dẫn sử dụng chức năng Speech-to-Text (Nhận diện giọng nói)

## Tổng quan
Ứng dụng ElectronicsShop hiện tại đã được tích hợp chức năng nhận diện giọng nói trên cả nền tảng Android và iOS. Người dùng có thể nhấn nút microphone trong màn hình AI Chat để gửi yêu cầu bằng giọng nói thay vì phải gõ chữ.

## Các tính năng

### 1. **Nhận diện giọng nói tiếng Việt**
   - Hỗ trợ tiếng Việt (vi-VN)
   - Chuyển đổi giọng nói thành văn bản tự động

### 2. **Giao diện thân thiện**
   - Nút microphone sáng lên khi đang ghi âm
   - Hiển thị text đang được nhận diện trong thời gian thực
   - Biểu tượng "đang lắng nghe" để phản hồi người dùng

### 3. **Quản lý quyền truy cập**
   - **Android**: Tự động yêu cầu quyền truy cập microphone khi người dùng nhấn nút
   - **iOS**: Yêu cầu quyền từ Info.plist

## Hướng dẫn sử dụng

### Bước 1: Mở màn hình AI Chat
Điều hướng đến phần "AI Engineer Support" trong ứng dụng.

### Bước 2: Nhấn nút Microphone
- Nút microphone nằm ở bên phải của ô input text (khi ô input trống)
- Khi nhấn, nút sẽ chuyển màu xanh để biểu thị đang ghi âm

### Bước 3: Nói rõ ràng
- Nói yêu cầu của bạn rõ ràng
- Ứng dụng sẽ hiển thị text nhận diện được ở trên input box

### Bước 4: Nói xong thì thả tay
- Sau khi nói xong, nhấn lại nút microphone để dừng ghi âm
- Hoặc chờ ứng dụng tự động dừng sau khoảng 3 giây im lặng

## Các file liên quan

### 1. **src/hooks/useSpeechToText.ts**
   - Hook chính để quản lý logic nhận diện giọng nói
   - Bao gồm: khởi động, dừng, xử lý kết quả

### 2. **src/lib/permissions.ts**
   - Xử lý quyền truy cập microphone trên Android/iOS
   - Yêu cầu quyền khi cần thiết

### 3. **src/screens/AIChat.tsx**
   - Tích hợp hook useSpeechToText
   - Cập nhật UI để hiển thị trạng thái ghi âm
   - Xử lý kết quả giọng nói

## Cấu hình hệ thống

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### iOS (Info.plist)
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Cần quyền truy cập microphone để sử dụng tính năng nhận diện giọng nói</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Cần quyền nhận diện giọng nói để sử dụng trợ lý AI</string>
```

## Xử lý lỗi

### Lỗi "Không có quyền truy cập microphone"
- **Nguyên nhân**: Người dùng từ chối cấp quyền
- **Giải pháp**: Vào cài đặt ứng dụng và cấp quyền microphone

### Lỗi "Không nghe thấy giọng nói"
- **Nguyên nhân**: Không nói hoặc nói quá nhỏ
- **Giải pháp**: Nói rõ ràng và to hơn

### Lỗi "Không thể bắt đầu ghi âm"
- **Nguyên nhân**: Microphone đang bị sử dụng hoặc có vấn đề kỹ thuật
- **Giải pháp**: Kiểm tra microphone hoặc khởi động lại ứng dụng

## Các tùy chọn tương lai

1. **Hỗ trợ nhiều ngôn ngữ** (tiếng Anh, Trung Quốc, v.v.)
2. **Cải thiện độ chính xác** bằng ML model
3. **Ghi âm tự động** khi người dùng ngừng nói
4. **Hiệu ứng âm thanh** khi bắt đầu/kết thúc ghi âm
5. **Lịch sử lệnh thoại** để người dùng xem lại

## Khắc phục sự cố

Nếu gặp vấn đề, hãy thử:
1. **Xóa cache ứng dụng** (Settings > Apps > ElectronicsShop > Clear Cache)
2. **Khởi động lại thiết bị**
3. **Cập nhật ứng dụng** lên phiên bản mới nhất
4. **Kiểm tra kết nối internet** (cần để gọi API)

## Dependencies được cài đặt
- `@react-native-voice/voice`: ^3.2.4 - Library nhận diện giọng nói

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 14 tháng 1, 2026
