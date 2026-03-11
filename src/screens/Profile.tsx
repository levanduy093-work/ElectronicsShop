import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StatusBar, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
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
import { TYPO_CLASS } from '../theme/typography';

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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
  onNavigateToAdmin?: () => void;
  onLogout?: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile> & { avatarFile?: UploadImageFile }) => Promise<boolean> | void;
  theme?: Theme;
  vouchers?: Voucher[];
  isAdmin?: boolean;
}

export function Profile({
  onNavigateToOrders,
  orderCount = 0,
  onNavigateToAddress,
  onNavigateToSettings,
  onNavigateToSupport,
  onNavigateToWishlist,
  onNavigateToAdmin,
  onLogout,
  userProfile = { name: "", email: "", avatar: "" },
  onUpdateProfile,
  theme,
  vouchers,
  isAdmin = false,
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

    // Optimistic UX: close modal & toast success immediately, send request in background
    setShowEditModal(false);
    showToast(translate('update_profile_success'), 'success');

    if (onUpdateProfile) {
      Promise.resolve(onUpdateProfile(updatedProfile)).catch((err: any) => {
        console.warn('Profile - update profile failed', err);
        showToast(err?.message || translate('update_failed'), 'error');
      });
    }
  };

  const handleViewFullImage = (imageUri: string) => {
    if (imageUri) {
      setFullImageUri(imageUri);
      setShowFullImageModal(true);
    }
  };

  const ZoomableAvatar = ({ uri }: { uri: string }) => {
    const MIN_SCALE = 1;
    const MAX_SCALE = 3;
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedX = useSharedValue(0);
    const savedY = useSharedValue(0);

    const pinch = Gesture.Pinch()
      .onBegin(() => {
        savedScale.value = scale.value;
      })
      .onUpdate((e) => {
        scale.value = clampValue(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
      })
      .onEnd(() => {
        if (scale.value <= 1.02) {
          scale.value = withTiming(1);
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);
        }
      });

    const pan = Gesture.Pan()
      .onBegin(() => {
        savedX.value = translateX.value;
        savedY.value = translateY.value;
      })
      .onUpdate((e) => {
        if (scale.value > 1) {
          translateX.value = savedX.value + e.translationX;
          translateY.value = savedY.value + e.translationY;
        }
      })
      .onEnd(() => {
        if (scale.value <= 1.02) {
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);
        }
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        const nextScale = scale.value > 1 ? 1 : 2;
        scale.value = withTiming(nextScale);
        if (nextScale === 1) {
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);
        }
      });

    const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return (
      <View className="w-full h-full items-center justify-center">
        <GestureDetector gesture={composed}>
          <Reanimated.View
            style={[
              { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
              animatedStyle,
            ]}
          >
            <Image
              source={{ uri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </Reanimated.View>
        </GestureDetector>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={t.card}
        translucent={true}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: Math.max(insets.top + 24, 40),
          paddingBottom: Math.max(insets.bottom, 16) + 100,
        }}
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
          onNavigateToAdmin={isAdmin ? onNavigateToAdmin : undefined}
          isAdmin={isAdmin}
          theme={t}
        />

        <Text className={`${TYPO_CLASS.helper} text-center mt-8 mb-4`} style={{ color: t.muted }}>Version 1.0.0 (Build 2024)</Text>
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
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setShowFullImageModal(false)}
          />
          <View className="w-full h-full justify-center items-center">
            <TouchableOpacity
              onPress={() => setShowFullImageModal(false)}
              className="absolute right-5 z-10 p-2 rounded-xl bg-black/50"
              style={{ top: Math.max(insets.top + 20, 44) }}
              activeOpacity={0.7}
            >
              <AppIcon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {fullImageUri ? (
              <ZoomableAvatar uri={fullImageUri} />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
