import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface PaymentMethodsProps {
  onBack: () => void;
  theme?: Theme;
}

export function PaymentMethods({ onBack, theme }: PaymentMethodsProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const t = theme || ctxTheme || lightTheme;
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<'card' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  if (isAdding) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={t.surface}
          translucent={true}
        />
        <View style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 0),
            backgroundColor: t.surface,
            borderBottomColor: t.border,
          }
        ]}>
          <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.backButton} activeOpacity={0.7}>
            <AppIcon name="arrow-left" size={24} color={t.muted} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>Thêm phương thức mới</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={[styles.content, { backgroundColor: t.background }]} 
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Tabs */}
          <View style={[styles.tabsContainer, { backgroundColor: t.surface }]}>
            <TouchableOpacity
              onPress={() => setAddType('card')}
              style={[
                styles.tab,
                addType === 'card' && { backgroundColor: t.card }
              ]}
              activeOpacity={0.7}
            >
              <AppIcon name="credit-card" size={16} color={addType === 'card' ? t.primary : t.muted} />
              <Text style={[styles.tabText, { color: addType === 'card' ? t.primary : t.muted }]}>
                Thẻ tín dụng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddType('wallet')}
              style={[
                styles.tab,
                addType === 'wallet' && { backgroundColor: t.card }
              ]}
              activeOpacity={0.7}
            >
              <AppIcon name="smartphone" size={16} color={addType === 'wallet' ? t.primary : t.muted} />
              <Text style={[styles.tabText, { color: addType === 'wallet' ? t.primary : t.muted }]}>
                Ví điện tử
              </Text>
            </TouchableOpacity>
          </View>

          {addType === 'card' ? (
            <View style={styles.cardForm}>
              {/* Card Preview */}
              <View style={[styles.cardPreview, { backgroundColor: t.primary }]}>
                <View style={styles.cardPreviewHeader}>
                  <Text style={styles.cardPreviewLabel}>Card Preview</Text>
                  {(cardNumber.startsWith('4') || cardNumber.startsWith('5')) && (
                    <Text style={styles.cardBrand}>
                      {cardNumber.startsWith('4') ? 'VISA' : 'MasterCard'}
                    </Text>
                  )}
                </View>
                <Text style={styles.cardNumberPreview}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
                <View style={styles.cardPreviewFooter}>
                  <View>
                    <Text style={styles.cardPreviewSmall}>Card Holder</Text>
                    <Text style={styles.cardPreviewValue}>
                      {cardHolder.toUpperCase() || 'YOUR NAME'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.cardPreviewSmall}>Expires</Text>
                    <Text style={styles.cardPreviewValue}>{expiry || 'MM/YY'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: t.text }]}>Số thẻ</Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={text => setCardNumber(formatCardNumber(text))}
                  placeholder="0000 0000 0000 0000"
                  style={[
                    styles.input,
                    styles.cardInput,
                    {
                      backgroundColor: t.surface,
                      borderColor: t.border,
                      color: t.text,
                    }
                  ]}
                  placeholderTextColor={t.muted}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: t.text }]}>Tên chủ thẻ</Text>
                <TextInput
                  value={cardHolder}
                  onChangeText={text => setCardHolder(text.toUpperCase())}
                  placeholder="NGUYEN VAN A"
                  style={[
                    styles.input,
                    {
                      backgroundColor: t.surface,
                      borderColor: t.border,
                      color: t.text,
                    }
                  ]}
                  placeholderTextColor={t.muted}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: t.text }]}>Ngày hết hạn</Text>
                  <TextInput
                    value={expiry}
                    onChangeText={text => setExpiry(formatExpiry(text))}
                    placeholder="MM/YY"
                    style={[
                      styles.input,
                      {
                        textAlign: 'center',
                        backgroundColor: t.surface,
                        borderColor: t.border,
                        color: t.text,
                      }
                    ]}
                    placeholderTextColor={t.muted}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: t.text }]}>CVV/CVC</Text>
                  <TextInput
                    value={cvv}
                    onChangeText={text => setCvv(text.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                    style={[
                      styles.input,
                      {
                        textAlign: 'center',
                        backgroundColor: t.surface,
                        borderColor: t.border,
                        color: t.text,
                      }
                    ]}
                    placeholderTextColor={t.muted}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={3}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsAdding(false)}
                style={[styles.addButton, { backgroundColor: t.primary }]}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Thêm thẻ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.walletForm}>
              <Text style={[styles.walletDescription, { color: t.muted }]}>Chọn ví điện tử bạn muốn liên kết:</Text>

              {['momo', 'zalo', 'shopee'].map((wallet) => {
                const walletNames: Record<string, { name: string; color: string }> = {
                  momo: { name: 'Ví MoMo', color: '#E91E63' },
                  zalo: { name: 'ZaloPay', color: '#0068FF' },
                  shopee: { name: 'ShopeePay', color: '#EE4D2D' },
                };

                const isSelected = selectedWallet === wallet;
                return (
                  <TouchableOpacity
                    key={wallet}
                    onPress={() => setSelectedWallet(wallet)}
                    style={[
                      styles.walletOption,
                      {
                        backgroundColor: t.card,
                        borderColor: isSelected ? t.primary : t.border,
                      },
                      isSelected && { backgroundColor: t.primary + '22' },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.walletIcon, { backgroundColor: walletNames[wallet].color + '20' }]}>
                      <Text style={[styles.walletIconText, { color: walletNames[wallet].color }]}>
                        {walletNames[wallet].name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={[styles.walletName, { color: t.text }]}>{walletNames[wallet].name}</Text>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: t.primary }]}>
                        <AppIcon name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => setIsAdding(false)}
                style={[styles.addButton, !selectedWallet && styles.addButtonDisabled, { backgroundColor: t.primary }]}
                disabled={!selectedWallet}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Liên kết ngay</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={t.surface}
        translucent={true}
      />
      <View style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.surface,
          borderBottomColor: t.border,
        }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Phương thức thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: t.background }]} contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}>
        {/* Visa Card */}
        <View style={[styles.cardDisplay, { backgroundColor: t.primary }]}>
          <View style={styles.cardDisplayHeader}>
            <Text style={styles.cardDisplayLabel}>Debit Card</Text>
            <Text style={styles.visaText}>VISA</Text>
          </View>
          <Text style={styles.cardDisplayNumber}>•••• •••• •••• 4589</Text>
          <View style={styles.cardDisplayFooter}>
            <View>
              <Text style={styles.cardDisplaySmall}>Card Holder</Text>
              <Text style={styles.cardDisplayValue}>NGUYEN VAN A</Text>
            </View>
            <View>
              <Text style={styles.cardDisplaySmall}>Expires</Text>
              <Text style={styles.cardDisplayValue}>12/28</Text>
            </View>
          </View>
        </View>

        {/* E-wallets */}
        <View style={[styles.walletsList, { backgroundColor: t.card, borderColor: t.border }]}>
          {[
            { name: 'Ví MoMo', phone: '090****567', color: '#E91E63' },
            { name: 'ZaloPay', phone: '090****567', color: '#0068FF' },
          ].map((wallet, i) => (
            <View key={i} style={[styles.walletItem, { borderBottomColor: t.border }]}>
              <View style={styles.walletItemLeft}>
                <View style={[styles.walletIconSmall, { backgroundColor: wallet.color + '20' }]}>
                  <Text style={[styles.walletIconTextSmall, { color: wallet.color }]}>
                    {wallet.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.walletItemName, { color: t.text }]}>{wallet.name}</Text>
                  <Text style={[styles.walletItemPhone, { color: t.muted }]}>Đã liên kết - {wallet.phone}</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <AppIcon name="trash" size={18} color={t.muted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          style={[
            styles.addNewButton,
            {
              borderColor: t.border,
              backgroundColor: t.card,
            }
          ]}
          activeOpacity={0.7}
        >
          <AppIcon name="plus" size={20} color={t.muted} />
          <Text style={[styles.addNewButtonText, { color: t.muted }]}>Thêm thẻ / Ví mới</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
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
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardForm: {
    gap: 16,
  },
  cardPreview: {
    borderRadius: 16,
    padding: 24,
    height: 192,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  cardNumberPreview: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewSmall: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardPreviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  cardInput: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletForm: {
    gap: 16,
  },
  walletDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  walletName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDisplay: {
    borderRadius: 16,
    padding: 24,
    height: 192,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardDisplayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDisplayLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  visaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDisplayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  cardDisplayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDisplaySmall: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardDisplayValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  walletsList: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  walletItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  walletIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletIconTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  walletItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  walletItemPhone: {
    fontSize: 12,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addNewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
