import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AiChatArchive } from '../types';
import { Theme, lightTheme } from '../theme';
import { TopBar } from '../components/layout/TopBar';
import { AppIcon } from '../components/common/Icon';

interface AIChatHistoryProps {
  theme?: Theme;
  archives: AiChatArchive[];
  onBack: () => void;
  onOpenArchive: (archiveId: string) => void;
  onDeleteArchive: (archiveId: string) => void;
  onClearAll: () => void;
}

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
};

export function AIChatHistory({
  theme = lightTheme,
  archives,
  onBack,
  onOpenArchive,
  onDeleteArchive,
  onClearAll,
}: AIChatHistoryProps) {
  const { t } = useTranslation();

  const handleDeleteOne = (archiveId: string) => {
    Alert.alert(
      t('clear_history'),
      t('confirm_delete_chat'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => onDeleteArchive(archiveId),
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      t('clear_history_all'),
      t('confirm_delete_all_chat'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear_history_all'),
          style: 'destructive',
          onPress: onClearAll,
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <TopBar
        title={t('chat_history')}
        showSearch={false}
        theme={theme}
      />

      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <AppIcon name="arrow-left" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={[styles.countText, { color: theme.muted }]}>{`${archives.length} đoạn chat`}</Text>
          {!!archives.length && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
              <Text style={[styles.clearAllText, { color: '#DC2626' }]}>{t('clear_history_all')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {!archives.length ? (
          <View style={styles.emptyWrap}>
            <AppIcon name="history" size={24} color={theme.muted} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>{t('no_history')}</Text>
          </View>
        ) : (
          <FlatList
            data={archives}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const firstAiReply = item.messages.find((m) => m.role === 'ai')?.content || '';
              return (
                <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
                  <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.preview, { color: theme.muted }]} numberOfLines={2}>
                    {firstAiReply || '...'}
                  </Text>
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    {`${item.messages.length} tin nhắn • ${formatDateTime(item.updatedAt)}`}
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => onOpenArchive(item.id)}
                      style={[styles.actionButton, { borderColor: theme.border }]}
                    >
                      <AppIcon name="eye" size={14} color={theme.text} />
                      <Text style={[styles.actionText, { color: theme.text }]}>Mở</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteOne(item.id)}
                      style={[styles.actionButton, { borderColor: '#FCA5A5' }]}
                    >
                      <AppIcon name="trash" size={14} color="#DC2626" />
                      <Text style={[styles.actionText, { color: '#DC2626' }]}>{t('delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  countText: { fontSize: 13, fontWeight: '500' },
  clearAllButton: { paddingVertical: 4, paddingHorizontal: 6 },
  clearAllText: { fontSize: 13, fontWeight: '600' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 14 },
  listContent: { paddingBottom: 20, gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  title: { fontSize: 16, fontWeight: '700' },
  preview: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 12 },
  actions: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
