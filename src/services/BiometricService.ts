import { isSensorAvailable, simplePrompt, type BiometricSensorInfo } from '@sbaiahmed1/react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_lock_enabled';

export type BiometryType = 'Biometrics' | 'FaceID' | 'TouchID' | 'None' | 'Unknown';

export interface BiometricStatus {
    isSupported: boolean;
    biometryType: BiometryType | null;
    displayName: string;
}

/**
 * Kiểm tra thiết bị có hỗ trợ biometric không
 */
export async function checkBiometricSupport(): Promise<BiometricStatus> {
    try {
        const result: BiometricSensorInfo = await isSensorAvailable();

        let displayName = '';
        if (result.biometryType === 'FaceID') {
            displayName = 'Face ID';
        } else if (result.biometryType === 'TouchID') {
            displayName = 'Touch ID';
        } else if (result.biometryType === 'Biometrics') {
            displayName = Platform.OS === 'android' ? 'Vân tay' : 'Biometrics';
        }

        return {
            isSupported: result.available,
            biometryType: result.biometryType || null,
            displayName,
        };
    } catch (error) {
        console.warn('Biometric check error:', error);
        return {
            isSupported: false,
            biometryType: null,
            displayName: '',
        };
    }
}

/**
 * Thực hiện xác thực biometric
 */
export async function authenticateBiometric(promptMessage?: string): Promise<boolean> {
    try {
        const result = await simplePrompt(promptMessage || 'Xác thực để mở khóa ứng dụng');
        return result.success;
    } catch (error) {
        console.warn('Biometric auth error:', error);
        return false;
    }
}

/**
 * Lưu trạng thái bật/tắt biometric lock
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(enabled));
    } catch (error) {
        console.warn('Failed to save biometric setting:', error);
    }
}

/**
 * Kiểm tra biometric lock có được bật không
 */
export async function isBiometricLockEnabled(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        return value ? JSON.parse(value) : false;
    } catch (error) {
        console.warn('Failed to read biometric setting:', error);
        return false;
    }
}

/**
 * Lấy icon name phù hợp với loại biometric
 */

