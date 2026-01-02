import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppIcon } from '../components/common/Icon';

interface AddressBookProps {
  onBack: () => void;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  detailedAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  isDefault: boolean;
  type: 'Nhà riêng' | 'Văn phòng';
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    detailedAddress: '123 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
    type: 'Nhà riêng',
  },
  {
    id: 2,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: 'Toà nhà TechHub, 456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    detailedAddress: 'Toà nhà TechHub, 456 Đường Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
    type: 'Văn phòng',
  },
];

export function AddressBook({ onBack }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    detailedAddress: '',
    ward: '',
    district: '',
    city: '',
    type: 'Nhà riêng',
    isDefault: false,
  });

  const handleSetDefault = (id: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => setAddresses(prev => prev.filter(addr => addr.id !== id)),
      },
    ]);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      detailedAddress: '',
      ward: '',
      district: '',
      city: '',
      type: 'Nhà riêng',
      isDefault: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.detailedAddress) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const fullAddress = `${formData.detailedAddress}, ${formData.ward}, ${formData.district}, ${formData.city}`;

    if (editingId) {
      setAddresses(prev => prev.map(addr => {
        if (addr.id === editingId) {
          return {
            ...addr,
            ...formData,
            address: fullAddress,
          } as Address;
        }
        if (formData.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      }));
    } else {
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      const newAddress = {
        ...formData,
        id: newId,
        address: fullAddress,
      } as Address;

      if (newAddress.isDefault) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddress));
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
    }
    setIsFormOpen(false);
  };

  if (isFormOpen) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsFormOpen(false)} activeOpacity={0.7}>
            <AppIcon name="arrow-left" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                style={styles.input}
                placeholder="Nhập họ tên"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                value={formData.phone}
                onChangeText={text => setFormData({ ...formData, phone: text })}
                style={styles.input}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh / Thành phố</Text>
              <TextInput
                value={formData.city}
                onChangeText={text => setFormData({ ...formData, city: text })}
                style={styles.input}
                placeholder="Nhập Tỉnh/Thành phố"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Quận / Huyện</Text>
                <TextInput
                  value={formData.district}
                  onChangeText={text => setFormData({ ...formData, district: text })}
                  style={styles.input}
                  placeholder="Quận/Huyện"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Phường / Xã</Text>
                <TextInput
                  value={formData.ward}
                  onChangeText={text => setFormData({ ...formData, ward: text })}
                  style={styles.input}
                  placeholder="Phường/Xã"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ cụ thể</Text>
              <TextInput
                value={formData.detailedAddress}
                onChangeText={text => setFormData({ ...formData, detailedAddress: text })}
                style={styles.input}
                placeholder="Số nhà, tên đường..."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại địa chỉ</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, type: 'Nhà riêng' })}
                  style={[
                    styles.typeButton,
                    formData.type === 'Nhà riêng' && styles.typeButtonSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <AppIcon name="home" size={16} color={formData.type === 'Nhà riêng' ? '#2563EB' : '#6B7280'} />
                  <Text style={[
                    styles.typeText,
                    formData.type === 'Nhà riêng' && styles.typeTextSelected,
                  ]}>
                    Nhà riêng
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, type: 'Văn phòng' })}
                  style={[
                    styles.typeButton,
                    formData.type === 'Văn phòng' && styles.typeButtonSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <AppIcon name="briefcase" size={16} color={formData.type === 'Văn phòng' ? '#2563EB' : '#6B7280'} />
                  <Text style={[
                    styles.typeText,
                    formData.type === 'Văn phòng' && styles.typeTextSelected,
                  ]}>
                    Văn phòng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              style={styles.checkboxContainer}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxSelected,
              ]}>
                {formData.isDefault && <AppIcon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sổ địa chỉ</Text>
        <TouchableOpacity onPress={openAddForm} activeOpacity={0.7}>
          <AppIcon name="plus" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {addresses.map((addr) => (
          <View
            key={addr.id}
            style={[
              styles.addressCard,
              addr.isDefault && styles.addressCardDefault,
            ]}
          >
            <View style={styles.addressHeader}>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{addr.name}</Text>
                <Text style={styles.addressSeparator}>|</Text>
                <Text style={styles.addressPhone}>{addr.phone}</Text>
              </View>
              {addr.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleSetDefault(addr.id)}
                  style={styles.setDefaultButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.setDefaultText}>Đặt mặc định</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.addressText}>{addr.address}</Text>

            <View style={styles.addressFooter}>
              <View style={styles.typeBadge}>
                <AppIcon
                  name={addr.type === 'Nhà riêng' ? 'home' : 'briefcase'}
                  size={10}
                  color="#6B7280"
                />
                <Text style={styles.typeBadgeText}>{addr.type}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => openEditForm(addr)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <AppIcon name="edit" size={14} color="#2563EB" />
                  <Text style={styles.actionText}>Sửa</Text>
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
        ))}

        <TouchableOpacity
          onPress={openAddForm}
          style={styles.addButton}
          activeOpacity={0.7}
        >
          <AppIcon name="plus" size={20} color="#6B7280" />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
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
  formContent: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#111827',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeTextSelected: {
    color: '#2563EB',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 96,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
