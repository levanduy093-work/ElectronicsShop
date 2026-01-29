import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text, StatusBar, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Voucher } from '../types';
import { AVAILABLE_VOUCHERS } from '../constants/data';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { UploadImageFile } from '../services/api';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileMenu } from '../components/profile/ProfileMenu';
import { VoucherListModal } from '../components/profile/VoucherListModal';
import { EditProfileModal } from '../components/profile/EditProfileModal';

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
  const { t: translate } = useTranslation();
  const [showVouchers, setShowVouchers] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [fullImageUri, setFullImageUri] = useState<string>('');
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const t = theme || ctxTheme || lightTheme;
  const userVouchers = vouchers && vouchers.length > 0 ? vouchers : AVAILABLE_VOUCHERS;
  const voucherCount = vouchers?.length || 0;

  const handleCopyVoucher = (code: string) => {
    showToast(translate('copy_voucher_success', { code }), 'success');
    setShowVouchers(false);
  };

  const handleUpdateProfile = async (name: string, avatar: string, avatarFile: UploadImageFile | null) => {
    const updatedProfile: Partial<UserProfile> & { avatarFile?: UploadImageFile } = {
      name: name.trim(),
      avatar: avatar.trim(),
      ...(avatarFile ? { avatarFile } : {}),
    };

    try {
      if (onUpdateProfile) {
        const ok = await onUpdateProfile(updatedProfile);
        if (ok === false) {
          showToast(translate('update_failed'), 'error');
          return;
        }
      }
      setShowEditModal(false);
      showToast(translate('update_profile_success'), 'success');
    } catch (err: any) {
      showToast(err?.message || translate('update_failed'), 'error');
    }
  };

  const handleViewFullImage = (imageUri: string) => {
    if (imageUri) {
      setFullImageUri(imageUri);
      setShowFullImageModal(true);
    }
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
        <ProfileHeader
          userProfile={userProfile}
          onEditProfile={() => setShowEditModal(true)}
          onViewAvatar={handleViewFullImage}
          theme={t}
        />

        <ProfileStats
          orderCount={orderCount}
          voucherCount={voucherCount}
          onNavigateToOrders={() => onNavigateToOrders?.()}
          onShowVouchers={() => setShowVouchers(true)}
          theme={t}
        />

        <ProfileMenu
          onNavigateToOrders={() => onNavigateToOrders?.()}
          onNavigateToWishlist={() => onNavigateToWishlist?.()}
          onNavigateToAddress={() => onNavigateToAddress?.()}
          onNavigateToSettings={() => onNavigateToSettings?.()}
          onNavigateToSupport={() => onNavigateToSupport?.()}
          onLogout={() => onLogout?.()}
          theme={t}
        />

        <Text style={[styles.version, { color: t.muted }]}>Version 1.0.0 (Build 2024)</Text>
      </ScrollView>

      {/* Vouchers Modal */}
      <VoucherListModal
        visible={showVouchers}
        onClose={() => setShowVouchers(false)}
        vouchers={userVouchers}
        onCopyVoucher={handleCopyVoucher}
        theme={t}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialName={userProfile.name}
        initialAvatar={userProfile.avatar}
        onSave={handleUpdateProfile}
        onViewFullImage={handleViewFullImage}
        theme={t}
      />

      {/* Full Image View Modal */}
      <Modal
        visible={showFullImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImageModal(false)}
      >
        <View style={styles.fullImageModalOverlay}>
          <TouchableOpacity
            style={styles.fullImageModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFullImageModal(false)}
          />
          <View style={styles.fullImageModalContent}>
            <TouchableOpacity
              onPress={() => setShowFullImageModal(false)}
              style={[styles.fullImageCloseButton, { top: Math.max(insets.top + 20, 44) }]}
              activeOpacity={0.7}
            >
              <AppIcon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {fullImageUri ? (
              <Image
                source={{ uri: fullImageUri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
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
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 32,
    marginBottom: 16,
  },
  fullImageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImageModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fullImageCloseButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
