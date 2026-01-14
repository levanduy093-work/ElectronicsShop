# Build & Run Instructions

## Yêu cầu

- Node.js >= 20
- iOS: Xcode (nếu chạy trên iOS)
- Android: Android Studio hoặc Android SDK
- npm hoặc yarn

## Bước 1: Cài đặt Dependencies

```bash
cd /Users/levanduy/Nam4/HK2/Mobile/Electronics/ElectronicsShop

# Cài npm packages
npm install

# Chỉ dành cho iOS - cài Pod dependencies
cd ios
pod install
cd ..
```

## Bước 2: Chạy ứng dụng

### Trên Android
```bash
npm run android
# Hoặc
npx react-native run-android
```

**Yêu cầu:**
- Android device hoặc emulator chạy
- `adb devices` phải có device trong list

### Trên iOS
```bash
npm run ios
# Hoặc
npx react-native run-ios
```

**Yêu cầu:**
- iOS simulator hoặc physical device
- Xcode installed

## Bước 3: Phát triển

### Metro Bundler
```bash
npm start
# Hoặc
npx react-native start
```

Sau đó mở terminal khác và chạy:
```bash
npm run android
# Hoặc
npm run ios
```

### Hot Reload
- Android: Nhấn `R` 2 lần
- iOS: Cmd + R

### Debug Menu
- Android: Cmd + M (hoặc ngáy device)
- iOS: Cmd + D (hoặc shake device)

## 🧪 Testing

### Lint Check
```bash
npm run lint
```

### Run Tests
```bash
npm test
```

## 📦 Build Production

### Android
```bash
cd android
./gradlew assembleRelease
# APK sẽ ở: android/app/build/outputs/apk/release/
```

### iOS
```bash
# Dùng Xcode hoặc:
cd ios
xcodebuild -workspace ElectronicsShop.xcworkspace \
  -scheme ElectronicsShop \
  -configuration Release \
  -derivedDataPath build
```

## 🐛 Troubleshooting

### Metro Bundler Error
```bash
rm -rf node_modules package-lock.json
npm install
npm start -- --reset-cache
```

### Pod Install Failed (iOS)
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Android Build Cache
```bash
cd android
./gradlew clean
./gradlew build
```

### Device not detected
```bash
# Android
adb kill-server
adb start-server

# iOS
xcrun instruments -s devices
```

## 📱 Testing Speech-to-Text Feature

1. Chạy ứng dụng
2. Điều hướng tới "AI Engineer Support"
3. Nhấn nút microphone (bên phải input)
4. Nói yêu cầu rõ ràng
5. Kiểm tra text nhận diện trong input field

### Permissions Testing
- **Android**: Ứng dụng sẽ request permission khi nhấn nút
- **iOS**: Permission prompt từ iOS lần đầu tiên

---

**Last Updated**: 14 tháng 1, 2026
