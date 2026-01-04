import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface PaymentMethodsProps {
  onBack: () => void;
  theme?: Theme;
}

const VNPAY_COLOR = '#0F5CBF';

export function PaymentMethods({ onBack, theme }: PaymentMethodsProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const t = theme || ctxTheme || lightTheme;
  const accentBg = t === lightTheme ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)';
  const [hasVnpay, setHasVnpay] = useState(false);

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
        {!hasVnpay ? (
          <>
            <View style={[styles.emptyCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: accentBg }]}>
                <AppIcon name="credit-card" size={18} color={t.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: t.text }]}>Chưa liên kết VNPAY</Text>
              <Text style={[styles.emptyDesc, { color: t.muted }]}>
                Thêm VNPAY để thanh toán qua QR hoặc thẻ nội địa/quốc tế.
              </Text>
              <TouchableOpacity
                onPress={() => setHasVnpay(true)}
                style={[styles.primaryButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Thêm VNPAY</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: accentBg }]}>
                  <AppIcon name="shield" size={16} color={t.primary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: t.text }]}>Thanh toán an toàn</Text>
                  <Text style={[styles.infoDesc, { color: t.muted }]}>VNPAY hỗ trợ chuẩn bảo mật PCI DSS và OTP.</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: accentBg }]}>
                  <AppIcon name="smartphone" size={16} color={t.primary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: t.text }]}>Quét QR hoặc thẻ</Text>
                  <Text style={[styles.infoDesc, { color: t.muted }]}>Dùng app ngân hàng/ ví hỗ trợ QR, thẻ ATM, thẻ quốc tế.</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.noteText, { color: t.muted }]}>
              Lưu ý: Ứng dụng hiện chỉ hỗ trợ thanh toán qua VNPAY. Bạn cần liên kết VNPAY để tiếp tục thanh toán.
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.cardDisplay, { backgroundColor: VNPAY_COLOR }]}>
              <View style={styles.cardDisplayHeader}>
                <Text style={styles.cardDisplayLabel}>Cổng thanh toán</Text>
                <Text style={styles.brandText}>VNPAY</Text>
              </View>
              <Text style={styles.cardDisplayNumber}>QR Pay / Thẻ</Text>
              <View style={styles.cardDisplayFooter}>
                <View>
                  <Text style={styles.cardDisplaySmall}>Trạng thái</Text>
                  <Text style={styles.cardDisplayValue}>Đã kích hoạt</Text>
                </View>
                <View>
                  <Text style={styles.cardDisplaySmall}>Mặc định</Text>
                  <Text style={styles.cardDisplayValue}>VNPAY</Text>
                </View>
              </View>
            </View>

            <View style={[styles.walletsList, { backgroundColor: t.card, borderColor: t.border }]}>
              <View 
                style={[
                  styles.walletItem, 
                  { borderBottomColor: t.border, borderBottomWidth: 0 }
                ]}
              >
                <View style={styles.walletItemLeft}>
                  <View style={[styles.walletIconSmall, { backgroundColor: VNPAY_COLOR + '20' }]}>
                    <Text style={[styles.walletIconTextSmall, { color: VNPAY_COLOR }]}>VN</Text>
                  </View>
                  <View>
                    <Text style={[styles.walletItemName, { color: t.text }]}>VNPAY</Text>
                    <Text style={[styles.walletItemPhone, { color: t.muted }]}>Thanh toán qua QR, thẻ nội địa và thẻ quốc tế</Text>
                  </View>
                </View>
                <View style={[styles.checkCircle, { backgroundColor: t.primary }]}>
                  <AppIcon name="check" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: accentBg }]}>
                  <AppIcon name="shield" size={16} color={t.primary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: t.text }]}>Thanh toán an toàn</Text>
                  <Text style={[styles.infoDesc, { color: t.muted }]}>Mọi giao dịch được xử lý qua cổng VNPAY duy nhất.</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: accentBg }]}>
                  <AppIcon name="smartphone" size={16} color={t.primary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: t.text }]}>Hỗ trợ QR và thẻ</Text>
                  <Text style={[styles.infoDesc, { color: t.muted }]}>Quét mã QR hoặc thanh toán bằng thẻ nội địa/quốc tế của bạn.</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: accentBg }]}>
                  <AppIcon name="clock" size={16} color={t.primary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: t.text }]}>Kích hoạt sẵn</Text>
                  <Text style={[styles.infoDesc, { color: t.muted }]}>Không cần thêm thẻ hay ví khác - tất cả đơn hàng sẽ dùng VNPAY.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setHasVnpay(false)}
              style={[styles.secondaryButton, { borderColor: t.border, backgroundColor: t.card }]}
              activeOpacity={0.8}
            >
              <AppIcon name="trash" size={16} color={t.muted} />
              <Text style={[styles.secondaryButtonText, { color: t.muted }]}>Gỡ liên kết VNPAY</Text>
            </TouchableOpacity>

            <Text style={[styles.noteText, { color: t.muted }]}>
              Lưu ý: Ứng dụng hiện chỉ hỗ trợ thanh toán qua VNPAY. Nếu bạn cần đổi tài khoản thanh toán, vui lòng thực hiện trên cổng VNPAY của ngân hàng.
            </Text>
          </>
        )}
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
  cardDisplay: {
    borderRadius: 16,
    padding: 24,
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
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDisplayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardDisplayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
