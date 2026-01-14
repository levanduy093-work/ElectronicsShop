# Quick Reference - Speech-to-Text Implementation

## 🎯 Nhanh Chóng

### Sử dụng Hook trong Component
```tsx
import { useSpeechToText } from '../hooks/useSpeechToText';

// Trong component
const { 
  isListening,           // boolean - đang ghi âm?
  recognizedText,        // string - text nhận diện
  error,                 // string | null - lỗi
  startListening,        // () => Promise<void>
  stopListening,         // () => Promise<void>
  cancelListening,       // () => Promise<void>
} = useSpeechToText({
  onResult: (text) => console.log('Nhận diện:', text),
  onError: (error) => console.error('Lỗi:', error),
  onStart: () => console.log('Bắt đầu'),
  onEnd: () => console.log('Kết thúc'),
});

// Sử dụng
const handleMicPress = () => {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
};
```

## 📱 Platform-specific Details

### Android
```
- Request permission: tự động khi call startListening()
- Locale: 'vi_VN'
- Permissions: android.permission.RECORD_AUDIO, VIBRATE
```

### iOS
```
- Request permission: từ Info.plist
- Locale: 'vi-VN'
- Info.plist keys required:
  - NSMicrophoneUsageDescription
  - NSSpeechRecognitionUsageDescription
```

## 🎨 UI Components

### Listening Indicator
```tsx
{isListening && (
  <View style={styles.listeningIndicator}>
    <View style={styles.recordingDot} />
    <Text>{recognizedText || 'Đang lắng nghe...'}</Text>
  </View>
)}
```

### Mic Button
```tsx
<TouchableOpacity 
  onPress={isListening ? stopListening : startListening}
  style={[
    styles.micButton,
    isListening && { backgroundColor: theme.primary }
  ]}
>
  <AppIcon 
    name="mic" 
    color={isListening ? '#FFF' : theme.muted}
  />
</TouchableOpacity>
```

## ⚠️ Error Handling

| Error Message | Cause | Solution |
|---|---|---|
| "Không có quyền..." | Permission denied | User settings → Allow |
| "Không nghe thấy..." | No speech input | Speak clearly/louder |
| "Không thể bắt đầu..." | Mic in use | Restart app |

## 🔍 Debugging

```tsx
// Enable logs
Voice.onSpeechStart = () => console.log('Started');
Voice.onSpeechResults = (e) => console.log('Result:', e.value);
Voice.onSpeechError = (e) => console.log('Error:', e.error);
```

## 📦 Installation

```bash
npm install @react-native-voice/voice
cd ios && pod install
```

## 🧹 Cleanup

Hook tự động cleanup khi component unmount:
```tsx
useEffect(() => {
  return () => {
    Voice.destroy().catch(err => console.warn(err));
  };
}, []);
```

---

See [SPEECH_TO_TEXT_GUIDE.md](./SPEECH_TO_TEXT_GUIDE.md) for full documentation
