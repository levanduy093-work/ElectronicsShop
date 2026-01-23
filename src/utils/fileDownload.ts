import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Yêu cầu quyền lưu tệp',
        message: 'Ứng dụng cần quyền lưu file datasheet vào bộ nhớ của bạn.',
        buttonNeutral: 'Hỏi sau',
        buttonNegative: 'Từ chối',
        buttonPositive: 'Cho phép',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
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
    Alert.alert('Không có quyền lưu tệp', 'Vui lòng cấp quyền lưu trữ để tải datasheet.');
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

