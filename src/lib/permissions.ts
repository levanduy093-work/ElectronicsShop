import { Platform, PermissionsAndroid } from 'react-native';

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // iOS sẽ tự động hiển thị dialog permission từ Info.plist
    return true;
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Yêu cầu quyền truy cập Microphone',
          message: 'Chúng tôi cần truy cập microphone của bạn để sử dụng tính năng nhận diện giọng nói',
          buttonNeutral: 'Hỏi sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Cho phép',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting microphone permission:', err);
      return false;
    }
  }

  return false;
}
