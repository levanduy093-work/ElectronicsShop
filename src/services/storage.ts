import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAddresses = async (addresses: any[]) => { // Using any[] to avoid circular dependency if types are messy, or better import Address
    try {
        await AsyncStorage.setItem('@addresses', JSON.stringify(addresses));
    } catch (e) {
        console.warn('Failed to save addresses', e);
    }
};

export const loadLocalAddresses = async (): Promise<any[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem('@addresses');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.warn('Failed to load local addresses', e);
        return [];
    }
};
