import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, Platform, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { Address, AddressFormValues, AddressType } from '../types';
import { DEFAULT_ADDRESSES } from '../constants/defaults';
import { buildFullAddress } from '../utils/address';
import { AddressForm } from '../components/address/AddressForm';
import { AddressItem } from '../components/address/AddressItem';
import { getCurrentNetworkStatus, useNetworkStatus } from '../utils/network';
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/api';
import { saveAddresses } from '../services/storage';
import { socketService } from '../services/socket';

interface AddressBookProps {
  onBack: () => void;
  theme?: Theme;
  addresses?: Address[];
  onUpdateAddresses?: React.Dispatch<React.SetStateAction<Address[]>>;
  accessToken?: string | null;
}

export function AddressBook({ onBack, theme, addresses, onUpdateAddresses, accessToken }: AddressBookProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const networkStatus = useNetworkStatus();
  const isOffline = networkStatus.isConnected === false;
  const [localAddresses, setLocalAddresses] = useState<Address[]>(addresses ?? DEFAULT_ADDRESSES);
  const [isLoading, setIsLoading] = useState(false);
  const addressList = addresses ?? localAddresses;
  const updateAddresses = onUpdateAddresses ?? setLocalAddresses;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pendingDefaultId, setPendingDefaultId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<Partial<AddressFormValues>>();
  const scrollContentStyle = { padding: 16, paddingBottom: 96, backgroundColor: t.background };
  const modalOverlayStyle = { backgroundColor: 'rgba(0,0,0,0.32)' };
  const modalCardStyle = { backgroundColor: t.surface, borderColor: t.border };
  const modalCancelBtnStyle = { backgroundColor: t.isDark ? '#2D2D30' : '#E5E7EB' };
  const modalDeleteBtnStyle = { backgroundColor: '#EF4444' };

  const applyAddresses = useCallback((next: Address[]) => {
    setLocalAddresses(next);
    if (onUpdateAddresses) {
      onUpdateAddresses(next);
    }
  }, [onUpdateAddresses]);

  const ensureOnline = useCallback(() => {
    const status = getCurrentNetworkStatus();
    if (status.isConnected === false) {
      Alert.alert(translate('no_internet'), translate('please_check_connection'));
      return false;
    }
    return true;
  }, [translate]);

  // Real-time updates via Socket
  useEffect(() => {
    const handleAddressUpdate = (updatedAddresses: Address[]) => {
      console.log('Received real-time address update');
      setLocalAddresses(updatedAddresses);
      saveAddresses(updatedAddresses); // Update cache
      if (onUpdateAddresses) {
        onUpdateAddresses(updatedAddresses);
      }
    };

    socketService.on('addresses_updated', handleAddressUpdate);

    return () => {
      socketService.off('addresses_updated');
    };
  }, [onUpdateAddresses]);

  // Sync local state with props when props change
  useEffect(() => {
    if (addresses) {
      setLocalAddresses(addresses);
    }
  }, [addresses]);

  const handleSetDefault = async (id: string) => {
    if (pendingDefaultId) return;

    const index = addressList.findIndex(addr => addr.id === id);
    if (index === -1) return;

    if (accessToken) {
      if (!ensureOnline()) return;

      const previous = addressList;
      const optimistic = previous.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      applyAddresses(optimistic);
      setPendingDefaultId(id);

      const syncDefaultAddress = async () => {
        try {
          const updatedAddresses = await setDefaultAddress(index, accessToken);
          applyAddresses(updatedAddresses);
        } catch (error: any) {
          applyAddresses(previous);
          Alert.alert(translate('error'), error.message || translate('cannotSetDefaultAddress'));
        } finally {
          setPendingDefaultId(null);
        }
      };
      syncDefaultAddress();
    } else {
      updateAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })));
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const index = addressList.findIndex(addr => addr.id === id);
    if (index === -1) return;

    if (accessToken) {
      if (!ensureOnline()) return;
      try {
        setIsLoading(true);
        const updatedAddresses = await deleteAddress(index, accessToken);
        setLocalAddresses(updatedAddresses);
        if (onUpdateAddresses) {
          onUpdateAddresses(updatedAddresses);
        }
      } catch (error: any) {
        Alert.alert(translate('error'), error.message || translate('cannotDeleteAddress'));
      } finally {
        setIsLoading(false);
      }
    } else {
      updateAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setEditingIndex(null);
    setFormInitialValues({
      name: '',
      phone: '',
      detailedAddress: '',
      ward: '',
      district: '',
      city: '',
      type: translate('home') as AddressType,
      isDefault: addressList.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addr: Address) => {
    const index = addressList.findIndex(a => a.id === addr.id);
    setEditingId(addr.id);
    setEditingIndex(index !== -1 ? index : null);
    setFormInitialValues({
      name: addr.name,
      phone: addr.phone,
      detailedAddress: addr.detailedAddress,
      ward: addr.ward,
      district: addr.district,
      city: addr.city,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (data: AddressFormValues) => {
    const fullAddress = buildFullAddress(data);

    if (accessToken && editingIndex !== null) {
      if (!ensureOnline()) return;
      // Update existing address via API
      try {
        setIsLoading(true);
        const updatedAddresses = await updateAddress(editingIndex, {
          ...data,
          address: fullAddress,
        }, accessToken);
        setLocalAddresses(updatedAddresses);
        if (onUpdateAddresses) {
          onUpdateAddresses(updatedAddresses);
        }
        setIsFormOpen(false);
      } catch (error: any) {
        Alert.alert(translate('error'), error.message || translate('cannotUpdateAddress'));
      } finally {
        setIsLoading(false);
      }
    } else if (accessToken && editingId === null) {
      if (!ensureOnline()) return;
      // Add new address via API
      try {
        setIsLoading(true);
        const updatedAddresses = await addAddress({
          ...data,
          address: fullAddress,
        }, accessToken);
        setLocalAddresses(updatedAddresses);
        if (onUpdateAddresses) {
          onUpdateAddresses(updatedAddresses);
        }
        setIsFormOpen(false);
      } catch (error: any) {
        Alert.alert(translate('error'), error.message || translate('cannotAddAddress'));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback to local state if no token
      if (editingId) {
        updateAddresses(prev => prev.map(addr => {
          if (addr.id === editingId) {
            return {
              ...addr,
              ...data,
              address: fullAddress,
            };
          }
          if (data.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        }));
      } else {
        const newId = `addr-${Date.now()}`;
        const newAddress: Address = {
          ...data,
          id: newId,
          address: fullAddress,
        };

        if (newAddress.isDefault) {
          updateAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddress));
        } else {
          updateAddresses(prev => [...prev, newAddress]);
        }
      }
      setIsFormOpen(false);
    }
  };

  if (isFormOpen) {
    return (
      <AddressForm
        theme={t}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        initialValues={formInitialValues}
        title={editingId ? translate('editAddress') : translate('addNewAddress')}
      />
    );
  }


  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.card,
          borderBottomColor: t.border,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: t.text }}>{translate('address_book')}</Text>
        <TouchableOpacity onPress={openAddForm} activeOpacity={0.7}>
          <AppIcon name="plus" size={24} color={t.primary} />
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View className="flex-row items-center gap-1.5 px-3 py-2.5 border-b" style={{ backgroundColor: t.surface, borderColor: t.border }}>
          <AppIcon name="wifi-off" size={14} color={t.muted} />
          <Text className="text-xs font-medium" style={{ color: t.muted }}>
            {translate('no_internet')}
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && addressList.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color={t.primary} />
            <Text className="mt-3 text-sm" style={{ color: t.muted }}>{translate('loading_addresses')}</Text>
          </View>
        ) : (
          addressList.map((addr) => (
            <AddressItem
              key={addr.id}
              address={addr}
              theme={t}
              isSettingDefault={pendingDefaultId === addr.id}
              onSetDefault={handleSetDefault}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))
        )}

        <TouchableOpacity
          onPress={openAddForm}
          className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed rounded-xl mt-2"
          style={{ borderColor: t.border }}
          activeOpacity={0.7}
        >
          <AppIcon name="plus" size={20} color={t.muted} />
          <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('addNewAddress')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={!!confirmDeleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteId(null)}
      >
        <View className="flex-1 justify-center items-center px-6" style={modalOverlayStyle}>
          <View
            className="w-full max-w-[360px] rounded-[20px] px-5 pt-6 pb-3.5 border"
            style={modalCardStyle}
          >
            <Text className="text-lg font-bold mb-2" style={{ color: t.text }}>
              {translate('confirmDelete')}
            </Text>
            <Text className="text-sm leading-6 mb-4" style={{ color: t.muted }}>
              {translate('confirmDeleteAddress')}
            </Text>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-2xl min-h-11 items-center justify-center"
                style={modalCancelBtnStyle}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-semibold" style={{ color: t.text }}>
                  {translate('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                className="flex-1 rounded-2xl min-h-11 items-center justify-center"
                style={modalDeleteBtnStyle}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-semibold text-white">
                  {translate('delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
