import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';
import { Address, AddressFormValues, DEFAULT_ADDRESSES, buildFullAddress } from '../lib/address';
import { AddressForm } from '../components/address/AddressForm';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, FrontendAddress } from '../lib/api';

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
  const t = theme || ctxTheme || lightTheme;
  const [localAddresses, setLocalAddresses] = useState<Address[]>(addresses ?? DEFAULT_ADDRESSES);
  const [isLoading, setIsLoading] = useState(false);
  const addressList = addresses ?? localAddresses;
  const updateAddresses = onUpdateAddresses ?? setLocalAddresses;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<Partial<AddressFormValues>>();

  // Fetch addresses from API on mount if accessToken is available
  useEffect(() => {
    if (accessToken) {
      loadAddresses();
    } else if (addresses) {
      setLocalAddresses(addresses);
    }
  }, [accessToken]);

  const loadAddresses = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      const fetchedAddresses = await getAddresses(accessToken);
      setLocalAddresses(fetchedAddresses);
      if (onUpdateAddresses) {
        onUpdateAddresses(fetchedAddresses);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const index = addressList.findIndex(addr => addr.id === id);
    if (index === -1) return;

    if (accessToken) {
      try {
        setIsLoading(true);
        const updatedAddresses = await setDefaultAddress(index, accessToken);
        setLocalAddresses(updatedAddresses);
        if (onUpdateAddresses) {
          onUpdateAddresses(updatedAddresses);
        }
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể đặt địa chỉ mặc định');
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

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (accessToken) {
            try {
              setIsLoading(true);
              const updatedAddresses = await deleteAddress(index, accessToken);
              setLocalAddresses(updatedAddresses);
              if (onUpdateAddresses) {
                onUpdateAddresses(updatedAddresses);
              }
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa địa chỉ');
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
      type: 'Nhà riêng',
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
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật địa chỉ');
      } finally {
        setIsLoading(false);
      }
    } else if (accessToken && editingId === null) {
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
        Alert.alert('Lỗi', error.message || 'Không thể thêm địa chỉ');
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
        title={editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
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
        <Text style={[styles.headerTitle, { color: t.text }]}>Sổ địa chỉ</Text>
        <TouchableOpacity onPress={openAddForm} activeOpacity={0.7}>
          <AppIcon name="plus" size={24} color={t.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && addressList.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={t.primary} />
            <Text style={[styles.loadingText, { color: t.muted }]}>Đang tải địa chỉ...</Text>
          </View>
        ) : (
          addressList.map((addr) => (
          <View
            key={addr.id}
            style={[
              styles.addressCard,
              { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 },
              addr.isDefault && { borderColor: t.primary, borderWidth: 2 },
            ]}
          >
            <View style={styles.addressHeader}>
              <View style={styles.addressInfo}>
                <Text style={[styles.addressName, { color: t.text }]}>{addr.name}</Text>
                <Text style={[styles.addressSeparator, { color: t.muted }]}>{'|'}</Text>
                <Text style={[styles.addressPhone, { color: t.muted }]}>{addr.phone}</Text>
              </View>
              {addr.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)', borderColor: t === lightTheme ? '#93C5FD' : t.primary }]}>
                  <Text style={[styles.defaultBadgeText, { color: t.primary }]}>Mặc định</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleSetDefault(addr.id)}
                  style={[styles.setDefaultButton, { borderColor: t.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.setDefaultText, { color: t.muted }]}>Đặt mặc định</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.addressText, { color: t.text }]}>{addr.address}</Text>

            <View style={styles.addressFooter}>
              <View style={[styles.typeBadge, { backgroundColor: t.surface }]}>
                <AppIcon
                  name={addr.type === 'Nhà riêng' ? 'home' : 'briefcase'}
                  size={10}
                  color={t.muted}
                />
                <Text style={[styles.typeBadgeText, { color: t.muted }]}>{addr.type}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => openEditForm(addr)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <AppIcon name="edit" size={14} color={t.primary} />
                  <Text style={[styles.actionText, { color: t.primary }]}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(addr.id)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <AppIcon name="trash" size={14} color="#EF4444" />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
        )}

        <TouchableOpacity
          onPress={openAddForm}
          style={[styles.addButton, { borderColor: t.border }]}
          activeOpacity={0.7}
        >
          <AppIcon name="plus" size={20} color={t.muted} />
          <Text style={[styles.addButtonText, { color: t.text }]}>Thêm địa chỉ mới</Text>
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
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  addressCardDefault: {
    borderColor: '#93C5FD',
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  addressSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#2563EB',
  },
  setDefaultButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  setDefaultText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  addressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
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
