import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChatMessage } from '../../lib/data';
import { AppIcon } from '../common/Icon';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      <View style={[styles.contentWrapper, isUser && styles.contentWrapperUser]}>
        {/* Avatar */}
        {!isUser && (
          <View style={styles.avatar}>
            <AppIcon name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAI,
          ]}>
            <Text style={[
              styles.messageText,
              isUser && styles.messageTextUser,
            ]}>
              {message.content}
            </Text>
          </View>

          {/* Metadata for AI */}
          {!isUser && (
            <View style={styles.metadata}>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <AppIcon name="copy" size={12} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  containerUser: {
    alignItems: 'flex-end',
  },
  contentWrapper: {
    flexDirection: 'row',
    maxWidth: '85%',
    gap: 12,
  },
  contentWrapperUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderTopRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111827',
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
