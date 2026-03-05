import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AiChatArchive } from '../types';
import { Theme, lightTheme, useTheme } from '../theme';
import { AppIcon } from '../components/common/Icon';
import { useToast } from '../components/common/ToastProvider';

interface AIChatHistoryProps {
  theme?: Theme;
  archives: AiChatArchive[];
  onBack: () => void;
  onOpenArchive: (archiveId: string) => void;
  onDeleteArchive: (archiveId: string) => void;
  onClearAll: () => void;
}

type ConfirmState =
  | { type: 'single'; archiveId: string }
  | { type: 'all' }
  | null;

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
};

const buildArchiveCode = (archiveId: string) => {
  const cleaned = archiveId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const suffix = cleaned.slice(-6).padStart(6, '0');
  return `#CHAT-${suffix}`;
};

export function AIChatHistory({
  theme = lightTheme,
  archives,
  onBack,
  onOpenArchive,
  onDeleteArchive,
  onClearAll,
}: AIChatHistoryProps) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (confirmState) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [confirmState, modalAnim]);

  const palette = useMemo(
    () => ({
      bg: theme.isDark ? theme.background : '#F3F4F6',
      surface: theme.isDark ? '#1C1C1E' : '#FFFFFF',
      border: theme.isDark ? '#303033' : '#D9DDE4',
      text: theme.text,
      muted: theme.isDark ? '#A1A1AA' : '#6B7280',
      primary: theme.isDark ? '#60A5FA' : '#2563EB',
      detailBg: theme.isDark ? 'rgba(37,99,235,0.14)' : '#EFF6FF',
      badgeBg: theme.isDark ? 'rgba(251,191,36,0.16)' : '#FEF3C7',
      badgeText: theme.isDark ? '#FBBF24' : '#D97706',
      overlay: theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.32)',
      danger: '#DC2626',
      dangerSoft: '#FEECEC',
    }),
    [theme],
  );

  const confirmTitle =
    confirmState?.type === 'single' ? t('clear_history') : t('clear_history_all');
  const confirmMessageBase =
    confirmState?.type === 'single' ? t('confirm_delete_chat') : t('confirm_delete_all_chat');
  const confirmMessage = `${confirmMessageBase} ${t('action_cannot_undo')}`;
  const confirmPrimaryText = confirmState?.type === 'single' ? t('delete') : t('clear_history_all');

  const handleConfirm = () => {
    if (!confirmState) return;
    if (confirmState.type === 'single') {
      onDeleteArchive(confirmState.archiveId);
      showToast(t('chat_deleted'), 'success');
    } else {
      onClearAll();
      showToast(t('chat_all_deleted'), 'success');
    }
    setConfirmState(null);
  };

  const rootStyle = { backgroundColor: palette.bg };
  const headerStyle = {
    paddingTop: Math.max(insets.top, 0),
    backgroundColor: palette.surface,
    borderBottomColor: palette.border,
  };
  const listContainerStyle = {
    ...styles.listContent,
    backgroundColor: palette.bg,
  };
  const emptyCardStyle = { backgroundColor: palette.surface, borderColor: palette.border };
  const emptyIconStyle = { backgroundColor: palette.bg };
  const overlayStyle = { backgroundColor: palette.overlay };
  const modalCardStyle = {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    opacity: modalAnim,
    transform: [
      {
        scale: modalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  };
  const modalIconStyle = { backgroundColor: palette.dangerSoft };

  return (
    <View className="flex-1" style={rootStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={palette.surface}
      />

      <View className="flex-row items-center justify-between px-4 pb-3 border-b" style={headerStyle}>
        <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center" activeOpacity={0.75}>
          <AppIcon name="arrow-left" size={24} color={palette.muted} />
        </TouchableOpacity>

        <Text className="flex-1 ml-2 text-lg font-bold" style={{ color: palette.text }} numberOfLines={1}>
          {t('chat_history')}
        </Text>

        <TouchableOpacity
          onPress={() => setConfirmState({ type: 'all' })}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.75}
          disabled={!archives.length}
        >
          {archives.length ? (
            <AppIcon name="trash" size={23} color={palette.muted} />
          ) : (
            <View className="w-[22px] h-[22px]" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={archives}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={listContainerStyle}
        ListEmptyComponent={
          <View className="border rounded-2xl py-12 px-6 items-center" style={emptyCardStyle}>
            <View className="w-16 h-16 rounded-full items-center justify-center mb-3.5" style={emptyIconStyle}>
              <AppIcon name="history" size={26} color={palette.muted} />
            </View>
            <Text className="text-lg font-bold mb-1.5" style={{ color: palette.text }}>{t('no_history')}</Text>
            <Text className="text-sm text-center" style={{ color: palette.muted }}>
              Chưa có đoạn chat nào được lưu.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const previewMessages = item.messages
            .filter((m) => m.content?.trim())
            .slice(0, 2)
            .map((m) => m.content.trim());

          const cardStyle = { backgroundColor: palette.surface, borderColor: palette.border };
          const sectionDivider = { borderTopColor: palette.border };
          const codeStyle = { color: palette.muted };
          const previewStyle = { color: palette.text };
          const detailBtnStyle = { borderColor: palette.primary, backgroundColor: palette.detailBg };
          const detailTextStyle = { color: palette.primary };
          const deleteBtnStyle = {
            borderColor: palette.danger,
            backgroundColor: theme.isDark ? 'rgba(220,38,38,0.18)' : '#FEF2F2',
          };
          const deleteTextStyle = { color: palette.danger };

          return (
            <TouchableOpacity
              activeOpacity={0.94}
              onLongPress={() => setConfirmState({ type: 'single', archiveId: item.id })}
              delayLongPress={260}
              className="border rounded-2xl p-3.5"
              style={cardStyle}
            >
              <View className="flex-row justify-between items-start mb-2.5 gap-2">
                <View className="flex-1">
                  <Text className="text-[12px] font-bold mb-0.5 tracking-wide" style={codeStyle}>{buildArchiveCode(item.id)}</Text>
                  <Text className="text-[12px] font-medium" style={codeStyle}>{formatDateTime(item.updatedAt)}</Text>
                </View>
              </View>

              <View className="border-t pt-3 mb-3 gap-2 min-h-[52px]" style={sectionDivider}>
                {previewMessages.length ? (
                  previewMessages.map((line, index) => (
                    <Text
                      key={`${item.id}-${index}`}
                      className="text-sm leading-5"
                      style={previewStyle}
                      numberOfLines={1}
                    >
                      • {line}
                    </Text>
                  ))
                ) : (
                  <Text className="text-sm leading-5" style={previewStyle} numberOfLines={1}>
                    • {item.title}
                  </Text>
                )}
              </View>

              <View className="border-t mt-0.5 pt-3 px-1.5 flex-row items-center gap-5" style={sectionDivider}>
                <TouchableOpacity
                  onPress={() => onOpenArchive(item.id)}
                  className="flex-1 flex-row items-center justify-center gap-1 border rounded-xl px-3 py-3"
                  style={detailBtnStyle}
                  activeOpacity={0.8}
                >
                  <Text className="text-[13px] font-medium" style={detailTextStyle}>Xem chi tiết</Text>
                  <AppIcon name="chevron-right" size={14} color={palette.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConfirmState({ type: 'single', archiveId: item.id })}
                  className="flex-1 flex-row items-center justify-center gap-1 border rounded-xl px-3 py-3"
                  style={deleteBtnStyle}
                  activeOpacity={0.8}
                >
                  <AppIcon name="trash" size={13} color={palette.danger} />
                  <Text className="text-[13px] font-medium" style={deleteTextStyle}>Xóa đoạn chat</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={!!confirmState}
        transparent
        animationType="none"
        onRequestClose={() => setConfirmState(null)}
      >
        <View className="flex-1 justify-center items-center px-6">
          <TouchableOpacity
            style={[styles.modalBackdrop, overlayStyle]}
            activeOpacity={1}
            onPress={() => setConfirmState(null)}
          />
          <Animated.View className="w-full max-w-[360px] rounded-[20px] border px-5 pt-6 pb-3.5 items-center" style={modalCardStyle}>
            <View className="w-[82px] h-[82px] rounded-full items-center justify-center mb-4" style={modalIconStyle}>
              <AppIcon name="trash" size={28} color={palette.danger} />
            </View>
            <Text className="text-lg font-bold mb-2 text-center" style={{ color: palette.text }}>
              {confirmTitle}
            </Text>
            <Text className="text-sm leading-6 mb-4 text-center px-1.5" style={{ color: palette.muted }}>
              {confirmMessage}
            </Text>

            <TouchableOpacity
              onPress={handleConfirm}
              className="w-full rounded-2xl min-h-12 items-center justify-center mb-2.5 bg-red-500"
              activeOpacity={0.9}
            >
              <Text className="text-white text-sm font-semibold">{confirmPrimaryText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setConfirmState(null)}
              className="min-h-9 items-center justify-center px-4"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold" style={{ color: palette.muted }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
