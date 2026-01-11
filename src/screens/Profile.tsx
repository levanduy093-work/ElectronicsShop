import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, Platform, Modal, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AVAILABLE_VOUCHERS, Voucher } from '../lib/data';
import { Theme, lightTheme, useTheme } from '../lib/theme';
import { useToast } from '../components/common/ToastProvider';
import { UploadImageFile } from '../lib/api';

// Dynamic import để tránh lỗi khi module chưa được link
let launchImageLibrary: any = null;
let ImagePickerResponse: any = null;
let MediaType: any = null;

try {
  const ImagePicker = require('react-native-image-picker');
  launchImageLibrary = ImagePicker.launchImageLibrary;
  ImagePickerResponse = ImagePicker.ImagePickerResponse;
  MediaType = ImagePicker.MediaType;
} catch (error) {
  console.warn('react-native-image-picker not available:', error);
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface ProfileProps {
  onNavigateToOrders?: () => void;
  orderCount?: number;
  onNavigateToAddress?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToWishlist?: () => void;
  onLogout?: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile> & { avatarFile?: UploadImageFile }) => Promise<boolean> | void;
  theme?: Theme;
  vouchers?: Voucher[];
}

export function Profile({
  onNavigateToOrders,
  orderCount = 0,
  onNavigateToAddress,
  onNavigateToSettings,
  onNavigateToSupport,
  onNavigateToWishlist,
  onLogout,
  userProfile = { name: "Nguyễn Văn A", email: "nguyenva@example.com", avatar: "" },
  onUpdateProfile,
  theme,
  vouchers,
}: ProfileProps) {
  const [showVouchers, setShowVouchers] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingName, setEditingName] = useState(userProfile.name);
  const [editingAvatar, setEditingAvatar] = useState(userProfile.avatar);
  const [avatarFile, setAvatarFile] = useState<UploadImageFile | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const t = theme || ctxTheme || lightTheme;
  const userVouchers = vouchers && vouchers.length > 0 ? vouchers : AVAILABLE_VOUCHERS;

  const handleCopyVoucher = (code: string) => {
    showToast(`Đã sao chép mã ${code}`, 'success');
    setShowVouchers(false);
  };

  const handleEditProfile = () => {
    setEditingName(userProfile.name);
    setEditingAvatar(userProfile.avatar);
    setAvatarFile(null);
    setShowUrlInput(false);
    setAvatarUrl('');
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    if (!editingName.trim()) {
      showToast('Vui lòng nhập tên', 'error');
      return;
    }
    
    const updatedProfile: Partial<UserProfile> & { avatarFile?: UploadImageFile } = {
      name: editingName.trim(),
      avatar: editingAvatar.trim(),
      ...(avatarFile ? { avatarFile } : {}),
    };
    
    const doUpdate = async () => {
      try {
        if (onUpdateProfile) {
          const ok = await onUpdateProfile(updatedProfile);
          if (ok === false) {
            showToast('Cập nhật thất bại. Vui lòng thử lại.', 'error');
            return;
          }
        }
        setShowEditModal(false);
        showToast('Đã cập nhật thông tin cá nhân', 'success');
      } catch (err: any) {
        showToast(err?.message || 'Cập nhật thất bại. Vui lòng thử lại.', 'error');
      }
    };

    void doUpdate();
  };

  const handleCancelEdit = () => {
    setEditingName(userProfile.name);
    setEditingAvatar(userProfile.avatar);
    setAvatarFile(null);
    setShowEditModal(false);
  };

  const handlePickImage = () => {
    if (!launchImageLibrary) {
      // Nếu image picker chưa sẵn sàng, hiển thị option nhập URL
      setShowUrlInput(true);
      setAvatarUrl(editingAvatar);
      return;
    }

    const options = {
      mediaType: 'photo' as any,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        return;
      }
      
      if (response.errorCode) {
        showToast(`Không thể chọn ảnh: ${response.errorMessage || 'Unknown error'}`, 'error');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const imageUri = asset.uri;
        if (imageUri) {
          setEditingAvatar(imageUri);
          setAvatarFile({
            uri: imageUri,
            name: asset.fileName || 'avatar.jpg',
            type: asset.type || 'image/jpeg',
          });
          setShowUrlInput(false);
          setAvatarUrl('');
        }
      }
    });
  };

  const handleSaveUrl = () => {
    if (avatarUrl.trim()) {
      setEditingAvatar(avatarUrl.trim());
    }
    setShowUrlInput(false);
    setAvatarUrl('');
    setAvatarFile(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={t.card}
        translucent={true}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { 
            paddingTop: Math.max(insets.top + 24, 40),
            paddingBottom: Math.max(insets.bottom, 16) + 100,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Profile */}
        <View style={[
          styles.profileHeader, 
          { 
            borderColor: t.border, 
            backgroundColor: t.card,
            shadowOpacity: t === lightTheme ? 0.05 : 0,
            elevation: t === lightTheme ? 2 : 0,
          }
        ]}>
        <TouchableOpacity
          onPress={handleEditProfile}
          style={styles.avatarWrapper}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarContainer, { borderColor: t.primary }]}>
            {userProfile.avatar ? (
              <ImageWithFallback
                source={{ uri: userProfile.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: t.surface }]}>
                <AppIcon name="user" size={32} color={t.muted} />
              </View>
            )}
          </View>
          <View style={[styles.editAvatarBadge, { backgroundColor: t.primary }]}>
            <AppIcon name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.profileName, { color: t.text }]}>{userProfile.name}</Text>
            <TouchableOpacity
              onPress={handleEditProfile}
              style={styles.editNameButton}
              activeOpacity={0.7}
            >
              <AppIcon name="pencil" size={16} color={t.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileEmail, { color: t.muted }]}>{userProfile.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: t.card, borderColor: t.border }]}>
        <TouchableOpacity
          onPress={onNavigateToOrders}
          style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0 }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.statValue, { color: t.text }]}>{orderCount}</Text>
          <Text style={[styles.statLabel, { color: t.muted }]}>Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowVouchers(true)}
          style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0 }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.statValue, { color: t.text }]}>{userVouchers.length}</Text>
          <Text style={[styles.statLabel, { color: t.muted }]}>Voucher</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Groups */}
      <View style={styles.menuContainer}>
        <View style={[styles.menuGroup, { backgroundColor: t.card, shadowOpacity: t === lightTheme ? 0.05 : 0, borderColor: t.border }]}>
          <MenuItem
            icon="package"
            label="Đơn hàng của tôi"
            onPress={onNavigateToOrders}
            theme={t}
          />
          <View style={[styles.menuDivider, { backgroundColor: t.border }]} />
          <MenuItem
            icon="heart"
            label="Sản phẩm yêu thích"
            onPress={onNavigateToWishlist}
            theme={t}
          />
          <View style={[styles.menuDivider, { backgroundColor: t.border }]} />
          <MenuItem
            icon="map-pin"
            label="Sổ địa chỉ"
            onPress={onNavigateToAddress}
            theme={t}
          />
        </View>

        <View style={[styles.menuGroup, { backgroundColor: t.card, shadowOpacity: t === lightTheme ? 0.05 : 0, borderColor: t.border }]}>
          <MenuItem
            icon="settings"
            label="Cài đặt"
            onPress={onNavigateToSettings}
            theme={t}
          />
          <View style={[styles.menuDivider, { backgroundColor: t.border }]} />
          <MenuItem
            icon="help-circle"
            label="Trung tâm hỗ trợ"
            onPress={onNavigateToSupport}
            theme={t}
          />
        </View>

        <TouchableOpacity
          onPress={onLogout}
          style={[styles.logoutButton, { backgroundColor: t.card, borderColor: t.border }]}
          activeOpacity={0.7}
        >
          <AppIcon name="log-out" size={18} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: t.muted }]}>Version 1.0.0 (Build 2024)</Text>
      </ScrollView>

      {/* Vouchers Modal */}
      {showVouchers && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setShowVouchers(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowVouchers(false)}
            />
            <View style={[styles.bottomSheetContent, { backgroundColor: t.card, paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: t.text }]}>Kho Voucher của tôi</Text>
                <TouchableOpacity
                  onPress={() => setShowVouchers(false)}
                  activeOpacity={0.7}
                >
                  <AppIcon name="close" size={24} color={t.muted} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={styles.voucherList}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {userVouchers.length > 0 ? (
                  userVouchers.map((voucher) => {
                    const expireDate = voucher.expire ? new Date(voucher.expire) : null;
                    return (
                    <View key={voucher.code} style={[styles.voucherCard, { borderColor: t.border, backgroundColor: t.surface }]}>
                      <View style={[styles.voucherIconContainer, { backgroundColor: t.primary + '22' }]}>
                        <AppIcon name="ticket" size={24} color={t.primary} />
                      </View>
                      <View style={styles.voucherInfo}>
                        <Text style={[styles.voucherCode, { color: t.text }]}>{voucher.code}</Text>
                        <Text style={[styles.voucherDescription, { color: t.muted }]}>{voucher.description}</Text>
                        {expireDate && (
                          <Text style={[styles.voucherExpiry, { color: t.primary }]}>
                            HSD: {expireDate.toLocaleDateString('vi-VN')}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleCopyVoucher(voucher.code)}
                        style={[styles.voucherCopyButton, { backgroundColor: t.primary + '22' }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.voucherCopyText, { color: t.primary }]}>Sao chép</Text>
                      </TouchableOpacity>
                    </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyVoucherContainer}>
                    <AppIcon name="ticket-outline" size={48} color={t.muted} />
                    <Text style={[styles.emptyVoucherText, { color: t.text }]}>Không có mã giảm giá nào</Text>
                    <Text style={[styles.emptyVoucherSubtext, { color: t.muted }]}>Vui lòng kiểm tra lại sau</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.text }]}>Chỉnh sửa thông tin</Text>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <AppIcon name="close" size={24} color={t.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: t.text }]}>Tên</Text>
                <TextInput
                  value={editingName}
                  onChangeText={setEditingName}
                  style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
                  placeholder="Nhập tên của bạn"
                  placeholderTextColor={t.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: t.text }]}>Ảnh đại diện</Text>
                {!showUrlInput ? (
                  <>
                    <View style={styles.avatarPreviewContainer}>
                      {editingAvatar ? (
                        <Image source={{ uri: editingAvatar }} style={[styles.avatarPreview, { borderColor: t.border }]} />
                      ) : (
                        <View style={[styles.avatarPreviewPlaceholder, { backgroundColor: t.surface, borderColor: t.border }]}>
                          <AppIcon name="user" size={32} color={t.muted} />
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={handlePickImage}
                        style={[styles.pickImageButton, { backgroundColor: t.primary }]}
                        activeOpacity={0.8}
                      >
                        <AppIcon name="camera" size={18} color="#FFFFFF" />
                        <Text style={styles.pickImageText}>Chọn ảnh</Text>
                      </TouchableOpacity>
                    </View>
                    {!launchImageLibrary && (
                      <TouchableOpacity
                        onPress={() => setShowUrlInput(true)}
                        style={styles.urlInputToggle}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.urlInputToggleText, { color: t.primary }]}>Hoặc nhập URL ảnh</Text>
                      </TouchableOpacity>
                    )}
                    {editingAvatar && (
                      <TouchableOpacity
                        onPress={() => setEditingAvatar('')}
                        style={styles.removeImageButton}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.removeImageText, { color: t.muted }]}>Xóa ảnh</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View>
                    <TextInput
                      value={avatarUrl}
                      onChangeText={setAvatarUrl}
                      style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
                      placeholder="Nhập URL ảnh"
                      placeholderTextColor={t.muted}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    <View style={styles.urlInputActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowUrlInput(false);
                          setAvatarUrl('');
                        }}
                        style={[styles.urlActionButton, { borderColor: t.border }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.urlActionText, { color: t.muted }]}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSaveUrl}
                        style={[styles.urlActionButton, { backgroundColor: t.primary }]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.urlActionText, { color: '#FFFFFF' }]}>Lưu</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={[styles.modalButton, styles.cancelButton, { borderColor: t.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalButtonText, { color: t.muted }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: t.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ icon, label, onPress, theme }: { icon: string; label: string; onPress?: () => void; theme: Theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: theme.surface }]}>
          <AppIcon name={icon} size={16} color={theme.primary} />
        </View>
        <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <AppIcon name="chevron-right" size={16} color={theme.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderColor: '#E5E7EB',
  },
  avatarWrapper: {
    position: 'relative',
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
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  editNameButton: {
    padding: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
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
    borderWidth: 1,
    borderColor: 'transparent',
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    maxHeight: '85%',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: '80%',
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingBottom: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  avatarPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  avatarPreviewPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  pickImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  removeImageText: {
    fontSize: 12,
  },
  urlInputToggle: {
    marginTop: 8,
    paddingVertical: 4,
  },
  urlInputToggleText: {
    fontSize: 12,
  },
  urlInputActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  urlActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  urlActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyVoucherContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyVoucherText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyVoucherSubtext: {
    fontSize: 14,
  },
});
