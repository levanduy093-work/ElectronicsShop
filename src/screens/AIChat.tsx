import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_CHATS, ChatMessage } from '../lib/data';
import { MessageBubble } from '../components/ai/MessageBubble';
import { TopBar } from '../components/layout/TopBar';
import { AppIcon } from '../components/common/Icon';

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHATS);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Tôi đã nhận được yêu cầu của bạn. Bạn có thể cung cấp thêm thông tin chi tiết về sơ đồ mạch hoặc linh kiện bạn đang tìm kiếm không?",
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestions = ["Tư vấn linh kiện Arduino", "Scan sơ đồ mạch", "Tìm thay thế cho chip ESP8266"];

  return (
    <View style={styles.container}>
      <TopBar title="AI Engineer Support" showSearch={false} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <AppIcon name="sparkles" size={12} color="#9CA3AF" />
              <Text style={styles.typingText}>AI đang phân tích...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}>
          {/* Suggestion Chips */}
          {messages.length < 3 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsContainer}
              contentContainerStyle={styles.suggestionsContent}
            >
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => setInputValue(suggestion)}
                  style={styles.suggestionChip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.inputButton} activeOpacity={0.7}>
              <AppIcon name="file-upload" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Hỏi AI hoặc tải lên hình ảnh..."
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />

            {inputValue.trim() ? (
              <TouchableOpacity
                onPress={handleSend}
                style={styles.sendButton}
                activeOpacity={0.8}
              >
                <AppIcon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.inputButton} activeOpacity={0.7}>
                <AppIcon name="mic" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 44,
    marginTop: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    padding: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionsContent: {
    gap: 8,
    paddingRight: 16,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    maxHeight: 120,
    paddingVertical: 8,
  },
  inputButton: {
    padding: 8,
    borderRadius: 12,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
});
