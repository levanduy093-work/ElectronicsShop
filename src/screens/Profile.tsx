import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppIcon } from '../components/common/Icon';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AVAILABLE_VOUCHERS } from '../lib/data';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface ProfileProps {
  onNavigateToOrders?: () => void;
  onNavigateToAddress?: () => void;
  onNavigateToPayment?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToWishlist?: () => void;
  onLogout?: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
}

export function Profile({
  onNavigateToOrders,
  onNavigateToAddress,
  onNavigateToPayment,
  onNavigateToSettings,
  onNavigateToSupport,
  onNavigateToWishlist,
  onLogout,
  userProfile = { name: "Nguyễn Văn A", email: "nguyenva@example.com", avatar: "" },
  onUpdateProfile,
}: ProfileProps) {
  const [showVouchers, setShowVouchers] = useState(false);

  const handleCopyVoucher = (code: string) => {
    Alert.alert('Thông báo', `Đã sao chép mã ${code}`);
    setShowVouchers(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {userProfile.avatar ? (
            <ImageWithFallback
              source={{ uri: userProfile.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppIcon name="user" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          onPress={onNavigateToOrders}
          style={styles.statCard}
          activeOpacity={0.7}
        >
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowVouchers(true)}
          style={styles.statCard}
          activeOpacity={0.7}
        >
          <Text style={styles.statValue}>{AVAILABLE_VOUCHERS.length}</Text>
          <Text style={styles.statLabel}>Voucher</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Groups */}
      <View style={styles.menuContainer}>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="package"
            label="Đơn hàng của tôi"
            onPress={onNavigateToOrders}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="heart"
            label="Sản phẩm yêu thích"
            onPress={onNavigateToWishlist}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="map-pin"
            label="Sổ địa chỉ"
            onPress={onNavigateToAddress}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="credit-card"
            label="Phương thức thanh toán"
            onPress={onNavigateToPayment}
          />
        </View>

        <View style={styles.menuGroup}>
          <MenuItem
            icon="settings"
            label="Cài đặt"
            onPress={onNavigateToSettings}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="help-circle"
            label="Trung tâm hỗ trợ"
            onPress={onNavigateToSupport}
          />
        </View>

        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <AppIcon name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0 (Build 2024)</Text>

      {/* Vouchers Modal */}
      {showVouchers && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowVouchers(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kho Voucher của tôi</Text>
              <TouchableOpacity
                onPress={() => setShowVouchers(false)}
                activeOpacity={0.7}
              >
                <AppIcon name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.voucherList}>
              {AVAILABLE_VOUCHERS.map((voucher) => (
                <View key={voucher.code} style={styles.voucherCard}>
                  <View style={styles.voucherIconContainer}>
                    <AppIcon name="ticket" size={24} color="#2563EB" />
                  </View>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    <Text style={styles.voucherDescription}>{voucher.description}</Text>
                    <Text style={styles.voucherExpiry}>HSD: 31/12/2026</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCopyVoucher(voucher.code)}
                    style={styles.voucherCopyButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.voucherCopyText}>Sao chép</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <AppIcon name={icon} size={16} color="#2563EB" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <AppIcon name="chevron-right" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#2563EB',
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuContainer: {
    gap: 24,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
    marginRight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 32,
    marginBottom: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  voucherList: {
    maxHeight: 400,
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  voucherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  voucherDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    color: '#2563EB',
  },
  voucherCopyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  voucherCopyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
  },
});
