import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
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
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/api';
import { loadLocalAddresses, saveAddresses } from '../services/storage';
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
  const [formInitialValues, setFormInitialValues] = useState<Partial<AddressFormValues>>();
  const hasFetchedRef = useRef(false);

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
    const index = addressList.findIndex(addr => addr.id === id);
    if (index === -1) return;

    if (accessToken) {
      if (!ensureOnline()) return;
      try {
        setIsLoading(true);
        const updatedAddresses = await setDefaultAddress(index, accessToken);
        setLocalAddresses(updatedAddresses);
        if (onUpdateAddresses) {
          onUpdateAddresses(updatedAddresses);
        }
      } catch (error: any) {
        Alert.alert(translate('error'), error.message || translate('cannotSetDefaultAddress'));
      } finally {
        setIsLoading(false);
      }
    } else {
      updateAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })));
    }
  };

  const handleDelete = (id: string) => {
    const index = addressList.findIndex(addr => addr.id === id);
    if (index === -1) return;

    Alert.alert(translate('confirmDelete'), translate('confirmDeleteAddress'), [
      { text: translate('cancel'), style: 'cancel' },
      {
        text: translate('delete'),
        style: 'destructive',
        onPress: async () => {
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
        },
      },
    ]);
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
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 0), backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>{translate('address_book')}</Text>
        <TouchableOpacity onPress={openAddForm} activeOpacity={0.7}>
          <AppIcon name="plus" size={24} color={t.primary} />
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={[styles.offlineBanner, { backgroundColor: t.surface, borderColor: t.border }]}>
          <AppIcon name="wifi-off" size={14} color={t.muted} />
          <Text style={[styles.offlineText, { color: t.muted }]}>
            {translate('no_internet')}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && addressList.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={t.primary} />
            <Text style={[styles.loadingText, { color: t.muted }]}>{translate('loading_addresses')}</Text>
          </View>
        ) : (
          addressList.map((addr) => (
            <AddressItem
              key={addr.id}
              address={addr}
              theme={t}
              onSetDefault={handleSetDefault}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))
        )}

        <TouchableOpacity
          onPress={openAddForm}
          style={[styles.addButton, { borderColor: t.border }]}
          activeOpacity={0.7}
        >
          <AppIcon name="plus" size={20} color={t.muted} />
          <Text style={[styles.addButtonText, { color: t.text }]}>{translate('addNewAddress')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
