import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

async function requestStoragePermission(): Promise<'granted' | 'denied' | 'blocked'> {
  if (Platform.OS !== 'android') return 'granted';

  try {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    // Nếu đã được cấp trước đó thì không hỏi lại
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) return 'granted';

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Cho phép lưu datasheet',
      message: 'Để tải và lưu file datasheet vào thư mục Tải xuống trên thiết bị, ứng dụng cần quyền lưu trữ.',
      buttonNeutral: 'Để sau',
      buttonNegative: 'Không cho phép',
      buttonPositive: 'Cho phép',
    });

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    }

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'blocked';
    }

    return 'denied';
  } catch (err) {
    console.warn('Error requesting storage permission:', err);
    return 'denied';
  }
}

interface DownloadOptions {
  skipSuccessAlert?: boolean;
}

export async function downloadDatasheetPdf(
  url: string,
  fileName?: string,
  options?: DownloadOptions
): Promise<{ success: boolean; path?: string; error?: any; permissionStatus?: 'denied' | 'blocked' }> {
  const trimmedUrl = (url || '').trim();
  if (!trimmedUrl) {
    Alert.alert('Không có datasheet', 'Sản phẩm này chưa có file datasheet.');
    return { success: false, error: 'No URL' };
  }

  const permStatus = await requestStoragePermission();
  if (permStatus !== 'granted') {
    return { success: false, error: 'Permission issue', permissionStatus: permStatus };
  }

  try {
    const safeName = (fileName || 'datasheet.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${safeName}`
        : `${RNFS.DocumentDirectoryPath}/${safeName}`;

    const { promise } = RNFS.downloadFile({
      fromUrl: trimmedUrl,
      toFile: targetPath,
    });

    const result = await promise;

    if (result.statusCode !== 200) {
      const errorMsg = `Server returned status code ${result.statusCode}`;
      console.warn(errorMsg);
      Alert.alert('Tải datasheet thất bại', `Không thể tải file (Lỗi ${result.statusCode}). Vui lòng thử lại sau.`);
      return { success: false, error: errorMsg };
    }

    if (options?.skipSuccessAlert) {
      return { success: true, path: targetPath };
    }

    const message =
      Platform.OS === 'android'
        ? 'File đã được lưu vào thư mục Tải xuống trên thiết bị.'
        : 'File đã được lưu, bạn có muốn mở ngay không?';

    const buttons =
      Platform.OS === 'ios'
        ? [
          { text: 'Đóng', style: 'cancel' as const },
          {
            text: 'Mở',
            style: 'default' as const,
            onPress: () => {
              Linking.openURL(targetPath).catch(() => {
                Alert.alert('Không thể mở file', 'Vui lòng mở file từ ứng dụng Tệp.');
              });
            },
          },
        ]
        : [{ text: 'OK', style: 'default' as const }];

    Alert.alert('Đã tải datasheet', message, buttons);
    return { success: true, path: targetPath };
  } catch (error) {
    console.warn('Failed to download datasheet:', error);
    Alert.alert('Tải datasheet thất bại', 'Vui lòng kiểm tra kết nối mạng và thử lại.');
    return { success: false, error };
  }
}

