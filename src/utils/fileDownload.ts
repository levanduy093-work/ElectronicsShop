import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    // Nếu đã được cấp trước đó thì không hỏi lại
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) return true;

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Cho phép lưu datasheet',
      message: 'Để tải và lưu file datasheet vào thư mục Tải xuống trên thiết bị, ứng dụng cần quyền lưu trữ.',
      buttonNeutral: 'Để sau',
      buttonNegative: 'Không cho phép',
      buttonPositive: 'Cho phép',
    });

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Không có quyền lưu tệp',
        'Bạn đã tắt quyền lưu trữ cho ứng dụng. Vào Cài đặt hệ thống để cấp lại quyền trước khi tải datasheet.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Mở cài đặt',
            onPress: () => {
              Linking.openSettings().catch(() => {
                // best-effort, không cần alert thêm
              });
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Không có quyền lưu tệp',
        'Ứng dụng cần quyền lưu trữ để tải datasheet. Bạn có thể cấp lại quyền trong Cài đặt hệ thống.',
      );
    }

    return false;
  } catch (err) {
    console.warn('Error requesting storage permission:', err);
    return false;
  }
}

export async function downloadDatasheetPdf(url: string, fileName?: string) {
  const trimmedUrl = (url || '').trim();
  if (!trimmedUrl) {
    Alert.alert('Không có datasheet', 'Sản phẩm này chưa có file datasheet.');
    return;
  }

  const ok = await requestStoragePermission();
  if (!ok) {
    return;
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

    await promise;

    Alert.alert(
      'Đã tải datasheet',
      Platform.OS === 'android'
        ? `File đã được lưu vào thư mục Tải xuống: ${safeName}`
        : 'File đã được lưu, bấm Mở để xem.',
      Platform.OS === 'ios'
        ? [
            { text: 'Đóng', style: 'cancel' },
            {
              text: 'Mở',
              onPress: () => {
                Linking.openURL(targetPath).catch(() => {
                  Alert.alert('Không thể mở file', 'Vui lòng mở file từ ứng dụng Files.');
                });
              },
            },
          ]
        : undefined,
    );
  } catch (error) {
    console.warn('Failed to download datasheet:', error);
    Alert.alert('Tải datasheet thất bại', 'Vui lòng kiểm tra kết nối mạng và thử lại.');
  }
}

